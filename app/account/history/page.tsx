"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  type: "DEPOSIT" | "TRANSFER" | "REVERSAL";
  amount: number;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  createdAt?: string;
  relatedTransactionId?: string | null;
}

export default function HistoryPage() {
  const router = useRouter();
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/account/history");

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        const json = await res.json();
        setData(json);
        setLoading(false);
      } catch {
        router.replace("/login");
      }
    }

    load();
  }, [router]);

  if (loading) {
    return <p className="warning">Carregando histórico...</p>;
  }

  return (
    <div className="main">
      <h1>Histórico de Transações</h1>

      {data.length === 0 && <p>Nenhuma transação encontrada.</p>}

      <ul>
        {data.map((t) => (
          <li key={t.id} className="card">
            <p className="text-big">
              <strong>
                {t.type === "DEPOSIT" && "💰 Depósito"}
                {t.type === "TRANSFER" && "🔁 Transferência"}
                {t.type === "REVERSAL" && "↩️ Reversão"}
              </strong>
            </p>

            <p>
              Valor: <strong>R$ {t.amount}</strong>
            </p>

            {t.createdAt && (
              <p>Data: {new Date(t.createdAt).toLocaleString()}</p>
            )}

            {t.type === "TRANSFER" && (
              <>
                <p>De: {t.fromAccountId}</p>
                <p>Para: {t.toAccountId}</p>
              </>
            )}

            {t.type === "REVERSAL" && (
              <p>Transação original: {t.relatedTransactionId}</p>
            )}
          </li>
        ))}
      </ul>

      <button onClick={() => router.push("/dashboard")} className="primary">
        Voltar
      </button>
    </div>
  );
}
