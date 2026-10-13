'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { setModelLike } from '@/app/lib/database/likes'

// Likes (liked = true) or unlikes a model for the logged-in user.
// Exported from a 'use server' file, so it's a public endpoint: every input is re-checked here.
export async function toggleLikeAction(modelId: number, liked: boolean): Promise<{ likes: number } | { error: 'unauthenticated' | 'not-found' }> {
    const session = await getServerSession(authOptions)
    const userId = Number(session?.user.id)
    if (!session || !Number.isInteger(userId)) return { error: 'unauthenticated' }

    if (!Number.isInteger(modelId) || typeof liked !== 'boolean') return { error: 'not-found' }

    const likes = await setModelLike({ userId, modelId, liked: liked })
    return likes === null ? { error: 'not-found' } : { likes }
}
