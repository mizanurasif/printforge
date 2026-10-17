import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import { FaCube, FaHeart, FaTrophy } from 'react-icons/fa6'
import UserModelsGrid from '@/app/components/Model/UserModelsGrid'
import StatCard from '@/app/components/dashboard/StatCard'
import { authOptions } from '@/app/lib/auth'
import { MODELS_PER_PAGE } from '@/app/lib/constants'
import { getPublicUserById, getUserModels, getUserModelStats } from '@/app/lib/database/user'

type UserPageProps = { params: Promise<{ id: string }>, searchParams: Promise<{ page?: string }> }

// "/user/abc" or "/user/1.5" would otherwise reach Postgres as an invalid integer
function parseUserId(id: string): number | null {
    const userId = Number(id)
    return Number.isInteger(userId) && userId > 0 ? userId : null
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
    const userId = parseUserId((await params).id)
    const user = userId ? await getPublicUserById(userId) : undefined
    return { title: user ? `${user.name} | PrintForge` : 'Creator not found | PrintForge' }
}

export default async function UserProfilePage({ params, searchParams }: UserPageProps) {
    const userId = parseUserId((await params).id)
    if (!userId) notFound()

    // Your own profile is your dashboard
    const session = await getServerSession(authOptions)
    if (session && Number(session.user.id) === userId) redirect('/dashboard')

    const user = await getPublicUserById(userId)
    if (!user) notFound()

    // The stats cover all their models; the grid shows one page of them
    const { modelCount, totalLikes, topModel } = await getUserModelStats(userId)
    const totalPages = Math.max(Math.ceil(modelCount / MODELS_PER_PAGE), 1)
    const page = Number((await searchParams).page) || 1
    if (!Number.isInteger(page) || page < 1 || page > totalPages) redirect(`/user/${userId}`)
    const models = await getUserModels({ userId, page, modelsPerPage: MODELS_PER_PAGE, viewerId: Number(session?.user.id) || undefined })

    const initials = user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    const joined = user.createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    return (
        <main className="container max-w-6xl px-4 py-8 mx-auto">
            {/* Header */}
            <section className="flex items-center gap-4 mb-8">
                <div className="flex items-center justify-center text-lg font-bold text-white rounded-full w-14 h-14 shrink-0 bg-orange-accent" aria-hidden="true">
                    {initials}
                </div>
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold truncate sm:text-3xl">{user.name}</h1>
                    <p className="text-sm text-gray-500">Joined {joined}</p>
                </div>
            </section>

            {/* Stats */}
            <section aria-label={`${user.name}'s stats`} className="grid grid-cols-1 gap-4 mb-10 sm:grid-cols-3">
                <StatCard label="Models uploaded" value={modelCount} icon={<FaCube />} />
                <StatCard label="Likes received" value={totalLikes.toLocaleString('en-US')} icon={<FaHeart />} />
                <StatCard label="Most liked model" value={topModel ? topModel.name : '—'} icon={<FaTrophy />}
                    hint={topModel ? `${topModel.likes.toLocaleString('en-US')} likes` : undefined} />
            </section>

            {/* Models */}
            <section>
                <div className="flex items-baseline justify-between mb-4">
                    <h2 className="text-xl font-bold">Models by {user.name}</h2>
                    <span className="text-sm text-gray-500">{modelCount} total</span>
                </div>

                {modelCount > 0 ? (
                    <UserModelsGrid models={models} totalPages={totalPages} currentPage={page} />
                ) : (
                    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center bg-white border border-gray-300 border-dashed rounded-lg">
                        <FaCube className="text-4xl text-gray-300" aria-hidden="true" />
                        <p className="font-semibold text-gray-800">{user.name} hasn&apos;t uploaded any models yet</p>
                    </div>
                )}
            </section>
        </main>
    )
}
