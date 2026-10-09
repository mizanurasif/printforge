import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../lib/auth'

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login?callbackUrl=/dashboard')

    return (
        <main className="container px-4 py-8 mx-auto">
            <h1 className="mb-2 text-3xl font-bold">Welcome, {session.user.name}</h1>
            <p className="text-gray-600">Signed in as {session.user.email}</p>
        </main>
    )
}
