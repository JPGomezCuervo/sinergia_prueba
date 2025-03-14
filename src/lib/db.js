import Database from "better-sqlite3";

export const db = new Database("devdb.sqlite");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    user_password TEXT NOT NULL,
    user_name TEXT UNIQUE NOT NULL
  );
`);

export function getUserByEmail(email) {
  try {
    const query = db.prepare("SELECT user_email, user_password FROM users WHERE user_email = ?");
    return query.get(email) || null;
  } catch (err) {
    console.error("[DB ERROR] getUserByEmail: ", err.message);
    return null;
  }
}

export function createUser({ email, password, name }) {
  try {
    const query = db.prepare("INSERT INTO users (user_name, user_email, user_password) VALUES (?, ?, ?)");
    const info = query.run(name, email, password);
    return info.changes > 0;
  } catch (err) {
    console.error("[DB ERROR] createUser: ", err.message);
    return false;
  }
}
