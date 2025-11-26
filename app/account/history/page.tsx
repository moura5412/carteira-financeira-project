"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  type: "DEPOSIT" | "TRANSFER" | "REVERSAL";
  amount: number;
  fromAccountId: string | null;
  toAccountId: string | null;
  createdAt?: string;
  relatedTransactionId: string | null;
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

  if (loading) return <p className="warning">Carregando histórico...</p>;

  async function handleReverse(id: string) {
    const res = await fetch("/api/account/reverse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId: id }),
    });

    const data = await res.json();
    alert(data.message || data.error);
    window.location.reload();
  }

  const transactions = data;

  return (
    <div className="main">
      <h1>Histórico de Transações</h1>

      {transactions.length === 0 && <p>Nenhuma transação encontrada.</p>}

      <ul>
        {transactions.map((t) => {
          const isReversedOriginal =
            t.relatedTransactionId !== null && t.type !== "REVERSAL";

          return (
            <li key={t.id} className="card">
              <p className="text-big">
                <strong>
                  {t.type === "DEPOSIT" && "💰 Depósito"}
                  {t.type === "TRANSFER" && "🔁 Transferência"}
                  {t.type === "REVERSAL" && "↩️ Reversão"}
                </strong>
              </p>

              <p className="text-small">ID: {t.id}</p>

              <p>
                Valor: <strong>R$ {Number(t.amount).toFixed(2)}</strong>
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

              {isReversedOriginal && (
                <p className="error">⚠️ Operação Revertida</p>
              )}

              {!isReversedOriginal && t.type !== "REVERSAL" && (
                <button className="danger" onClick={() => handleReverse(t.id)}>
                  Reverter
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <button onClick={() => router.push("/dashboard")} className="primary">
        Voltar
      </button>
    </div>
  );
}
