'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import React, { useRef, useState } from 'react'

export default function LoginForm({ callbackUrl, registered }: {
    callbackUrl: string,
    registered: boolean
}) {
    const [error, setError] = useState('')
    const [pending, setPending] = useState(false)
    const passwordRef = useRef<HTMLInputElement>(null)

    // onSubmit rather than <form action>: a form action resets every field afterwards, which would also wipe the
    // email after a wrong password
    async function handleLogin(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        setError('')
        setPending(true)
        const res = await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirect: false,
        })

        if (!res || res.error) {
            setPending(false)
            setError('Invalid email or password')
            // Keep the email; clear only the password and put the cursor back in it
            if (passwordRef.current) { passwordRef.current.value = ''; passwordRef.current.focus() }
            return
        }
        // A full page load, so the new session cookie is used everywhere at once. A client-side router.push here
        // left the page blank when the target was a protected page (e.g. /dashboard/upload)
        window.location.assign(callbackUrl)
    }

    return (
        <form onSubmit={handleLogin} onInput={() => error && setError('')} className="flex flex-col gap-4">
            {registered && <p role="status" className="px-3.5 py-2.5 text-sm text-green-800 border border-green-200 rounded-xl bg-green-50">Account created. Please log in.</p>}
            <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Email</span>
                <input name="email" type="email" required autoComplete="email" placeholder="you@example.com"
                    className="input" />
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Password</span>
                <input ref={passwordRef} name="password" type="password" required autoComplete="current-password"
                    className="input" />
            </label>

            {error && <p id="login-error" role="alert" className="text-sm text-red-600">{error}</p>}

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
