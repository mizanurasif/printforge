import 'server-only'
import sql from './db'
import bcrypt from 'bcryptjs'
import { Model } from '../models';
import { likedByMe } from './database';

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
// Returns the deleted models' image and 3D file paths (so the files can be removed), or null if the user didn't exist
export async function deleteUser(id: number): Promise<{ image: string, modelFile: string | null }[] | null> {
    return sql.begin(async (tx) => {
        // models.user_id is ON DELETE SET NULL, so delete the models explicitly rather than orphaning them
        const models = await tx<{ image: string, modelFile: string | null }[]>`
            DELETE FROM models WHERE user_id = ${id} RETURNING image, model_file
        `
        const [user] = await tx`DELETE FROM users WHERE id = ${id} RETURNING id`
        return user ? models : null
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

// One page of a user's models, most liked first; m.id breaks ties so no model shows up on two pages
export async function getUserModels({ userId, page, modelsPerPage, viewerId }: {
    userId: number
    page: number
    modelsPerPage: number
    viewerId?: number
}): Promise<Model[]> {
    return await sql<Model[]>`
        SELECT m.*, u.name AS creator_name, ${likedByMe(viewerId)}
        FROM models m
        JOIN users u ON u.id = m.user_id
        WHERE m.user_id = ${userId}
        ORDER BY m.likes DESC, m.id ASC
        LIMIT ${modelsPerPage} OFFSET ${(page - 1) * modelsPerPage}
    `
}

export type UserModelStats = { modelCount: number, totalLikes: number, topModel: { name: string, likes: number } | null }

// Totals over all of a user's models, not just the page being shown
export async function getUserModelStats(userId: number): Promise<UserModelStats> {
    const [[totals], [topModel]] = await Promise.all([
        sql<{ modelCount: number, totalLikes: number }[]>`
            SELECT COUNT(*)::int AS model_count, COALESCE(SUM(likes), 0)::int AS total_likes
            FROM models WHERE user_id = ${userId}
        `,
        sql<{ name: string, likes: number }[]>`
            SELECT name, likes FROM models WHERE user_id = ${userId}
            ORDER BY likes DESC, id ASC LIMIT 1
        `,
    ])
    return { ...totals, topModel: topModel ?? null }
}

export async function  getUserModelsByID(userID:number, viewerId?: number) {
    const userModels = await sql<Model[]>`
        SELECT u.name AS creator_name , m.*, ${likedByMe(viewerId)}
        FROM users u 
        JOIN models m ON u.id = m.user_id
        WHERE u.id = ${userID}::int
        ORDER BY m.likes DESC
        `
    return userModels
}
