import path from 'node:path'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { mkdir, unlink } from 'node:fs/promises'


const UPLOAD_DIR = path.join(process.cwd(), 'public', 'img', 'uploads')
export async function saveImage(image: File): Promise<string> {
    await mkdir(UPLOAD_DIR, { recursive: true })

    const fileName = `${randomUUID()}.webp`          // rename: unique, never trusts the user's filename
    const buffer = Buffer.from(await image.arrayBuffer())
    try{
    await sharp(buffer)
        .rotate()                                     // respect phone photo orientation (EXIF)
        .resize(500, 500, { fit: 'cover' })           // fit into 500×500
        .webp({ quality: 80 })                        // convert everything to one format
        .toFile(path.join(UPLOAD_DIR, fileName))
    }
    catch(err:unknown){
         console.error("Failed:", err);
    }
    return `/img/uploads/${fileName}`                 // URL to store in the database
}

// Not exported on purpose: exports of a 'use server' file are public endpoints,
// and this must never accept a path from the browser
export async function deleteImage(imagePath: string) {
    // Only files we uploaded; never the shared placeholder or seeded model images
    if (!imagePath.startsWith('/img/uploads/')) return
    const filePath = path.join(UPLOAD_DIR, path.basename(imagePath))
    try {
        await unlink(filePath)
    } catch (err: unknown) {
        // Already gone is fine; the database row is deleted either way
        console.error('Failed to delete image:', err)
    }
}