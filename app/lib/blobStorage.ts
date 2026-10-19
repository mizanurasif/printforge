import 'server-only'
import { del, put } from '@vercel/blob'

// Where uploaded files live.
// - On Vercel the server's disk is read-only and wiped between requests, so pictures and .glb files go to a
//   public Vercel Blob store. Connecting a Blob store to the project adds BLOB_READ_WRITE_TOKEN, which turns this on.
// - Without the token (e.g. `npm run dev` on your own computer) files are saved in /public as before.
export function blobEnabled() {
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

// Public Blob URLs look like https://<store-id>.public.blob.vercel-storage.com/<pathname>
export function isBlobUrl(url: string | null | undefined): boolean {
    if (!url) return false
    try {
        const { protocol, hostname } = new URL(url)
        return protocol === 'https:' && hostname.endsWith('.public.blob.vercel-storage.com')
    } catch {
        return false
    }
}

// The store this deployment writes to; its id is part of the read-write token (vercel_blob_rw_<storeId>_<secret>)
function ownStoreHost(): string | null {
    const storeId = process.env.BLOB_READ_WRITE_TOKEN?.split('_')[3]
    return storeId ? `${storeId.toLowerCase()}.public.blob.vercel-storage.com` : null
}

// True only for files in OUR store under the given folder, so a request can't point a model at any other URL
export function isOwnBlobUrl(url: string, folder: string): boolean {
    if (!isBlobUrl(url)) return false
    const { hostname, pathname } = new URL(url)
    const host = ownStoreHost()
    return (host === null || hostname === host) && pathname.startsWith(`/${folder}/`)
}

export async function putPublicFile(pathname: string, body: Buffer | ArrayBuffer | ReadableStream, contentType: string) {
    const blob = await put(pathname, body, { access: 'public', contentType, addRandomSuffix: true })
    return blob.url
}

// Deletes a file from our store; anything else (seeded files in /public, placeholders) is left alone
export async function deleteBlobFile(url: string) {
    if (!isBlobUrl(url)) return
    try {
        await del(url)
    } catch (err: unknown) {
        // Already gone is fine; the database row is updated either way
        console.error('Failed to delete blob:', err)
    }
}

// Reads the first bytes and the size of an uploaded .glb without downloading all of it
export async function readBlobHeader(url: string): Promise<{ header: Buffer, size: number } | null> {
    const res = await fetch(url, { headers: { Range: 'bytes=0-11' }, cache: 'no-store' })
    if (!res.ok) return null
    const range = res.headers.get('content-range')   // "bytes 0-11/123456"
    const size = range ? Number(range.split('/')[1]) : Number(res.headers.get('content-length'))
    return { header: Buffer.from(await res.arrayBuffer()).subarray(0, 12), size }
}
