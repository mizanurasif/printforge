'use client'

import Link from 'next/link'
import React, { startTransition, useActionState } from 'react'
import { registerUser, type RegisterState } from '../../register/actions'

const initialState: RegisterState = {}

function FieldError({ id, message }: { id: string, message?: string }) {
    if (!message) return null
    return <span id={id} className="text-sm text-red-600">{message}</span>
}

export default function RegisterForm() {
    const [state, formAction, pending] = useActionState(registerUser, initialState)

    // Submit manually: a plain `action={formAction}` resets the form afterwards,
    // which would wipe everything the user typed when the server reports an error
    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        startTransition(() => formAction(formData))
    }

    // "Email already registered" belongs to the Email field; other server errors stay at the bottom
    const emailError = state.fieldErrors?.email?.[0] ?? (state.error && /email/i.test(state.error) ? state.error : undefined)
    const formError = state.error && !/email/i.test(state.error) ? state.error : undefined
    const nameError = state.fieldErrors?.name?.[0]
    const passwordError = state.fieldErrors?.password?.[0]

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Name</span>
                <input name="name" type="text" required minLength={2} autoComplete="name"
                    aria-invalid={!!nameError} aria-describedby={nameError ? 'name-error' : undefined}
                    className="input" />
                <FieldError id="name-error" message={nameError} />
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Email</span>
                <input name="email" type="email" required autoComplete="email" placeholder="you@example.com"
                    aria-invalid={!!emailError} aria-describedby={emailError ? 'email-error' : undefined}
                    className="input" />
                <FieldError id="email-error" message={emailError} />
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Password</span>
                <input name="password" type="password" required minLength={8} autoComplete="new-password"
                    aria-invalid={!!passwordError} aria-describedby={passwordError ? 'password-hint password-error' : 'password-hint'}
                    className="input" />
                <span id="password-hint" className="text-xs text-muted">At least 8 characters</span>
                <FieldError id="password-error" message={passwordError} />
            </label>

            {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}

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
