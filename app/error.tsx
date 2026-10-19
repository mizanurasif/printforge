'use client'

import Link from 'next/link'
import { FaTriangleExclamation } from 'react-icons/fa6'

// Shown when a page fails unexpectedly (e.g. the database can't be reached)
export default function ErrorPage({ reset }: { error: Error & { digest?: string }, reset: () => void }) {
    return (
        <main className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
            <span aria-hidden="true" className="grid w-16 h-16 mb-2 place-items-center rounded-2xl bg-blush text-pink-ink">
                <FaTriangleExclamation className="w-7 h-7" />
            </span>
            <h1 className="text-3xl font-bold">Something went wrong</h1>
            <p className="text-muted">Please try again in a moment.</p>
            <div className="flex flex-wrap justify-center gap-3 mt-3">
                <button type="button" onClick={reset} className="btn-primary">Try again</button>
                <Link href="/" className="btn-ghost border-line">Go home</Link>
            </div>
        </main>
    )
}
