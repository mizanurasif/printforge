import db from './db'
import { Model } from './models'

export async function getModels({categorySlug, search, sort, page ,modelsPerPage}:{
  categorySlug?:string,
  search?:string,
  sort?:string,
  page:number,
  modelsPerPage:number
}): Promise<Model[]> {
  // 👇 simulate slow data fetching   
  //await new Promise(resolve => setTimeout(resolve, 500))
  
    const conditions: string[] = [];
    const params: Record<string, string> = {}

    if (categorySlug) {
    conditions.push('category = @category')
    params.category = categorySlug
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

    const models = db.prepare(`SELECT * From models ${where} ORDER BY ${sortcondition} LIMIT ${modelsPerPage} OFFSET ${(page-1)*modelsPerPage}`)
                    .all(params) as Model[]
    return models
}
/*
export async function getModels(category?: string): Promise<Model[]> {
  
  const where = category ? `WHERE category = @category` : ''

  return db
    .prepare(`SELECT * FROM models ${where} ORDER BY id`)
    .all({
      'category' : category
    }) as Model[]
}*/

export async function getModelById(id: string | number): Promise<Model> {
  //await new Promise(resolve => setTimeout(resolve, 500))
  const model = db
    .prepare('SELECT * FROM models WHERE id = @id')
    .get({
      "id": id
    }) as Model | undefined

  if (!model) {
    throw new Error(`Model with id ${id} not found`)
  }
  return model
}

export async function getmodelcount({categorySlug,search}:{categorySlug?: string, search?:string}): Promise<number> {
    const params: Record<string, string> = {}
    const conditions: string[] = [];
    if (categorySlug) {
      conditions.push('category = @category')
      params.category = categorySlug
    } 
    if (search) {
        conditions.push('(name LIKE @search OR description LIKE @search)')
        params.search = `%${search}%`
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const result =  db.prepare(`SELECT COUNT(*) AS count FROM models ${where}`)
                    .get(params) as {count: number}
    return result.count;
}