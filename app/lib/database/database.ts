import 'server-only'
import sql from './db'
import { Model } from '../models'

type ModelFilters = {
    categorySlug?: string
    search?: string
}

// Shared WHERE for getModels and getmodelcount, so the page count always matches the results
function whereClause({ categorySlug, search }: ModelFilters) {
    const pattern = `%${search}%`
    return sql`
        WHERE TRUE
        ${categorySlug ? sql`AND m.category = ${categorySlug}` : sql``}
        ${search ? sql`AND (m.name ILIKE ${pattern} OR m.description ILIKE ${pattern})` : sql``}
    `
}

// Whitelist: user input picks a fragment, it never becomes SQL text
function orderByClause(sort?: string) {
    switch (sort) {
        case 'popular': return sql`m.likes DESC`
        case 'alpha':   return sql`m.name ASC`
        case 'recent':  return sql`m.date_added DESC`
        default:        return sql`m.id ASC`
    }
}

// Adds liked_by_me to a query over "models m": whether viewerId has liked each model
export function likedByMe(viewerId?: number) {
    return viewerId
        ? sql`EXISTS (SELECT 1 FROM likes l WHERE l.model_id = m.id AND l.user_id = ${viewerId}) AS liked_by_me`
        : sql`FALSE AS liked_by_me`
}

export async function getModels({ categorySlug, search, sort, page, modelsPerPage, viewerId }: {
    categorySlug?: string
    search?: string
    sort?: string
    page: number
    modelsPerPage: number
    viewerId?: number
}): Promise<Model[]> {
    return await sql<Model[]>`
        SELECT m.*, u.name AS creator_name, ${likedByMe(viewerId)}
        FROM models m
        LEFT JOIN users u ON u.id = m.user_id
        ${whereClause({ categorySlug, search })}
        ORDER BY ${orderByClause(sort)}
        LIMIT ${modelsPerPage} OFFSET ${(page - 1) * modelsPerPage}
    `
}

export async function getModelById(id: string | number, viewerId?: number): Promise<Model> {
    const modelId = Number(id)
    // "/3d-models/abc" would otherwise crash Postgres with "invalid input syntax for type integer"
    if (!Number.isInteger(modelId)) {
        throw new Error(`Model with id ${id} not found`)
    }

    const [model] = await sql<Model[]>`
        SELECT m.*, u.name AS creator_name, ${likedByMe(viewerId)}
        FROM models m
        LEFT JOIN users u ON u.id = m.user_id
        WHERE m.id = ${modelId}
    `
    if (!model) {
        throw new Error(`Model with id ${id} not found`)
    }
    return model
}

export async function getmodelcount({ categorySlug, search }: ModelFilters): Promise<number> {
    const [result] = await sql<{ count: number }[]>`
        SELECT COUNT(*)::int AS count
        FROM models m
        ${whereClause({ categorySlug, search })}
    `
    return result.count
}



export async function createModel(model: {
    name: string
    description: string
    category: string
    image: string
    modelFile?: string
    userId: number
}): Promise<number> {
    const row = {
        name: model.name,
        description: model.description,
        category: model.category,
        image: model.image,
        model_file: model.modelFile ?? null,
        user_id: model.userId,
    }   // likes and date_added use their DEFAULTs

    const [inserted] = await sql<{ id: number }[]>`
        INSERT INTO models ${sql(row)}
        RETURNING id
    `
    return inserted.id
}

// Returns the deleted model's files, or null if it wasn't found or isn't this user's
export async function deleteModel({ modelId, userId }: { modelId: number, userId: number }): Promise<{ image: string, modelFile: string | null } | null> {
    const [deleted] = await sql<{ image: string, modelFile: string | null }[]>`
        DELETE FROM models
        WHERE id = ${modelId} AND user_id = ${userId}
        RETURNING image, model_file
    `
    return deleted ?? null
}

// Sets (or clears, with null) a model's 3D file. Returns the previous file,
// or undefined if the model wasn't found or isn't this user's
export async function setModelFile({ modelId, userId, modelFile }: {
    modelId: number
    userId: number
    modelFile: string | null
}): Promise<string | null | undefined> {
    // Joining the row to itself lets RETURNING read the value from before the update
    const [updated] = await sql<{ oldFile: string | null }[]>`
        UPDATE models m SET model_file = ${modelFile}
        FROM models old
        WHERE m.id = old.id AND m.id = ${modelId} AND m.user_id = ${userId}
        RETURNING old.model_file AS old_file
    `
    return updated ? updated.oldFile : undefined
}

export async function updateModel({ modelId, userId, ...fields }: {
    modelId: number
    userId: number
    name: string
    description: string
    category: string
    image?: string      
}): Promise<number | null> {
    const row = {
        name: fields.name,
        description: fields.description,
        category: fields.category,
        ...(fields.image && { image: fields.image }),
    }

    const [updated] = await sql<{ id: number }[]>`
        UPDATE models SET ${sql(row)}
        WHERE id = ${modelId} AND user_id = ${userId}
        RETURNING id
    `
    return updated?.id ?? null
}