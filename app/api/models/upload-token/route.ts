import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { blobEnabled } from '@/app/lib/blobStorage'
import { getModelById } from '@/app/lib/database/database'
import { MAX_MODEL_BYTES, modelFileFolder } from '@/app/lib/modelFileUtils'

// A failure on our side (e.g. the database is down), reported as 500 instead of a 400 "Model not found"
class ServerError extends Error {
    constructor(cause: unknown) { super('Could not check the model. Please try again.', { cause }) }
}

// Gives a model's owner permission to upload ONE .glb for that model straight to our Vercel Blob store.
// The path must be models/m<modelId>/…, so the file is tied to that model (see modelFileFolder).
// The file never passes through this server (Vercel caps requests at 4.5MB). Afterwards the browser sends the
// file's URL to /api/models/[id]/file, which checks the file before attaching it to the model.
export async function POST(request: Request) {
    if (!blobEnabled()) return Response.json({ error: 'File storage is not set up' }, { status: 501 })

    let body: HandleUploadBody
    try {
        body = await request.json()
    } catch {
        return Response.json({ error: 'Bad request' }, { status: 400 })
    }

    try {
        const result = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                const session = await getServerSession(authOptions)
                if (!session) throw new Error('Log in to upload a 3D model')
                const modelId = Number(/^models\/m(\d+)\/[^/]+\.glb$/.exec(pathname)?.[1])
                if (!Number.isInteger(modelId)) throw new Error('Invalid file name')
                let model
                try {
                    model = await getModelById(modelId)
                } catch (error) {
                    // getModelById throws "… not found" for a missing row; anything else is a server problem
                    if (!(error instanceof Error && /not found/i.test(error.message))) throw new ServerError(error)
                    model = null
                }
                // Same answer for "missing" and "not yours", so ids of other people's models aren't confirmed
                if (!model || model.userId !== Number(session.user.id) || !pathname.startsWith(`${modelFileFolder({ modelId })}/`)) {
                    throw new Error('Model not found')
                }
                return {
                    allowedContentTypes: ['model/gltf-binary', 'application/octet-stream'],
                    maximumSizeInBytes: MAX_MODEL_BYTES,
                    addRandomSuffix: true,
                    tokenPayload: JSON.stringify({ userId: session.user.id, modelId }),
                }
            },
            // Nothing to do here: the browser attaches the file itself (this callback can't reach localhost anyway)
            onUploadCompleted: async () => {},
        })
        return Response.json(result)
    } catch (err: unknown) {
        if (err instanceof ServerError) {
            console.error('Upload token failed:', err.cause)
            return Response.json({ error: err.message }, { status: 500 })
        }
        return Response.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 400 })
    }
}
