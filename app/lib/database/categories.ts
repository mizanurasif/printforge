import 'server-only'
import sql from './db'
import { Category } from '../models'

export async function getAllCategories(): Promise<Category[]> {
    return sql<Category[]>`
        SELECT slug, display_name FROM categories ORDER BY display_name
    `
}

export async function getCategoryBySlug(categorySlug: string): Promise<Category | undefined> {
    const [category] = await sql<Category[]>`
        SELECT slug, display_name FROM categories WHERE slug = ${categorySlug}
    `
    return category
}