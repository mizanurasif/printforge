'use server'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { authOptions } from '../../lib/auth'
import { getAllCategories } from '../../lib/database/categories'
import { createModel, deleteModel } from '@/app/lib/database/database'
import { revalidatePath } from 'next/cache'
import { deleteImage, saveImage } from '@/app/lib/imageUtils'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const PLACEHOLDER_IMAGE = '/img/placeholder.png'

const uploadSchema = z.object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters').max(80, 'Name must be 80 characters or less'),
    description: z.string().trim().min(10, 'Description must be at least 10 characters').max(500, 'Description must be 500 characters or less'),
    category: z.string().min(1, 'Choose a category'),
})


export type UploadState = {
    error?: string
    fieldErrors?: Partial<Record<'name' | 'description' | 'category' | 'image', string[]>>
}


export async function deleteModelAction(modelId: number) {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const imagePath = await deleteModel({ modelId, userId: Number(session.user.id) })
    if (imagePath === null) return { error: 'Model not found' }

    await deleteImage(imagePath)
    revalidatePath('/dashboard')
    return {}
}
export async function uploadModel(_prevState: UploadState, formData: FormData): Promise<UploadState> {
    // Server Actions are public endpoints, so check the session here too (proxy.ts only guards pages)
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login?callbackUrl=/dashboard/upload')

    const parsed = uploadSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        category: formData.get('category'),
    })
    const fieldErrors: UploadState['fieldErrors'] = parsed.success ? {} : z.flattenError(parsed.error).fieldErrors

    // Category must be one that really exists, not whatever the browser sent
    const category = formData.get('category')
    if (parsed.success) {
        const categories = await getAllCategories()
        if (!categories.some((c) => c.slug === category)) {
            fieldErrors.category = ['Choose a valid category']
        }
    }

    // Image is optional for now: without one, the placeholder image is used
    const image  = formData.get('image')
    if (image instanceof File && image.size > 0) {
        if (!IMAGE_TYPES.includes(image.type)) {
            fieldErrors.image = ['Image must be PNG, JPG or WebP']
        } else if (image.size > MAX_IMAGE_BYTES) {
            fieldErrors.image = ['Image must be 5MB or smaller']
        }
    }

    if (!parsed.success || Object.keys(fieldErrors).length > 0) {
        return { fieldErrors }
    }

    const savedImage = image instanceof File && image.size > 0 ? await saveImage(image) : null

    let modelId: number
    try {
        modelId = await createModel({ ...parsed.data, image: savedImage ?? PLACEHOLDER_IMAGE, userId: Number(session.user.id) })
    } catch (err: unknown) {
        console.error('Failed to create model:', err)
        if (savedImage) await deleteImage(savedImage)   // don't leave an orphaned file
        return { error: 'Could not create model. Please try again.' }
    }

    revalidatePath('/dashboard')
    redirect(`/3d-models/${modelId}`)
}
