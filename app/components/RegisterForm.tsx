'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { registerUser, type RegisterState } from '../register/actions'

const initialState: RegisterState = {}

export default function RegisterForm() {
    const [state, formAction, pending] = useActionState(registerUser, initialState)

    return (
        <form action={formAction} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Name</span>
                <input name="name" type="text" required autoComplete="name"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-orange-accent" />
                {state.fieldErrors?.name && <span className="text-sm text-red-600">{state.fieldErrors.name[0]}</span>}
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Email</span>
                <input name="email" type="email" required autoComplete="email"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-orange-accent" />
                {state.fieldErrors?.email && <span className="text-sm text-red-600">{state.fieldErrors.email[0]}</span>}
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Password</span>
                <input name="password" type="password" required minLength={8} autoComplete="new-password"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-orange-accent" />
                {state.fieldErrors?.password && <span className="text-sm text-red-600">{state.fieldErrors.password[0]}</span>}
            </label>

            {state.error && <p className="text-sm text-red-600">{state.error}</p>}

            <button type="submit" disabled={pending}
                className="py-2 font-semibold text-white bg-orange-400 rounded-md cursor-pointer hover:bg-orange-500 disabled:opacity-60">
                {pending ? 'Creating account...' : 'Create account'}
            </button>
            <p className="text-sm text-center text-gray-600">
                Already have an account? <Link href="/login" className="text-orange-accent">Log in</Link>
            </p>
        </form>
    )
}
