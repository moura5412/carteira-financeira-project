import Database from "better-sqlite3";

// Conecta no banco
const db = new Database("dev.db");

// Ativa foreign keys
db.pragma("foreign_keys = ON");

// USERS
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

// ACCOUNTS
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    userId TEXT UNIQUE NOT NULL,
    balance REAL DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id)
  )
`);

// TRANSACTIONS
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    fromAccountId TEXT,
    toAccountId TEXT,
    relatedTransactionId TEXT UNIQUE,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fromAccountId) REFERENCES accounts(id),
    FOREIGN KEY (toAccountId) REFERENCES accounts(id),
    FOREIGN KEY (relatedTransactionId) REFERENCES transactions(id)
  )
`);

console.log("✔ Banco migrado com sucesso!");
