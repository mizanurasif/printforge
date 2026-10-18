import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FaCircleCheck, FaCube, FaHeart, FaPlus, FaTrophy } from 'react-icons/fa6'
import DeleteAccountButton from '../components/dashboard/DeleteAccountButton'
import DeleteSuccessDialog from '../components/dashboard/DeleteSuccessDialog'
import MyModelsTable from '../components/dashboard/MyModelsTable'
import StatCard from '../components/dashboard/StatCard'
import { authOptions } from '../lib/auth'
import { getUserModelsByID } from '../lib/database/user'

export default async function DashboardPage({ searchParams }: {
    searchParams: Promise<{ uploaded?: string, deleted?: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login?callbackUrl=/dashboard')

    // Set by the upload action's redirect and by DeleteModelButton after a delete
    const { uploaded, deleted } = await searchParams

    const { id, name, email } = session.user
    const userID = Number(id)
    if(Number.isNaN(userID)){
        throw  new Error
    }
    const models = await getUserModelsByID(userID)

    // Stats are derived from the list, so they stay correct once real data replaces the dummy data
    const totalModels = models.length
    const totalLikes = models.reduce((sum, model) => sum + model.likes, 0)
    const topModel = models.reduce<typeof models[number] | null>(
        (best, model) => (!best || model.likes > best.likes ? model : best), null)

    const initials = (name ?? email ?? '?')
        .split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

    return (
        <main className="max-w-6xl px-4 py-10 mx-auto md:px-6">
            {deleted && <DeleteSuccessDialog key={deleted} name={deleted} />}

            {uploaded && (
                <div role="status" className="flex items-start gap-3 p-4 mb-6 text-sm text-green-800 border border-green-200 rounded-2xl bg-green-50">
                    <FaCircleCheck className="mt-0.5 shrink-0" aria-hidden="true" />
                    <p>
                        <span className="font-semibold">&ldquo;{uploaded}&rdquo; was uploaded.</span>{' '}
                        You&apos;ll find it in your models below.
                    </p>
                </div>
            )}

            {/* Header */}
            <section className="relative flex flex-col gap-4 p-6 mb-8 overflow-hidden rounded-3xl pastel-wash sm:flex-row sm:items-center sm:justify-between md:p-8">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center text-lg font-bold text-white rounded-full w-16 h-16 shrink-0 bg-gradient-to-br from-indigo to-pink ring-4 ring-white/70" aria-hidden="true">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="mb-1 eyebrow">My account</p>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome back, {name}</h1>
                        <p className="text-sm text-muted truncate">{email}</p>
                    </div>
                </div>
                <Link href="/dashboard/upload"
                    className="btn-primary">
                    <FaPlus aria-hidden="true" /> Upload model
                </Link>
            </section>

            {/* Stats */}
            <section aria-label="Your stats" className="grid grid-cols-1 gap-4 mb-10 sm:grid-cols-3">
                <StatCard label="Models uploaded" value={totalModels} icon={<FaCube />} />
                <StatCard label="Likes received" value={totalLikes.toLocaleString('en-US')} icon={<FaHeart />}
                    hint={totalModels ? `${Math.round(totalLikes / totalModels).toLocaleString('en-US')} per model on average` : undefined} />
                <StatCard label="Most liked model" value={topModel ? topModel.name : '—'} icon={<FaTrophy />}
                    hint={topModel ? `${topModel.likes.toLocaleString('en-US')} likes` : undefined} />
            </section>

            {/* My models */}
            <section>
                <div className="flex items-baseline justify-between mb-4">
                    <h2 className="text-xl font-bold">My models</h2>
                    <span className="text-sm text-muted">{totalModels} total</span>
                </div>

                {models.length > 0 ? (
                    <MyModelsTable models={models} />
                ) : (
                    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center bg-white/70 border-2 border-line border-dashed rounded-3xl">
                        <FaCube className="text-4xl text-muted/40" aria-hidden="true" />
                        <p className="font-semibold text-ink">You haven&apos;t uploaded any models yet</p>
                        <p className="text-sm text-muted">Share your first design with the community.</p>
                        <Link href="/dashboard/upload" className="mt-2 font-semibold text-indigo hover:underline">
                            Upload your first model
                        </Link>
                    </div>
                )}
            </section>

            {/* Danger zone */}
            <section className="p-6 mt-12 bg-white border border-red-200 rounded-3xl">
                <h2 className="text-lg font-bold text-red-700">Danger zone</h2>
                <div className="flex flex-col gap-4 mt-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted">Permanently delete your account and every model you&apos;ve uploaded.</p>
                    <DeleteAccountButton />
                </div>
            </section>
        </main>
    )
}
