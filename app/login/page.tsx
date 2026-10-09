import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import LoginForm from '../components/LoginForm'
import { authOptions } from '../lib/auth'

export default async function LoginPage({ searchParams }: {
    searchParams: Promise<{ callbackUrl?: string, registered?: string }>
}) {
    const { callbackUrl, registered } = await searchParams

    // Keep only the path part, so ?callbackUrl=https://evil.com can't redirect off-site
    let target = '/dashboard'
    if (callbackUrl) {
        try {
            const url = new URL(callbackUrl, 'http://localhost')
            target = url.pathname + url.search
        } catch {}
    }
    if (target.startsWith('/login') || target.startsWith('/register')) target = '/dashboard'

    const session = await getServerSession(authOptions)
    if (session) redirect(target)

    return (
        <main className="max-w-sm px-4 mx-auto mt-16">
            <h1 className="mb-6 text-3xl font-bold text-center">Log in</h1>
            <LoginForm callbackUrl={target} registered={registered === '1'} />
        </main>
    )
}
