import { NextRequest, NextResponse } from "next/server";
import { db } from "@//lib/db";
import { getUserIdFromCookies } from "@/lib/auth";
import { randomUUID } from "crypto";
import type { Transaction } from "@/types/transaction";
import type { Account } from "@/types/account";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromCookies();

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { error: "ID da transação é obrigatório" },
        { status: 400 }
      );
    }

    const original = db
      .prepare("SELECT * FROM transactions WHERE id = ?")
      .get(transactionId) as Transaction | undefined;

    if (!original) {
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      );
    }

    const account = db
      .prepare("SELECT * FROM accounts WHERE userId = ?")
      .get(userId) as Account | undefined;

    if (!account) {
      return NextResponse.json(
        { error: "Conta não encontrada" },
        { status: 404 }
      );
    }

    // REVERSÃO DE DEPÓSITO
    if (original.type === "DEPOSIT") {
      const newBalance = account.balance - original.amount;

      if (newBalance < 0) {
        return NextResponse.json(
          { error: "Reversão inválida: saldo negativo" },
          { status: 400 }
        );
      }

      db.prepare("UPDATE accounts SET balance = ? WHERE id = ?").run(
        newBalance,
        account.id
      );
    }

    // REVERSÃO DE TRANSFERÊNCIA
    if (original.type === "TRANSFER") {
      const fromAccount = db
        .prepare("SELECT * FROM accounts WHERE id = ?")
        .get(original.fromAccountId!) as Account | undefined;

      const toAccount = db
        .prepare("SELECT * FROM accounts WHERE id = ?")
        .get(original.toAccountId!) as Account | undefined;

      if (!fromAccount || !toAccount) {
        return NextResponse.json(
          { error: "Contas relacionadas não existem mais" },
          { status: 404 }
        );
      }

      if (toAccount.balance < original.amount) {
        return NextResponse.json(
          { error: "Conta destino não possui saldo para reversão" },
          { status: 400 }
        );
      }

      db.prepare("UPDATE accounts SET balance = ? WHERE id = ?").run(
        toAccount.balance - original.amount,
        toAccount.id
      );

      db.prepare("UPDATE accounts SET balance = ? WHERE id = ?").run(
        fromAccount.balance + original.amount,
        fromAccount.id
      );
    }

    const reversalId = randomUUID();

    db.prepare(
      `INSERT INTO transactions (id, type, amount, relatedTransactionId)
       VALUES (?, 'REVERSAL', ?, ?)`
    ).run(reversalId, original.amount, original.id);

    return NextResponse.json({
      message: "Transação revertida com sucesso",
      reversalId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
