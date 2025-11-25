"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TransferPage() {
  const router = useRouter();

  const [accountIdDestino, setAccountIdDestino] = useState("");
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
      const res = await fetch("/api/account/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountIdDestino, amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao realizar transferência.");
        setLoading(false);
        return;
      }

      setSuccess("Transferência realizada com sucesso!");
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
      <h1>Transferência</h1>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="ID da conta destino"
          value={accountIdDestino}
          onChange={(e) => setAccountIdDestino(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Valor da transferência"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min={1}
          step="0.01"
          required
        />

        {error && <div className="error">{error}</div>}
        {success && <div className="sucess">{success}</div>}

        <button type="submit" disabled={loading} className="primary">
          {loading ? "Enviando..." : "Transferir"}
        </button>
      </form>

      <p>
        <a href="/dashboard">Voltar ao Dashboard</a>
      </p>
    </div>
  );
}
