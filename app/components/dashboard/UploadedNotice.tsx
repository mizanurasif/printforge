'use client'

import { useRouter } from 'next/navigation'
import { FaCircleCheck, FaXmark } from 'react-icons/fa6'

// Shown by My account after an upload (?uploaded=<name>). Closing it clears the address, so a refresh doesn't bring it back.
export default function UploadedNotice({ name }: { name: string }) {
    const router = useRouter()
    return (
        <div role="status" className="flex items-start gap-3 p-4 mb-6 text-sm text-green-800 border border-green-200 rounded-2xl bg-green-50">
            <FaCircleCheck className="mt-0.5 shrink-0" aria-hidden="true" />
            <p className="flex-1">
                <span className="font-semibold">&ldquo;{name}&rdquo; was uploaded.</span>{' '}
                You&apos;ll find it in your models below.
            </p>
            <button type="button" onClick={() => router.replace('/dashboard', { scroll: false })} aria-label="Close message"
                className="flex items-center justify-center w-8 h-8 -m-1.5 rounded-full cursor-pointer shrink-0 hover:bg-green-100">
                <FaXmark aria-hidden="true" />
            </button>
        </div>
    )
}
