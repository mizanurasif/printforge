// Pictures are turned into 500x500 webp on the server anyway, so big ones are scaled down in the browser first.
// This keeps the form under Vercel's 4.5MB request limit. Small pictures are sent as they are.
// Tries a few sizes and qualities and uses the first result under the limit.
const ATTEMPTS = [
    { side: 1600, quality: 0.9 },
    { side: 1600, quality: 0.75 },
    { side: 1200, quality: 0.7 },
    { side: 800, quality: 0.6 },
]

function encode(bitmap: ImageBitmap, side: number, quality: number): Promise<Blob | null> {
    const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
}

export async function shrinkImage(file: File, limitBytes = 3 * 1024 * 1024): Promise<File> {
    if (file.size <= limitBytes) return file
    try {
        const bitmap = await createImageBitmap(file)
        try {
            for (const { side, quality } of ATTEMPTS) {
                const blob = await encode(bitmap, side, quality)
                if (blob && blob.size <= limitBytes) {
                    return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' })
                }
            }
        } finally {
            bitmap.close()
        }
    } catch {
        // Couldn't read or encode it here: fall through and send the original
    }
    return file   // the server still checks the size and says if it's too big
}
