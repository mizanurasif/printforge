import 'server-only'
import postgres from 'postgres'

// Reuse one connection pool across hot reloads in development
const globalForDb = globalThis as unknown as { sql?: postgres.Sql }

const sql = globalForDb.sql ?? postgres(process.env.DATABASE_URL!, {
    transform: postgres.camel,   // date_added (SQL) <-> dateAdded (JS)
})

if (process.env.NODE_ENV !== 'production') globalForDb.sql = sql

export default sql

/*
A global var is globalThis -> unknown _ > ts { sql?: postgres.Sql }
x ?? y -> if x is null/undefine run Y
sql = existingconnectiondb ?? create new connection
postgres.camel configures automatic conversion between SQL (snake_case) column names and JavaScript property names(cammelCase).
*/