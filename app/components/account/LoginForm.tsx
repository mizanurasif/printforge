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
            {registered && <p className="text-sm text-green-700">Account created. Please log in.</p>}
            <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Email</span>
                <input name="email" type="email" required autoComplete="email"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-orange-accent" />
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Password</span>
                <input name="password" type="password" required autoComplete="current-password"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-orange-accent" />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button type="submit" disabled={pending}
                className="py-2 font-semibold text-white bg-orange-400 rounded-md cursor-pointer hover:bg-orange-500 disabled:opacity-60">
                {pending ? 'Logging in...' : 'Log in'}
            </button>
            <p className="text-sm text-center text-gray-600">
                No account? <Link href="/register" className="text-orange-accent">Register</Link>
            </p>
        </form>
    )
}
