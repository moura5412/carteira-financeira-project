"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DepositPage() {
  const router = useRouter();

  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/account/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao realizar depósito.");
        setLoading(false);
        return;
      }

      setSuccess(`Depósito realizado! Novo saldo: R$ ${data.balance}`);
      setLoading(false);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <div className="main">
      <h1>Depósito</h1>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="number"
          placeholder="Valor do depósito"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
          min={1}
          step="0.01"
        />

        {error && <div className="error">{error}</div>}
        {success && <div className="sucess">{success}</div>}

        <button type="submit" disabled={loading} className="primary">
          {loading ? "Processando..." : "Depositar"}
        </button>
      </form>

      <p>
        <a href="/dashboard">Voltar ao Dashboard</a>
      </p>
    </div>
  );
}
