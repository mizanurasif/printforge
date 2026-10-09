import 'server-only'
import db from './db'
import bcrypt from 'bcryptjs'

export type User = { id: number; name: string; email: string; passwordHash: string }

export function getUserByEmail(email: string) {
  return db.prepare('SELECT * FROM users WHERE email = ?')
           .get(email.toLowerCase()) as User | undefined   // cast, same lesson as result.count
}

export async function createUser(name: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10)    // 10 = salt rounds
  return db.prepare('INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)')
           .run(name, email.toLowerCase(), passwordHash)
}