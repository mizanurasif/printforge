import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import LoginForm from '../components/account/LoginForm'
import { authOptions } from '../lib/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Log in' }

export default async function LoginPage({ searchParams }: {
    searchParams: Promise<{ callbackUrl?: string, registered?: string }>
}) {
    const { callbackUrl, registered } = await searchParams
    console.log("callbackUrl:",callbackUrl);
    // Keep only the path part, so ?callbackUrl=https://evil.com can't redirect off-site
    let target = '/dashboard'
    if (callbackUrl) {
        try {
            const url = new URL(callbackUrl, 'http://localhost')
            target = url.pathname + url.search
            console.log("target:",target);
        } catch {}
    }
    if (target.startsWith('/login') || target.startsWith('/register')) target = '/dashboard'

    const session = await getServerSession(authOptions)
    if (session) redirect(target)

    return (
        <main className="relative flex-1 overflow-hidden pastel-wash">
            <div aria-hidden="true" className="grid-floor" />
            <span aria-hidden="true" className="axis axis-x" />
            <span aria-hidden="true" className="axis axis-z" />
            <div className="relative max-w-md px-4 py-14 mx-auto md:py-20">
            <div className="p-7 card md:p-9">
            <h1 className="mb-1.5 text-3xl font-bold text-center">Welcome back</h1>
            <p className="mb-7 text-center text-muted">Log in to like models, follow makers and upload your own.</p>
            <LoginForm callbackUrl={target} registered={registered === '1'} />
            </div>
            </div>
        </main>
    )
}
