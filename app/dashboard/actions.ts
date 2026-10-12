'use server'

import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/app/lib/auth'
import { deleteUser, getUserById } from '@/app/lib/database/user'
import { deleteImage } from '@/app/lib/imageUtils'

// Deletes the logged-in user's own account, after re-checking their password.
// The caller signs out afterwards: the JWT session cookie outlives the database row.
export async function deleteAccountAction(password: string): Promise<{ error?: string }> {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login?callbackUrl=/dashboard')

    const userId = Number(session.user.id)
    const user = Number.isInteger(userId) ? await getUserById(userId) : undefined
    if (!user) return { error: 'Account not found' }

    // A password prompt means a stolen or unattended session can't wipe the account
    if (typeof password !== 'string' || !(await bcrypt.compare(password, user.passwordHash))) {
        return { error: 'Incorrect password' }
    }

    const images = await deleteUser(userId)
    if (images === null) return { error: 'Account not found' }

    await Promise.all(images.map(deleteImage))
    revalidatePath('/', 'layout')   // their models disappear from every listing
    return {}
}
