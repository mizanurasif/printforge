'use client'

import { useRef, useState, useTransition } from 'react'
import { signOut } from 'next-auth/react'
import { FaTrash, FaTriangleExclamation } from 'react-icons/fa6'
import { deleteAccountAction } from '@/app/dashboard/actions'

export default function DeleteAccountButton() {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [pending, startTransition] = useTransition()
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)

    function openDialog() {
        setPassword('')
        setError(null)
        dialogRef.current?.showModal()
    }

    function closeDialog() {
        if (!pending) dialogRef.current?.close()
    }

    function handleDelete(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        startTransition(async () => {
            const result = await deleteAccountAction(password)
            if (result.error) {
                setError(result.error)
                return
            }
            // The account is gone; clear the session cookie and leave the dashboard
            await signOut({ callbackUrl: '/' })
        })
    }

    return (
        <>
            <button type="button" onClick={openDialog}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 font-semibold text-red-600 border border-red-300 rounded-full cursor-pointer hover:bg-red-50">
                <FaTrash aria-hidden="true" /> Delete account
            </button>

            {/* The dialog has no padding, so a click whose target is the dialog itself landed on the backdrop */}
            <dialog ref={dialogRef} aria-labelledby="delete-account-title"
                onCancel={(e) => { if (pending) e.preventDefault() }}
                onClick={(e) => { if (e.target === e.currentTarget) closeDialog() }}
                className="w-[calc(100%-2rem)] max-w-md p-0 m-auto bg-white rounded-2xl shadow-xl backdrop:bg-black/50">
                <form onSubmit={handleDelete} className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-10 h-10 text-red-600 bg-red-100 rounded-full shrink-0">
                            <FaTriangleExclamation aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 id="delete-account-title" className="text-lg font-semibold text-ink">Delete your account?</h2>
                            <p className="mt-1 text-sm text-muted">
                                Your account, all your models and their images will be permanently deleted. This can&apos;t be undone.
                            </p>
                            <label className="block mt-4">
                                <span className="block mb-1 text-sm font-medium">Enter your password to confirm</span>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password" required autoFocus
                                    className="input focus:outline-red-500" />
                            </label>
                            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 mt-6 sm:flex-row sm:justify-end">
                        <button type="button" onClick={closeDialog} disabled={pending}
                            className="btn-ghost border-line">
                            Cancel
                        </button>
                        <button type="submit" disabled={pending || !password}
                            className="px-4 py-2 font-semibold text-white bg-red-600 rounded-full cursor-pointer hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed">
                            {pending ? 'Deleting...' : 'Delete account'}
                        </button>
                    </div>
                </form>
            </dialog>
        </>
    )
}
