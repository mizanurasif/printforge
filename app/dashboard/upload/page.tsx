import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FaArrowLeft } from 'react-icons/fa6'
import UploadModelForm from '../../components/dashboard/UploadModelForm'
import { authOptions } from '../../lib/auth'
import { getAllCategories } from '../../lib/database/categories'

export default async function UploadModelPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login?callbackUrl=/dashboard/upload')

    const categories = await getAllCategories()

    return (
        <main className="container max-w-6xl px-4 py-8 mx-auto">
            <Link href="/dashboard" className="inline-flex items-center gap-2 mb-4 text-sm text-gray-600 hover:text-orange-accent">
                <FaArrowLeft aria-hidden="true" /> Back to dashboard
            </Link>
            <h1 className="mb-1 text-2xl font-bold sm:text-3xl">Upload a model</h1>
            <p className="mb-8 text-gray-500">Share a printable design with the PrintForge community.</p>

            <UploadModelForm categories={categories} />
        </main>
    )
}
