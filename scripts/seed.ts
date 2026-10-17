import postgres from 'postgres'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { deleteImage, saveImage } from '../app/lib/imageUtils'
import { deleteModelFile } from '../app/lib/modelFileUtils'

const sql = postgres(process.env.DATABASE_URL!, { transform: postgres.camel })
const root = process.cwd()

type SeedModel = {
    id: number
    name: string
    description: string
    likes: number
    image: string
    modelFile?: string
    category: string
    dateAdded: string
}
type SeedCategory = { slug: string, displayName: string }

// 1. Read the existing JSON data
const models: SeedModel[] = JSON.parse(
    fs.readFileSync(path.join(root, 'app/data/data.json'), 'utf-8')
)
const categories: SeedCategory[] = JSON.parse(
    fs.readFileSync(path.join(root, 'app/data/categories.json'), 'utf-8')
)

// 2. Demo creators (password for all of them: password123)
const seedUsers = [
    { name: 'Maya Chen',   email: 'maya@printforge.dev' },
    { name: 'Leo Rahman',  email: 'leo@printforge.dev' },
    { name: 'Sara Okafor', email: 'sara@printforge.dev' },
]

const PLACEHOLDER_IMAGE = '/img/placeholder.png'

// Runs a seed image through saveImage, same as an upload: a 500x500 webp in /img/uploads.
// The shared placeholder is stored as is, like an upload without an image.
async function processImage(imagePath: string): Promise<string> {
    if (imagePath === PLACEHOLDER_IMAGE) return imagePath
    const buffer = fs.readFileSync(path.join(root, 'public', imagePath))
    return saveImage(new File([buffer], path.basename(imagePath)))
}

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10)

    // Files of the models about to be wiped; deleted only after the new seed commits
    const oldModels = await sql<{ image: string, modelFile: string | null }[]>`SELECT image, model_file FROM models`

    const images = await Promise.all(models.map((m) => processImage(m.image)))

    try {
        // One transaction: if anything fails, nothing is half-seeded
        await sql.begin(async (tx) => {
            // Clear models and categories only (CASCADE also clears likes). Real registered users are kept.
            await tx`TRUNCATE models, categories RESTART IDENTITY CASCADE`

            // Insert the demo users, or reuse them if the seed already ran before
            const users = await tx<{ id: number }[]>`
                INSERT INTO users ${tx(seedUsers.map((u) => ({ ...u, passwordHash })))}
                ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
                RETURNING id
            `

            await tx`INSERT INTO categories ${tx(categories, 'slug', 'displayName')}`

            // Give every model a creator, round-robin over the demo users
            const rows = models.map((m, i) => ({ ...m, image: images[i], modelFile: m.modelFile ?? null, userId: users[i % users.length].id }))
            await tx`
                INSERT INTO models ${tx(rows, 'id', 'name', 'description', 'likes', 'image', 'modelFile', 'category', 'dateAdded', 'userId')}
            `

            // We inserted explicit ids, so move the id counter past them
            await tx`SELECT setval('models_id_seq', (SELECT MAX(id) FROM models))`
        })
    } catch (err) {
        await Promise.all(images.map(deleteImage))   // rolled back: don't leave the new files behind
        throw err
    }

    // deleteImage only touches /img/uploads, and deleteModelFile only users' upload-*.glb files
    await Promise.all(oldModels.flatMap((m) => [deleteImage(m.image), deleteModelFile(m.modelFile)]))

    console.log(`Seeded ${seedUsers.length} users, ${categories.length} categories and ${models.length} models`)
}

main()
    .catch((err) => {
        console.error(err)
        process.exitCode = 1
    })
    .finally(() => sql.end())