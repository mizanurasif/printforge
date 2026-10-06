import db from './db'
import { Model } from './models'

export async function getModels(category?: string, search?: string): Promise<Model[]> {
  const conditions: string[] = []
  const params: Record<string, string> = {}

  if (category) {
    conditions.push('category = @category')
    params.category = category
  }

  if (search) {
    conditions.push('(name LIKE @search OR description LIKE @search)')
    params.search = `%${search}%`
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  return db
    .prepare(`SELECT * FROM models ${where} ORDER BY id`)
    .all(params) as Model[]
}

export async function getModelById(id: string | number): Promise<Model> {
  const model = db
    .prepare('SELECT * FROM models WHERE id = ?')
    .get(id) as Model | undefined

  if (!model) {
    throw new Error(`Model with id ${id} not found`)
  }
  return model
}