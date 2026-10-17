import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { authOptions } from '@/app/lib/auth'
import { getAllCategories } from '@/app/lib/database/categories'
import { createModel } from '@/app/lib/database/database'
import { deleteImage, saveImage } from '@/app/lib/imageUtils'
import { deleteModelFile, MAX_MODEL_BYTES, ModelFileError, saveModelFile } from '@/app/lib/modelFileUtils'
import { checkImage, MAX_IMAGE_BYTES, modelDetailsSchema, PLACEHOLDER_IMAGE } from '@/app/lib/modelValidation'
import type { UploadState } from '@/app/dashboard/upload/actions'

// Creates a model and its .glb in ONE request (multipart: name, description, category, image, modelFile).
// Used for generated models: the model row is only inserted once both files are saved, so an
// interrupted save (page reload, closed tab, lost connection) never leaves a model without its 3D file.
// A Route Handler, not a Server Action: the body holds the whole .glb, and proxy.ts doesn't match /api.
export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: 'Log in to save a model' }, { status: 401 })
    const userId = Number(session.user.id)

    // The form adds a little on top of the two files
    if (Number(request.headers.get('content-length')) > MAX_MODEL_BYTES + MAX_IMAGE_BYTES + 64 * 1024) {
        return Response.json({ error: '3D model must be 50MB or smaller' }, { status: 413 })
    }

    let formData: FormData
    try {
        formData = await request.formData()
    } catch {
        return Response.json({ error: 'Nothing was received. Please try again.' }, { status: 400 })
    }

    const parsed = modelDetailsSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        category: formData.get('category'),
    })
    const fieldErrors: UploadState['fieldErrors'] = parsed.success ? {} : z.flattenError(parsed.error).fieldErrors

    // Category must be one that really exists, not whatever the browser sent
    if (parsed.success) {
        const categories = await getAllCategories()
        if (!categories.some((c) => c.slug === parsed.data.category)) fieldErrors.category = ['Choose a valid category']
    }

    const image = formData.get('image')
    const imageError = checkImage(image)
    if (imageError) fieldErrors.image = [imageError]

    const modelFile = formData.get('modelFile')
    if (!(modelFile instanceof File) || modelFile.size === 0) fieldErrors.modelFile = ['The 3D model is missing']

    if (!parsed.success || Object.keys(fieldErrors).length > 0) {
        return Response.json({ fieldErrors }, { status: 400 })
    }

    // Save both files first, then the row; undo the files if a later step fails
    const savedImage = image instanceof File && image.size > 0 ? await saveImage(image) : null
    let savedFile: string
    try {
        savedFile = await saveModelFile((modelFile as File).stream(), parsed.data.category)
    } catch (err: unknown) {
        if (savedImage) await deleteImage(savedImage)
        if (err instanceof ModelFileError) return Response.json({ fieldErrors: { modelFile: [err.message] } }, { status: 400 })
        console.error('Failed to save model file:', err)
        return Response.json({ error: 'Could not save the 3D model. Please try again.' }, { status: 500 })
    }

    let modelId: number
    try {
        modelId = await createModel({ ...parsed.data, image: savedImage ?? PLACEHOLDER_IMAGE, modelFile: savedFile, userId })
    } catch (err: unknown) {
        console.error('Failed to create model:', err)
        if (savedImage) await deleteImage(savedImage)
        await deleteModelFile(savedFile)
        return Response.json({ error: 'Could not create model. Please try again.' }, { status: 500 })
    }

    revalidatePath('/dashboard')
    revalidatePath('/3d-models')
    return Response.json({ modelId }, { status: 201 })
}
