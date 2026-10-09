import 'server-only'
import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'printforge.db')

const db = new Database(dbPath,{ verbose: console.log })
db.pragma('journal_mode = WAL')
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    email        TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    createdAt    TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)
export default db