'use server'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getModelById, setModelFile, updateModel } from '@/app/lib/database/database'
import { deleteImage, saveImage } from '@/app/lib/imageUtils'
import { moveModelFile } from '@/app/lib/modelFileUtils'
import { authOptions } from '@/app/lib/auth'
import { getAllCategories } from '@/app/lib/database/categories'
import type { UploadState } from '@/app/dashboard/upload/actions'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']

const uploadSchema = z.object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters').max(80, 'Name must be 80 characters or less'),
    description: z.string().trim().min(10, 'Description must be at least 10 characters').max(500, 'Description must be 500 characters or less'),
    category: z.string().min(1, 'Choose a category'),
})

export async function editModel(_prevState: UploadState, formData: FormData): Promise<UploadState> {
    // Server Actions are public endpoints, so check the session here too (proxy.ts only guards pages)
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login?callbackUrl=/dashboard')
    const userId = Number(session.user.id)

    const modelId = Number(formData.get('modelId'))
    if (!Number.isInteger(modelId) || modelId <= 0) return { error: 'Model not found' }

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

    // Image is optional: an empty file means "keep the current image"
    const image = formData.get('image')
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

    // Read the old file paths from the database BEFORE updating (afterwards they're the new ones),
    // and never from the form, so a crafted request can't make us delete someone else's file
    let current
    try {
        current = await getModelById(modelId)
    } catch {
        return { error: 'Model not found' }
    }
    // Every model needs a 3D file: one without (e.g. uploaded before files were required) must get one now
    if (!current.modelFile && formData.get('hasModelFile') !== '1') {
        return { fieldErrors: { modelFile: ['Choose a 3D model (.glb)'] } }
    }

    const newImage = image instanceof File && image.size > 0 ? await saveImage(image) : undefined

    // updateModel only matches this user's model, which is the ownership check
    const updatedId = await updateModel({ ...parsed.data, image: newImage, modelId, userId })
    if (updatedId === null) {
        if (newImage) await deleteImage(newImage)   // don't leave an orphaned file
        return { error: 'Could not update model. Please try again.' }
    }
    if (newImage) await deleteImage(current.image)

    // The .glb lives in its category's folder, so follow a category change
    if (current.modelFile && current.category !== parsed.data.category) {
        try {
            const moved = await moveModelFile(current.modelFile, parsed.data.category)
            if (moved !== current.modelFile) await setModelFile({ modelId, userId, modelFile: moved })
        } catch (err: unknown) {
            // The file still works from its old folder, so don't fail the whole edit
            console.error('Failed to move model file:', err)
        }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/3d-models/${modelId}`)
    // The browser uploads the new .glb next, then navigates itself
    if (formData.get('hasModelFile') === '1') return { modelId }
    redirect(`/3d-models/${modelId}`)
}
