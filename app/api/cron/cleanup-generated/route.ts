import { del, list } from '@vercel/blob'
import sql from '@/app/lib/database/db'
import { blobEnabled } from '@/app/lib/blobStorage'
import { BLOB_MODELS_FOLDER } from '@/app/lib/modelFileUtils'

// Runs once a day (vercel.json "crons") and deletes Blob .glb files no model uses, once they're a day old:
// - models/g<userId>/…  2D to 3D results the user never saved as a model
// - models/m<modelId>/… direct uploads whose follow-up request never attached them (closed tab, network error)
// The one-day age keeps uploads and edits that are still in progress.
const MAX_AGE_MS = 24 * 60 * 60 * 1000

export async function GET(request: Request) {
    // Vercel calls this with "Authorization: Bearer <CRON_SECRET>"; nobody else may run it
    const secret = process.env.CRON_SECRET
    if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!blobEnabled()) return Response.json({ deleted: 0, skipped: 'Blob storage is not set up' })

    const cutoff = Date.now() - MAX_AGE_MS
    let deleted = 0
    for (const prefix of [`${BLOB_MODELS_FOLDER}/g`, `${BLOB_MODELS_FOLDER}/m`]) {
        let cursor: string | undefined
        do {
            const page = await list({ prefix, cursor, limit: 1000 })
            cursor = page.hasMore ? page.cursor : undefined
            const old = page.blobs.filter((b) => new Date(b.uploadedAt).getTime() < cutoff).map((b) => b.url)
            if (!old.length) continue
            // Keep any file a model still uses
            const used = await sql<{ modelFile: string }[]>`SELECT model_file FROM models WHERE model_file = ANY(${old})`
            const usedUrls = new Set(used.map((m) => m.modelFile))
            const unused = old.filter((url) => !usedUrls.has(url))
            if (unused.length) await del(unused)
            deleted += unused.length
        } while (cursor)
    }

    return Response.json({ deleted })
}
