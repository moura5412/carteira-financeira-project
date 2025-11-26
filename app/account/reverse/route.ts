import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromCookies } from "@/lib/auth";
import type { Transaction } from "@/types/transaction";
import type { Account } from "@/types/account";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromCookies();
    if (!userId)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { transactionId } = await req.json();

    if (!transactionId)
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const original = db
      .prepare("SELECT * FROM transactions WHERE id = ?")
      .get(transactionId) as Transaction | undefined;

    if (!original)
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      );

    if (original.relatedTransactionId)
      return NextResponse.json(
        { error: "Transação já foi revertida" },
        { status: 400 }
      );

    const account = db
      .prepare("SELECT * FROM accounts WHERE userId = ?")
      .get(userId) as Account | undefined;

    if (!account)
      return NextResponse.json(
        { error: "Conta não encontrada" },
        { status: 404 }
      );

    const reversalId = crypto.randomUUID();

    const insertReversal = db.prepare(`
      INSERT INTO transactions
      (id, type, amount, fromAccountId, toAccountId, relatedTransactionId, createdAt)
      VALUES (?, 'REVERSAL', ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const updateBalance = db.prepare(`
      UPDATE accounts SET balance = balance + ? WHERE id = ?
    `);

    const updateOriginal = db.prepare(`
      UPDATE transactions SET relatedTransactionId = ? WHERE id = ?
    `);

    const tx = db.transaction(() => {
      const from = original.toAccountId;
      const to = original.fromAccountId;

      insertReversal.run(
        reversalId,
        original.amount,
        from,
        to,
        original.id
      );

      updateOriginal.run(reversalId, original.id);

      if (original.fromAccountId === account.id) {
        updateBalance.run(original.amount, account.id);
      }

      if (original.toAccountId === account.id) {
        updateBalance.run(-original.amount, account.id);
      }
    });

    tx();

    return NextResponse.json({
      message: "Operação revertida com sucesso.",
    });
  } catch (err) {
    console.error("Erro reversão:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
