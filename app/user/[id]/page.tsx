import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import { FaCube, FaHeart, FaTrophy } from 'react-icons/fa6'
import ModelCard from '@/app/components/Model/ModelCard'
import StatCard from '@/app/components/dashboard/StatCard'
import { authOptions } from '@/app/lib/auth'
import { getPublicUserById, getUserModelsByID } from '@/app/lib/database/user'

type UserPageProps = { params: Promise<{ id: string }> }

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

export default async function UserProfilePage({ params }: UserPageProps) {
    const userId = parseUserId((await params).id)
    if (!userId) notFound()

    // Your own profile is your dashboard
    const session = await getServerSession(authOptions)
    if (session && Number(session.user.id) === userId) redirect('/dashboard')

    const user = await getPublicUserById(userId)
    if (!user) notFound()

    const models = await getUserModelsByID(userId, Number(session?.user.id) || undefined)
    const totalLikes = models.reduce((sum, model) => sum + model.likes, 0)
    const topModel = models[0] ?? null      // getUserModelsByID sorts by likes, most first

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
                <StatCard label="Models uploaded" value={models.length} icon={<FaCube />} />
                <StatCard label="Likes received" value={totalLikes.toLocaleString('en-US')} icon={<FaHeart />} />
                <StatCard label="Most liked model" value={topModel ? topModel.name : '—'} icon={<FaTrophy />}
                    hint={topModel ? `${topModel.likes.toLocaleString('en-US')} likes` : undefined} />
            </section>

            {/* Models */}
            <section>
                <div className="flex items-baseline justify-between mb-4">
                    <h2 className="text-xl font-bold">Models by {user.name}</h2>
                    <span className="text-sm text-gray-500">{models.length} total</span>
                </div>

                {models.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {models.map((model) => <ModelCard key={model.id} model={model} />)}
                    </div>
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
