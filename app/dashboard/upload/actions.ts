'use server'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { authOptions } from '../../lib/auth'
import { getAllCategories } from '../../lib/database/categories'
import { createModel, deleteModel } from '@/app/lib/database/database'
import { revalidatePath } from 'next/cache'
import { deleteImage, saveImage } from '@/app/lib/imageUtils'
import { deleteModelFile } from '@/app/lib/modelFileUtils'
import { checkImage, modelDetailsSchema, PLACEHOLDER_IMAGE } from '@/app/lib/modelValidation'


export type UploadState = {
    error?: string
    // The saved model's id, returned instead of redirecting: the browser still has to send its .glb
    // to /api/models/[id]/file (upload, and edit when the file is replaced)
    modelId?: number
    fieldErrors?: Partial<Record<'name' | 'description' | 'category' | 'image' | 'modelFile', string[]>>
}


export async function deleteModelAction(modelId: number) {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const deleted = await deleteModel({ modelId, userId: Number(session.user.id) })
    if (deleted === null) return { error: 'Model not found' }

    await deleteImage(deleted.image)
    await deleteModelFile(deleted.modelFile)
    revalidatePath('/dashboard')
    return {}
}
export async function uploadModel(_prevState: UploadState, formData: FormData): Promise<UploadState> {
    // Server Actions are public endpoints, so check the session here too (proxy.ts only guards pages)
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login?callbackUrl=/dashboard/upload')

    const parsed = modelDetailsSchema.safeParse({
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
    const imageError = checkImage(image)
    if (imageError) fieldErrors.image = [imageError]

    // Every model needs a 3D file. The file itself goes to /api/models/[id]/file next (too big for a Server Action),
    // and the browser deletes the model again if that upload fails
    if (formData.get('hasModelFile') !== '1') fieldErrors.modelFile = ['Choose a 3D model (.glb)']

    if (!parsed.success || Object.keys(fieldErrors).length > 0) {
        return { fieldErrors }
    }

    let savedImage: string | null = null
    try {
        if (image instanceof File && image.size > 0) savedImage = await saveImage(image)
    } catch {
        return { fieldErrors: { image: ['This image could not be saved. Try a different picture.'] } }
    }

    let modelId: number
    try {
        modelId = await createModel({ ...parsed.data, image: savedImage ?? PLACEHOLDER_IMAGE, userId: Number(session.user.id) })
    } catch (err: unknown) {
        console.error('Failed to create model:', err)
        if (savedImage) await deleteImage(savedImage)   // don't leave an orphaned file
        return { error: 'Could not create model. Please try again.' }
    }

    revalidatePath('/dashboard')
    // The browser uploads the .glb next, then navigates itself
    return { modelId }
}
