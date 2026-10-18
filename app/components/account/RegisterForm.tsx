'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { registerUser, type RegisterState } from '../../register/actions'

const initialState: RegisterState = {}

export default function RegisterForm() {
    const [state, formAction, pending] = useActionState(registerUser, initialState)

    return (
        <form action={formAction} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Name</span>
                <input name="name" type="text" required autoComplete="name"
                    className="input" />
                {state.fieldErrors?.name && <span className="text-sm text-red-600">{state.fieldErrors.name[0]}</span>}
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Email</span>
                <input name="email" type="email" required autoComplete="email" placeholder="you@example.com"
                    className="input" />
                {state.fieldErrors?.email && <span className="text-sm text-red-600">{state.fieldErrors.email[0]}</span>}
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Password</span>
                <input name="password" type="password" required minLength={8} autoComplete="new-password"
                    className="input" />
                {state.fieldErrors?.password && <span className="text-sm text-red-600">{state.fieldErrors.password[0]}</span>}
            </label>

            {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}

            <button type="submit" disabled={pending}
                className="w-full mt-1 btn-primary min-h-12">
                {pending ? 'Creating account...' : 'Create account'}
            </button>
            <p className="text-sm text-center text-muted">
                Already have an account? <Link href="/login" className="font-semibold text-pink-ink hover:underline">Log in</Link>
            </p>
        </form>
    )
}
