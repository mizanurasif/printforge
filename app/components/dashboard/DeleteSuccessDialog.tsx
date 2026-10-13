'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FaCircleCheck } from 'react-icons/fa6'

// Shown by the dashboard when the URL has ?deleted=<name>; closing it clears the param
export default function DeleteSuccessDialog({ name }: { name: string }) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const router = useRouter()

    useEffect(() => {
        const dialog = dialogRef.current
        if (dialog && !dialog.open) dialog.showModal()
    }, [])

    return (
        // onClose also fires for Esc, so every way of closing clears the URL
        <dialog ref={dialogRef} aria-labelledby="delete-success-title"
            onClose={() => router.replace('/dashboard', { scroll: false })}
            onClick={(e) => { if (e.target === e.currentTarget) dialogRef.current?.close() }}
            className="w-[calc(100%-2rem)] max-w-sm p-0 m-auto bg-white rounded-lg shadow-xl backdrop:bg-black/50">
            <div className="flex flex-col items-center p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 text-2xl text-green-600 bg-green-100 rounded-full">
                    <FaCircleCheck aria-hidden="true" />
                </div>
                <h2 id="delete-success-title" className="mt-4 text-lg font-semibold text-gray-900">Model deleted</h2>
                <p className="mt-1 text-sm text-gray-600 break-words">&ldquo;{name}&rdquo; was deleted successfully.</p>
                <button type="button" onClick={() => dialogRef.current?.close()} autoFocus
                    className="w-full px-4 py-2 mt-6 font-semibold text-white rounded-md cursor-pointer bg-orange-400 hover:bg-orange-500">
                    OK
                </button>
            </div>
        </dialog>
    )
}
