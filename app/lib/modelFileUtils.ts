import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { mkdir, rename, unlink } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import type { ReadableStream as NodeReadableStream } from 'node:stream/web'

export const MAX_MODEL_BYTES = 50 * 1024 * 1024
const MODELS_DIR = path.join(process.cwd(), 'public', 'models')
// Uploads are named upload-<uuid>.glb, so the seeded models in the same folders are never moved or deleted
const UPLOADED_FILE = /^\/models\/[a-z0-9-]+\/upload-[0-9a-f-]{36}\.glb$/
const CATEGORY_SLUG = /^[a-z0-9-]+$/

// A problem with the file itself, safe to show to the user
export class ModelFileError extends Error {}

// A binary glTF starts with a 12-byte header: "glTF", version 2, then the file's total length
function checkHeader(header: Buffer) {
    if (header.toString('ascii', 0, 4) !== 'glTF' || header.readUInt32LE(4) !== 2) {
        throw new ModelFileError('This is not a valid .glb file (binary glTF 2.0)')
    }
}

// Streams an upload to public/models/<category>/upload-<uuid>.glb, so the file is never held in memory.
// The header and size are checked while it streams; anything wrong deletes the partial file.
export async function saveModelFile(body: ReadableStream<Uint8Array>, category: string): Promise<string> {
    // The category comes from the database, but it becomes a folder name, so never trust it blindly
    if (!CATEGORY_SLUG.test(category)) throw new ModelFileError('Invalid category')

    const dir = path.join(MODELS_DIR, category)
    await mkdir(dir, { recursive: true })
    const fileName = `upload-${randomUUID()}.glb`
    const filePath = path.join(dir, fileName)

    let received = 0
    let header = Buffer.alloc(0)
    async function* check(source: AsyncIterable<Buffer>) {
        for await (const chunk of source) {
            received += chunk.length
            // Content-Length can lie, so count the bytes that really arrive
            if (received > MAX_MODEL_BYTES) throw new ModelFileError('3D model must be 50MB or smaller')
            if (header.length < 12) {
                header = Buffer.concat([header, chunk]).subarray(0, 12)
                if (header.length === 12) checkHeader(header)
            }
            yield chunk
        }
    }

    try {
        await pipeline(Readable.fromWeb(body as NodeReadableStream<Uint8Array>), check, createWriteStream(filePath))
        if (header.length < 12) throw new ModelFileError('This is not a valid .glb file (binary glTF 2.0)')
        if (header.readUInt32LE(8) !== received) throw new ModelFileError('The .glb file is incomplete or damaged')
    } catch (err) {
        await unlink(filePath).catch(() => {})
        throw err
    }
    return `/models/${category}/${fileName}`
}

// Moves an uploaded file to another category's folder; returns its new URL (or the same one if nothing moved)
export async function moveModelFile(modelFile: string, category: string): Promise<string> {
    if (!UPLOADED_FILE.test(modelFile) || !CATEGORY_SLUG.test(category)) return modelFile
    const newFile = `/models/${category}/${path.basename(modelFile)}`
    if (newFile === modelFile) return modelFile

    await mkdir(path.join(MODELS_DIR, category), { recursive: true })
    await rename(path.join(process.cwd(), 'public', modelFile), path.join(process.cwd(), 'public', newFile))
    return newFile
}

export async function deleteModelFile(modelFile: string | null) {
    // Only files users uploaded; never the seeded models
    if (!modelFile || !UPLOADED_FILE.test(modelFile)) return
    try {
        await unlink(path.join(process.cwd(), 'public', modelFile))
    } catch (err: unknown) {
        // Already gone is fine; the database row is updated either way
        console.error('Failed to delete model file:', err)
    }
}
