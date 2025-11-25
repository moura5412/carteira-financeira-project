export default function HomePage() {
  return (
    <div className="main">
      <h1>Carteira Financeira</h1>

      <p>Bem-vindo! Escolha uma opção:</p>

      <div className="button-group">
        <a href="/login" className="button primary">
          Login
        </a>

        <a href="/register" className="button primary">
          Cadastro
        </a>
      </div>
    </div>
  );
}
