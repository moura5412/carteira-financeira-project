import Database from "better-sqlite3";

export const db = new Database("dev.db");

db.pragma("foreign_keys = ON");
