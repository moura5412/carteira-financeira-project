import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromCookies } from "@/lib/auth";
import { randomUUID } from "crypto";
import type { Account } from "@/types/account";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromCookies();

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Informe um valor válido para depósito" },
        { status: 400 }
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

    const newBalance = account.balance + amount;

    db.prepare("UPDATE accounts SET balance = ? WHERE id = ?").run(
      newBalance,
      account.id
    );

    const transactionId = randomUUID();

    db.prepare(
      `INSERT INTO transactions (id, type, amount, toAccountId)
       VALUES (?, 'DEPOSIT', ?, ?)`
    ).run(transactionId, amount, account.id);

    return NextResponse.json({
      message: "Depósito realizado com sucesso",
      balance: newBalance,
      transactionId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
