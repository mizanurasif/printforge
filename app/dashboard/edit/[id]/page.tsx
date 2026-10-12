import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { FaArrowLeft } from 'react-icons/fa6'
import { authOptions } from '../../../lib/auth'
import { getAllCategories } from '../../../lib/database/categories'
import EditModelForm from '@/app/components/dashboard/EditModelForm'
import { Model } from '@/app/lib/models'
import { getModelById } from '@/app/lib/database/database'

export default async function EditModelPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) redirect(`/login?callbackUrl=/dashboard/edit/${id}`)

    let model: Model
    try {
        model = await getModelById(id)
    } catch {
        notFound()
    }
    // Only the owner may edit; updateModel enforces this too, this just avoids showing a useless form
    if (model.userId !== Number(session.user.id)) redirect('/dashboard')

    const categories = await getAllCategories()

    return (
        <main className="container max-w-6xl px-4 py-8 mx-auto">
            <Link href="/dashboard" className="inline-flex items-center gap-2 mb-4 text-sm text-gray-600 hover:text-orange-accent">
                <FaArrowLeft aria-hidden="true" /> Back to dashboard
            </Link>
            <h1 className="mb-1 text-2xl font-bold sm:text-3xl">Edit {model.name}</h1>
            <p className="mb-8 text-gray-500">Update your model&apos;s details or replace its image.</p>

            <EditModelForm categories={categories} model={model} />
        </main>
    )
}
