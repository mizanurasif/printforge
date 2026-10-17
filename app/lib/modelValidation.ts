import { z } from 'zod'

// The rules for a model's details, shared by upload, edit and saving a generated model
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const PLACEHOLDER_IMAGE = '/img/placeholder.png'

export const modelDetailsSchema = z.object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters').max(80, 'Name must be 80 characters or less'),
    description: z.string().trim().min(10, 'Description must be at least 10 characters').max(500, 'Description must be 500 characters or less'),
    // Missing (null) when nothing is picked: the disabled "Choose a category" option isn't submitted
    category: z.string({ error: 'Choose a category' }).min(1, 'Choose a category'),
})

// An optional picture; returns the problem with it, if any
export function checkImage(image: FormDataEntryValue | null): string | null {
    if (!(image instanceof File) || image.size === 0) return null
    if (!IMAGE_TYPES.includes(image.type)) return 'Image must be PNG, JPG or WebP'
    if (image.size > MAX_IMAGE_BYTES) return 'Image must be 5MB or smaller'
    return null
}
