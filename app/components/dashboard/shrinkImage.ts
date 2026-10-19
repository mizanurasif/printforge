// Pictures are turned into 500x500 webp on the server anyway, so big ones are scaled down in the browser first.
// This keeps the form under Vercel's 4.5MB request limit. Small pictures are sent as they are.
const MAX_SIDE = 1600

export async function shrinkImage(file: File, limitBytes = 3 * 1024 * 1024): Promise<File> {
    if (file.size <= limitBytes) return file
    try {
        const bitmap = await createImageBitmap(file)
        const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(bitmap.width * scale)
        canvas.height = Math.round(bitmap.height * scale)
        canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
        bitmap.close()
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.9))
        if (!blob) return file
        return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' })
    } catch {
        return file   // the server still checks the size and says if it's too big
    }
}
