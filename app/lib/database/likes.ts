import 'server-only'
import sql from './db'

// Likes or unlikes a model for one user, keeping models.likes in sync with the likes table.
// Returns the model's new like count, or null if the model doesn't exist.
export async function setModelLike({ userId, modelId, liked }: {
    userId: number
    modelId: number
    liked: boolean
}): Promise<number | null> {
    return await sql.begin(async (tx) => {
        // Lock the model row so two likes at the same moment can't miscount
        const [model] = await tx`SELECT id FROM models WHERE id = ${modelId} FOR UPDATE`
        if (!model) return null

        // The (user_id, model_id) primary key makes a repeated like or unlike change nothing
        const changed = liked
            ? await tx`
                INSERT INTO likes (user_id, model_id) VALUES (${userId}, ${modelId})
                ON CONFLICT DO NOTHING
                RETURNING model_id
            `
            : await tx`
                DELETE FROM likes WHERE user_id = ${userId} AND model_id = ${modelId}
                RETURNING model_id
            `
        const delta = changed.length === 0 ? 0 : liked ? 1 : -1

        const [updated] = await tx<{ likes: number }[]>`
            UPDATE models SET likes = likes + ${delta}
            WHERE id = ${modelId}
            RETURNING likes
        `
        return updated.likes
    })
}
