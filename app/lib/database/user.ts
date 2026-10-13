import 'server-only'
import sql from './db'
import bcrypt from 'bcryptjs'
import { Model } from '../models';

export type User = { id: number; name: string; email: string; passwordHash: string; createdAt: Date }

export async function getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await sql<User[]>`
        SELECT * FROM users WHERE email = ${email.toLowerCase()}
    `
    return user
}

export async function getUserById(id: number): Promise<User | undefined> {
    const [user] = await sql<User[]>`
        SELECT * FROM users WHERE id = ${id}
    `
    return user
}

export type PublicUser = { id: number; name: string; createdAt: Date }

// For public pages: only the fields anyone may see (no email, no password hash)
export async function getPublicUserById(id: number): Promise<PublicUser | undefined> {
    const [user] = await sql<PublicUser[]>`
        SELECT id, name, created_at FROM users WHERE id = ${id}
    `
    return user
}

// Deletes the user and all their models in one transaction.
// Returns the deleted models' image paths (so the files can be removed), or null if the user didn't exist
export async function deleteUser(id: number): Promise<string[] | null> {
    return sql.begin(async (tx) => {
        // models.user_id is ON DELETE SET NULL, so delete the models explicitly rather than orphaning them
        const models = await tx<{ image: string }[]>`
            DELETE FROM models WHERE user_id = ${id} RETURNING image
        `
        const [user] = await tx`DELETE FROM users WHERE id = ${id} RETURNING id`
        return user ? models.map((m) => m.image) : null
    })
}

export async function createUser(name: string, email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10)    // 10 = salt rounds
    const [user] = await sql<{ id: number }[]>`
        INSERT INTO users ${sql({ name, email: email.toLowerCase(), passwordHash })}
        RETURNING id
    `
    return user
}

export async function  getUserModelsByID(userID:number) {
    const userModels = await sql<Model[]>`
        SELECT u.name AS creator_name , m.*
        FROM users u 
        JOIN models m ON u.id = m.user_id
        WHERE u.id = ${userID}::int
        ORDER BY m.likes DESC
        `
    return userModels
}
