import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { blobEnabled } from '@/app/lib/blobStorage'
import { BLOB_MODELS_FOLDER, MAX_MODEL_BYTES } from '@/app/lib/modelFileUtils'

// Gives a logged-in browser permission to upload ONE .glb straight to our Vercel Blob store.
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
                if (!pathname.startsWith(`${BLOB_MODELS_FOLDER}/`) || !pathname.endsWith('.glb')) throw new Error('Invalid file name')
                return {
                    allowedContentTypes: ['model/gltf-binary', 'application/octet-stream'],
                    maximumSizeInBytes: MAX_MODEL_BYTES,
                    addRandomSuffix: true,
                    tokenPayload: JSON.stringify({ userId: session.user.id }),
                }
            },
            // Nothing to do here: the browser attaches the file itself (this callback can't reach localhost anyway)
            onUploadCompleted: async () => {},
        })
        return Response.json(result)
    } catch (err: unknown) {
        return Response.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 400 })
    }
}
