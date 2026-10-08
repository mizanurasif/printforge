import 'server-only'
import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'printforge.db')

const db = new Database(dbPath,{ verbose: console.log })
db.pragma('journal_mode = WAL')

export default db