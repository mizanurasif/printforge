import db from './db'
import { Category } from './models'

export async function getAllCategories(): Promise<Category[]> {
    return db
        .prepare('SELECT slug, displayName FROM categories ORDER BY displayName')
        .all() as Category[]
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
    const category = db
        .prepare('SELECT slug, displayName FROM categories WHERE slug = ?')
        .get(slug) as Category | undefined
    if (!category) {
        throw new Error(`Category with slug ${slug} not found`)
    }
    return category
}

export async function getDisplayNameFromSlug(slug: string): Promise<string> {
    const category = await getCategoryBySlug(slug)
    return category.displayName
}
