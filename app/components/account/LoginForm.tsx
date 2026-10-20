'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginForm({ callbackUrl, registered }: {
    callbackUrl: string,
    registered: boolean
}) {
    const router = useRouter()
    const [error, setError] = useState('')
    const [pending, setPending] = useState(false)

    async function handleLogin(formData: FormData) {
        setError('')
        setPending(true)
        const res = await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirect: false,
        })
        setPending(false)

        if (!res || res.error) {
            setError('Invalid email or password')
            return
        }
        router.push(callbackUrl)
        router.refresh()   // re-render server components with the new session
    }

    return (
        <form action={handleLogin} className="flex flex-col gap-4">
            {registered && <p role="status" className="px-3.5 py-2.5 text-sm text-green-800 border border-green-200 rounded-xl bg-green-50">Account created. Please log in.</p>}
            <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Email</span>
                <input name="email" type="email" required autoComplete="email" placeholder="you@example.com"
                    className="input" />
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Password</span>
                <input name="password" type="password" required autoComplete="current-password"
                    className="input" />
            </label>

            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

            <button type="submit" disabled={pending}
                className="w-full mt-1 btn-primary min-h-12">
                {pending ? 'Logging in...' : 'Log in'}
            </button>
            <p className="text-sm text-center text-muted">
                No account? <Link href="/register" className="font-semibold text-pink-ink hover:underline">Register</Link>
            </p>
        </form>
    )
}
