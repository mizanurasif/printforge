/*
The file sends a picture to Tencent's free Hunyuan3D-2 demo on Hugging Face and gets a .glb file back. It does this in 4 steps, and each step is one HTTP request:

1. POST /upload                      → send the picture, get back its path on their server
2. POST /call/shape_generation       → "start making a 3D model from that picture", get back a job id
3. GET  /call/shape_generation/{id}  → wait for the job to finish, get back the result's path
4. GET  /file={path}                 → download the .glb file


Summary

┌─────────────────────────────────┬─────────────────────────────────────────────────┐
│              Part               │                       Job                       │
├─────────────────────────────────┼─────────────────────────────────────────────────┤
│ uploadImage                     │ step 1: picture → pa
├─────────────────────────────────┼─────────────────────────────────────────────────┤
│ generateGlb (start fetch)       │ step 2: path + setti
├─────────────────────────────────┼─────────────────────────────────────────────────┤
│ waitForResult                   │ step 3: job id → res
├─────────────────────────────────┼─────────────────────────────────────────────────┤
│ generateGlb (download + checks) │ step 4: path → checked .glb bytes               │
├─────────────────────────────────┼─────────────────────
│ GenerationError                 │ marks messages that are safe to show the user   │
├─────────────────────────────────┼─────────────────────────────────────────────────┤
│ AbortSignal.timeout             │ one 5-minute limit for all of it                │
└─────────────────────────────────┴─────────────────────
*/



import 'server-only'
import { MAX_MODEL_BYTES } from './modelFileUtils'

// Turns one picture into an untextured 3D mesh (.glb) with Tencent's free Hunyuan3D-2 demo on Hugging Face.
// The Space is a Gradio app, so this uses Gradio's HTTP API: upload the image, queue the job, wait, download.
const SPACE_URL = 'https://tencent-hunyuan3d-2.hf.space'
// Includes the time spent waiting in the Space's queue when it's busy
const TIMEOUT_MS = 5 * 60 * 1000

const UNAVAILABLE = 'The 3D generator is unavailable right now. Please try again later.'

// A problem safe to show the user
export class GenerationError extends Error {}

// Optional: a free Hugging Face token gets a bigger daily GPU quota than anonymous calls
function authHeaders(): Record<string, string> {
    return process.env.HF_TOKEN ? { Authorization: `Bearer ${process.env.HF_TOKEN}` } : {}
}

// Returns the image's path on the Space, which the job then refers to
async function uploadImage(image: File, signal: AbortSignal): Promise<string> {
    const form = new FormData()
    form.append('files', image) //This builds a multipart form, the same format a normal <input type="file"> sends. Gradio expects the field to be called files.
    //This sends the form. signal connects the request to the 5-minute timer: if time runs out, the request is cancelled.
    const res = await fetch(`${SPACE_URL}/upload`, { method: 'POST', headers: authHeaders(), body: form, signal })
    if (!res.ok) {
        console.error(`Hunyuan3D image upload failed: ${res.status}`)
        throw new GenerationError(UNAVAILABLE)
    }
    const [path] = await res.json() as string[]
    return path
}

// Gradio streams the job as Server-Sent Events ("event: <name>\ndata: <json>") and ends with "complete" or "error"
async function waitForResult(eventId: string, signal: AbortSignal): Promise<unknown[]> {
    /*
    This opens a connection for the job. The server keeps the connection open while the job runs and sends updates as Server-Sent Events (SSE), which are lines of text like:
    event: heartbeat
    data: null
    event: complete
    data: [{"__type__":"update","value":{"path":"/tmp/gradio/xyz/white_mesh.glb", ...}}, ...]
    */
    const res = await fetch(`${SPACE_URL}/call/shape_generation/${eventId}`, { headers: authHeaders(), signal })
    const text = await res.text()
    /*
    This finds every event: X / data: Y pair and keeps the last one, the final answer.
        - (\w+) captures the event name, so last[1] is "complete" or "error".
        - (.*) captures the data, so last[2] is the JSON text.
        - \r?\n handles both Windows and Linux line endings.
        - g means find all matches; m lets ^ and $ match at the start and end of each line.
    */
    const last = [...text.matchAll(/^event: (\w+)\r?\ndata: (.*)$/gm)].at(-1)
    if (last?.[1] === 'complete') return JSON.parse(last[2])

    // Failures usually come with data: null; running out of ZeroGPU quota comes with a message
    let message: string | null = null
    try {
        const data = JSON.parse(last?.[2] ?? 'null')
        message = typeof data === 'string' ? data : data?.error ?? null
    } catch {}
    console.error('Hunyuan3D generation failed:', message ?? text.slice(0, 500))
    throw new GenerationError(message && /quota/i.test(message)
        ? 'The free GPU quota is used up for now. Please try again later.'
        : 'The 3D generator could not turn this image into a model. Try a clear picture of a single object.')
}

export async function generateGlb(image: File): Promise<ArrayBuffer> {
    const signal = AbortSignal.timeout(TIMEOUT_MS)
    //This creates one 5-minute timer shared by all 4 requests. The limit is 5 minutes in total, not 5 minutes for each request.
    try {
        const imagePath = await uploadImage(image, signal)

        // The inputs in the order the Space's /shape_generation endpoint lists them
        const start = await fetch(`${SPACE_URL}/call/shape_generation`, {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [
                null,                                                    // caption: text prompt, not used
                { path: imagePath, meta: { _type: 'gradio.FileData' } }, // the picture
                null, null, null, null,                                  // front/back/left/right views, multi-view mode only
                30,     // steps
                5,      // guidance scale
                1234,   // seed (replaced, see the last input)
                256,    // octree resolution: how detailed the mesh is
                true,   // remove the background first
                8000,   // number of chunks
                true,   // randomize the seed
            ] }),
            signal,
        })
        if (!start.ok) {
            console.error(`Hunyuan3D job could not start: ${start.status}`)
            throw new GenerationError(UNAVAILABLE)
        }
        const { event_id } = await start.json() as { event_id: string }

        // The first output is a Gradio update, { __type__: 'update', value: { path, url, ... } }
        const [output] = await waitForResult(event_id, signal) as [{ value?: { path?: string } }]
        const path = output?.value?.path
        if (!path) {
            console.error('Hunyuan3D returned no file:', JSON.stringify(output).slice(0, 500))
            throw new GenerationError(UNAVAILABLE)
        }
        // Build the download URL from path: the url Gradio returns points to an address that 404s
        const res = await fetch(`${SPACE_URL}/file=${path}`, { headers: authHeaders(), signal })
        if (!res.ok) {
            console.error(`Hunyuan3D download failed: ${res.status} for ${path}`)
            throw new GenerationError(UNAVAILABLE)
        }

        const glb = await res.arrayBuffer()
        if (new TextDecoder().decode(glb.slice(0, 4)) !== 'glTF') {
            console.error('Hunyuan3D returned a file that is not a .glb')
            throw new GenerationError(UNAVAILABLE)
        }
        if (glb.byteLength > MAX_MODEL_BYTES) throw new GenerationError('The generated model is too big to save. Try a simpler picture.')
        return glb
    } catch (err: unknown) {
        if (err instanceof GenerationError) throw err
        if (err instanceof DOMException && err.name === 'TimeoutError') {
            throw new GenerationError('The 3D generator took too long. It may be busy, please try again later.')
        }
        console.error('Hunyuan3D request failed:', err)
        throw new GenerationError(UNAVAILABLE)
    }
}
