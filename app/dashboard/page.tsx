"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string;
  email: string;
  accountId: string;
  balance: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/account/me");

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        const data = await res.json();
        setUser(data);
        setLoading(false);
      } catch {
        router.replace("/login");
      }
    }

    loadUser();
  }, [router]);

  if (loading) {
    return <p className="warning">Carregando...</p>;
  }

  if (!user) {
    return <p className="warning">Erro ao carregar dados.</p>;
  }

  return (
    <div className="main">
      <h1>Dashboard</h1>

      <div className="card">
        <h2>Olá, {user.name}!</h2>
        <p>Email: {user.email}</p>
        <p>
          Id da Conta: <strong>{user.accountId}</strong>
        </p>
        <p className="text-big">
          <strong>
            Saldo:{" "}
            {Number(user.balance).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </strong>
        </p>
      </div>

      <div className="button-group">
        <button
          onClick={() => router.push("/account/deposit")}
          className="primary"
        >
          Fazer Depósito
        </button>

        <button
          onClick={() => router.push("/account/transfer")}
          className="primary"
        >
          Transferir
        </button>

        <button
          onClick={() => router.push("/account/history")}
          className="primary"
        >
          Histórico
        </button>
      </div>
    </div>
  );
}
