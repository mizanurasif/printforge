import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import GenerateModelForm from '../components/generate/GenerateModelForm'
import { authOptions } from '../lib/auth'
import { getAllCategories } from '../lib/database/categories'

export default async function GeneratePage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login?callbackUrl=/generate')

    const categories = await getAllCategories()

    return (
        <main className="container max-w-6xl px-4 py-8 mx-auto">
            <h1 className="mb-1 text-2xl font-bold sm:text-3xl">2D to 3D</h1>
            <p className="mb-8 text-gray-500">Turn a picture of an object into a 3D model, preview it, and save it to PrintForge.</p>

            <GenerateModelForm categories={categories} />
        </main>
    )
}
