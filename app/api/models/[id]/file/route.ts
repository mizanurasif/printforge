import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/app/lib/auth'
import { getModelById, setModelFile } from '@/app/lib/database/database'
import { deleteModelFile, MAX_MODEL_BYTES, ModelFileError, saveModelFile } from '@/app/lib/modelFileUtils'

// Uploads (or replaces) a model's .glb. The body is the raw file, not a form.
// This is a Route Handler rather than a Server Action because .glb files are big: Server Actions are
// capped at 6MB (next.config.ts), while here the body streams straight to disk.
// proxy.ts only matches /dashboard, so it doesn't buffer this body either.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: 'Log in to upload a 3D model' }, { status: 401 })
    const userId = Number(session.user.id)

    const { id } = await params
    let model
    try {
        model = await getModelById(id)
    } catch {
        return Response.json({ error: 'Model not found' }, { status: 404 })
    }
    // Same answer as a missing model, so ids of other people's models aren't confirmed
    if (model.userId !== userId) return Response.json({ error: 'Model not found' }, { status: 404 })

    // Reject obviously oversized uploads before reading anything; saveModelFile still counts the real bytes
    if (Number(request.headers.get('content-length')) > MAX_MODEL_BYTES) {
        return Response.json({ error: '3D model must be 50MB or smaller' }, { status: 413 })
    }
    if (!request.body) return Response.json({ error: 'No file received' }, { status: 400 })

    let modelFile: string
    try {
        //request.body is the stream of bytes the browser is sending.
        modelFile = await saveModelFile(request.body, model.category) //save model file
    } catch (err: unknown) {
        if (err instanceof ModelFileError) return Response.json({ error: err.message }, { status: 400 })
        console.error('Failed to save model file:', err)
        return Response.json({ error: 'Could not save the 3D model. Please try again.' }, { status: 500 })
    }

    // setModelFile only matches this user's model, which re-checks ownership at write time
    const oldFile = await setModelFile({ modelId: model.id, userId, modelFile })
    if (oldFile === undefined) {
        await deleteModelFile(modelFile)   // don't leave an orphaned file
        return Response.json({ error: 'Model not found' }, { status: 404 })
    }
    await deleteModelFile(oldFile)

    revalidatePath('/dashboard')
    revalidatePath(`/3d-models/${model.id}`)
    return Response.json({ modelFile })
}
