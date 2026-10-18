// Turns a category slug into a readable label for tags: "animals-pets" → "Animals & Pets"
export function categoryLabel(slug: string) {
    return slug.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' & ')
}
