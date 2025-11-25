import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromCookies } from "@/lib/auth";
import type { Account } from "@/types/account";

export async function POST(req: NextRequest) {
  try {
    // Autenticação
    const userId = await getUserIdFromCookies();
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { accountIdDestino, amount } = body;

    if (!accountIdDestino || !amount || amount <= 0) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const accountOrigem = db
      .prepare("SELECT * FROM accounts WHERE userId = ?")
      .get(userId) as Account | undefined;

    if (!accountOrigem) {
      return NextResponse.json(
        { error: "Conta de origem não encontrada" },
        { status: 404 }
      );
    }

    if (accountOrigem.balance < amount) {
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 }
      );
    }

    const accountDestino = db
      .prepare("SELECT * FROM accounts WHERE id = ?")
      .get(accountIdDestino) as Account | undefined;

    if (!accountDestino) {
      return NextResponse.json(
        { error: "Conta destino não encontrada" },
        { status: 404 }
      );
    }

    const txId = crypto.randomUUID();

    const updateOrigem = db.prepare(
      "UPDATE accounts SET balance = balance - ? WHERE id = ?"
    );

    const updateDestino = db.prepare(
      "UPDATE accounts SET balance = balance + ? WHERE id = ?"
    );

    const insertTx = db.prepare(`
      INSERT INTO transactions (id, type, amount, fromAccountId, toAccountId)
      VALUES (?, 'TRANSFER', ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      updateOrigem.run(amount, accountOrigem.id);
      updateDestino.run(amount, accountDestino.id);
      insertTx.run(txId, amount, accountOrigem.id, accountDestino.id);
    });

    transaction();

    return NextResponse.json({
      message: "Transferência realizada com sucesso",
      transactionId: txId,
    });
  } catch (err) {
    console.error("ERRO INTERNO NA TRANSFERÊNCIA:", err);
    return NextResponse.json(
      { error: "Erro interno", details: String(err) },
      { status: 500 }
    );
  }
}
