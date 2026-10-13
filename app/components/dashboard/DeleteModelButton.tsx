'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FaTrash, FaTriangleExclamation } from 'react-icons/fa6'
import { deleteModelAction } from '@/app/dashboard/upload/actions'

// Its own client component so MyModelsTable can stay a Server Component
export default function DeleteModelButton({ id, name, className }: { id: number, name: string, className: string }) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [pending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    function openDialog() {
        setError(null)
        dialogRef.current?.showModal()
    }

    function closeDialog() {
        if (!pending) dialogRef.current?.close()
    }

    function handleDelete() {
        startTransition(async () => {
            const result = await deleteModelAction(id)
            if (result.error) {
                setError(result.error)
                return
            }
            dialogRef.current?.close()
            // This row disappears after the delete, so the dashboard page shows the success popup
            router.replace(`/dashboard?deleted=${encodeURIComponent(name)}`, { scroll: false })
        })
    }

    return (
        <>
            <button type="button" onClick={openDialog} aria-label={`Delete ${name}`} title="Delete"
                className={`${className} text-gray-600 cursor-pointer hover:bg-red-50 hover:text-red-600`}>
                <FaTrash />
            </button>

            {/* The dialog has no padding, so a click whose target is the dialog itself landed on the backdrop */}
            <dialog ref={dialogRef} aria-labelledby={`delete-title-${id}`}
                onCancel={(e) => { if (pending) e.preventDefault() }}
                onClick={(e) => { if (e.target === e.currentTarget) closeDialog() }}
                className="w-[calc(100%-2rem)] max-w-md p-0 m-auto bg-white rounded-lg shadow-xl backdrop:bg-black/50">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-10 h-10 text-red-600 bg-red-100 rounded-full shrink-0">
                            <FaTriangleExclamation aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <h2 id={`delete-title-${id}`} className="text-lg font-semibold text-gray-900">Delete model?</h2>
                            <p className="mt-1 text-sm text-gray-600 break-words">
                                &ldquo;{name}&rdquo; and its image will be permanently deleted. This can&apos;t be undone.
                            </p>
                            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 mt-6 sm:flex-row sm:justify-end">
                        <button type="button" onClick={closeDialog} disabled={pending} autoFocus
                            className="px-4 py-2 font-semibold text-gray-700 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 disabled:opacity-60">
                            Cancel
                        </button>
                        <button type="button" onClick={handleDelete} disabled={pending}
                            className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md cursor-pointer hover:bg-red-700 disabled:opacity-60 disabled:cursor-wait">
                            {pending ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    )
}
