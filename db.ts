import { createClient } from "@libsql/client";

export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Initialize schema if not exists
export async function initDB() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS cookies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      value TEXT NOT NULL
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL
    )
  `);
}

// Cookies
export async function addCookie(value: string) {
  await turso.execute("INSERT INTO cookies (value) VALUES (?)", [value]);
}
export async function listCookies() {
  const res = await turso.execute("SELECT value FROM cookies");
  return res.rows.map(r => r.value as string);
}

// Credentials
export async function addCredential(username: string, password: string) {
  await turso.execute(
    "INSERT INTO credentials (username, password) VALUES (?, ?)",
    [username, password]
  );
}
export async function listCredentials() {
  const res = await turso.execute("SELECT username, password FROM credentials");
  return res.rows.map(r => ({
    username: r.username as string,
    password: r.password as string,
  }));
}
