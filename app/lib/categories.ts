import db from './db'
import { Category, Model } from './models'

export async function getAllCategories(): Promise<Category[]> {
    return db
        .prepare('SELECT slug, displayName FROM categories ORDER BY displayName')
        .all() as Category[]
}

export async function getCategoryBySlug(categorySlug: string): Promise<Category | undefined> {
    const category = db
        .prepare('SELECT slug, displayName FROM categories WHERE slug = ?')
        .get(categorySlug) as Category | undefined
    //if (!category) {
    //    throw new Error(`Category with slug ${slug} not found`)
    //}
    return category
}
/*
export async function getDisplayNameFromSlug(slug: string): Promise<string> {
    const category = await getCategoryBySlug(slug)
    return category.displayName
}*/

export async function getModelsByCategorySlug(category: string, search?: string, sort?: string): Promise<Model[]> {
 // 👇 simulate slow data fetching   
 // await new Promise(resolve => setTimeout(resolve, 500))

    const conditions: string[] = [];
    const params: Record<string, string> = {}

    if (category) {
    conditions.push('category = @category')
    params.category = category
    } 

    if (search) {
        conditions.push ('(name LIKE @search OR description LIKE @search)')
        params.search = `%${search}%`
    }
    let sortcondition: string = 'id ASC';
    if (sort) {
        if(sort == "popular") {
        sortcondition = 'likes DESC'
        }
        else if(sort == 'alpha'){
        sortcondition = 'name ASC'
        }
        else if(sort == 'recent'){
        sortcondition = 'dateAdded DESC'
        }
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const models = db.prepare(`SELECT * From models ${where} ORDER BY ${sortcondition}`)
                    .all(params) as Model[]
    return models
}

