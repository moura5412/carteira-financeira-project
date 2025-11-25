export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

import { db } from "@/lib/db";
import { registerSchema } from "@/schemas/auth";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = db.prepare(
      "SELECT * FROM users WHERE email = ?"
    ).get(email);

    if (existing) {
      return NextResponse.json(
        { error: "E-mail já cadastrado" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const userId = randomUUID();
    const accountId = randomUUID();

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password)
      VALUES (?, ?, ?, ?)
    `);
    insertUser.run(userId, name, email, hashed);

    const insertAccount = db.prepare(`
      INSERT INTO accounts (id, userId, balance)
      VALUES (?, ?, 0)
    `);
    insertAccount.run(accountId, userId);

    const token = signToken({ userId });
    setAuthCookie(token);

    return NextResponse.json(
      { id: userId, name, email },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
