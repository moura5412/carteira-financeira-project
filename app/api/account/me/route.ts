import { NextResponse } from "next/server";
import { getUserIdFromCookies } from "@/lib/auth";
import { db } from "@/lib/db";
import type { User } from "@/types/user";
import type { Account } from "@/types/account";

export async function GET() {
  const userId = await getUserIdFromCookies();

  if (!userId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(userId) as User | undefined;

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const account = db
    .prepare("SELECT * FROM accounts WHERE userId = ?")
    .get(userId) as Account | undefined;

  if (!account) {
    return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    balance: account.balance,
  });
}
