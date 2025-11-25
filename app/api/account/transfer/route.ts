import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromCookies } from "@/lib/auth";
import { randomUUID } from "crypto";
import type { Account } from "@/types/account";
import type { User } from "@/types/user";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromCookies();

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, toEmail } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Informe um valor válido para transferência" },
        { status: 400 }
      );
    }

    if (!toEmail) {
      return NextResponse.json(
        { error: "Informe o e-mail do destinatário" },
        { status: 400 }
      );
    }

    const fromAccount = db
      .prepare("SELECT * FROM accounts WHERE userId = ?")
      .get(userId) as Account | undefined;

    if (!fromAccount) {
      return NextResponse.json(
        { error: "Conta de origem não encontrada" },
        { status: 404 }
      );
    }

    const toUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(toEmail) as User | undefined;

    if (!toUser) {
      return NextResponse.json(
        { error: "Usuário destinatário não encontrado" },
        { status: 404 }
      );
    }

    const toAccount = db
      .prepare("SELECT * FROM accounts WHERE userId = ?")
      .get(toUser.id) as Account | undefined;

    if (!toAccount) {
      return NextResponse.json(
        { error: "Conta do destinatário não encontrada" },
        { status: 404 }
      );
    }

    if (fromAccount.balance < amount) {
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 }
      );
    }

    const newFromBalance = fromAccount.balance - amount;
    const newToBalance = toAccount.balance + amount;

    db.prepare("UPDATE accounts SET balance = ? WHERE id = ?").run(
      newFromBalance,
      fromAccount.id
    );

    db.prepare("UPDATE accounts SET balance = ? WHERE id = ?").run(
      newToBalance,
      toAccount.id
    );

    const transactionId = randomUUID();

    db.prepare(
      `INSERT INTO transactions (id, type, amount, fromAccountId, toAccountId)
       VALUES (?, 'TRANSFER', ?, ?, ?)`
    ).run(transactionId, amount, fromAccount.id, toAccount.id);

    return NextResponse.json({
      message: "Transferência realizada com sucesso",
      transactionId,
      newBalance: newFromBalance,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
