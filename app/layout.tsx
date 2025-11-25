export const metadata = {
  title: "Carteira Financeira",
  description: "Aplicação de carteira digital",
};

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        <nav className="navbar">
          <h1 className="logo">Carteira Financeira</h1>

          <div className="nav-links">
            <a href="/dashboard">Dashboard</a>
            <a href="/account/deposit">Depósito</a>
            <a href="/account/transfer">Transferência</a>
            <a href="/account/history">Histórico</a>
            <a href="/login">Sair</a>
          </div>
        </nav>

        <main className="content">{children}</main>
      </body>
    </html>
  );
}
