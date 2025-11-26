import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromCookies } from "@/lib/auth";
import type { Transaction } from "@/types/transaction";
import type { Account } from "@/types/account";

export async function GET() {
  const userId = await getUserIdFromCookies();

  if (!userId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
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

const transactions = db
  .prepare(
    `
    SELECT *
    FROM transactions
    WHERE fromAccountId = ?
       OR toAccountId = ?
       OR relatedTransactionId IN (
            SELECT id FROM transactions
            WHERE fromAccountId = ? OR toAccountId = ?
       )
    ORDER BY createdAt DESC
    `
  )
  .all(account.id, account.id, account.id, account.id) as Transaction[];


  return NextResponse.json(transactions);
}
