import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { generateGlb, GenerationError } from '@/app/lib/hunyuan'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']

// One generation at a time per user: each one uses the shared free GPU quota.
// Kept in memory, which works because this app runs as a single server (next dev / next start).
const running = new Set<number>()

// Generation can wait in the Space's queue; hosts that cap request time read this
export const maxDuration = 300

// Image in (multipart form, field "image"), .glb out. Nothing is saved: the browser previews the result,
// and only if the user keeps it does it go through the normal upload (uploadModel + /api/models/[id]/file).
// A Route Handler rather than a Server Action, because the response is a binary file.
export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: 'Log in to generate a 3D model' }, { status: 401 })
    const userId = Number(session.user.id)

    if (running.has(userId)) {
        return Response.json({ error: 'You already have a model generating. Wait for it to finish.' }, { status: 429 })
    }
    // The form adds a little on top of the image itself
    if (Number(request.headers.get('content-length')) > MAX_IMAGE_BYTES + 64 * 1024) {
        return Response.json({ error: 'Image must be 5MB or smaller' }, { status: 413 })
    }

    let image: FormDataEntryValue | null
    try {
        image = (await request.formData()).get('image')
    } catch {
        return Response.json({ error: 'No image received' }, { status: 400 })
    }
    if (!(image instanceof File) || image.size === 0) return Response.json({ error: 'Choose an image' }, { status: 400 })
    if (!IMAGE_TYPES.includes(image.type)) return Response.json({ error: 'Image must be PNG, JPG or WebP' }, { status: 400 })
    if (image.size > MAX_IMAGE_BYTES) return Response.json({ error: 'Image must be 5MB or smaller' }, { status: 413 })

    running.add(userId)
    try {
        const glb = await generateGlb(image)
        return new Response(glb, { headers: { 'Content-Type': 'model/gltf-binary' } })
    } catch (err: unknown) {
        if (err instanceof GenerationError) return Response.json({ error: err.message }, { status: 502 })
        console.error('Failed to generate model:', err)
        return Response.json({ error: 'Could not generate the model. Please try again.' }, { status: 500 })
    } finally {
        running.delete(userId)
    }
}
