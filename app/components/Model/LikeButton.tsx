'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { FaHeart, FaRegHeart } from 'react-icons/fa6'
import { toggleLikeAction } from '@/app/3d-models/actions'

// Used by ModelCard and the model detail page. Updates the count right away, then syncs with the database.
export default function LikeButton({ modelId, initialLikes, initialLiked, className = '', iconClassName = 'w-5 h-5' }: {
    modelId: number
    initialLikes: number
    initialLiked: boolean
    className?: string
    iconClassName?: string
}) {
    const [likes, setLikes] = useState(initialLikes)
    const [liked, setLiked] = useState(initialLiked)
    const [isPending, startTransition] = useTransition()
    const { status } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    function goToLogin() {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
    }

    function handleLike() {
        if (status === 'unauthenticated') return goToLogin()

        const nextLiked = !liked
        setLiked(nextLiked)
        setLikes(prev => prev + (nextLiked ? 1 : -1))

        startTransition(async () => {
            const result = await toggleLikeAction(modelId, nextLiked)
            if ('error' in result) {
                setLiked(!nextLiked)                            // undo the optimistic update
                setLikes(prev => prev - (nextLiked ? 1 : -1))
                if (result.error === 'unauthenticated') goToLogin()
                return
            }
            setLikes(result.likes)                              // the real count, including other users' likes
        })
    }

    const Icon = liked ? FaHeart : FaRegHeart
    return (
        <button type="button" onClick={handleLike} disabled={isPending}
            aria-pressed={liked} aria-label={`${liked ? 'Unlike' : 'Like'} (${likes} ${likes === 1 ? 'like' : 'likes'})`}
            className={`flex items-center cursor-pointer disabled:cursor-wait ${className}`}>
            <Icon className={`${iconClassName} mr-1 ${liked ? 'text-red-500' : 'text-gray-400'}`} aria-hidden="true" />
            <span>{likes}</span>
        </button>
    )
}
