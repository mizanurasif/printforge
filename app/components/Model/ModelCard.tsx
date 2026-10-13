import Link from "next/link"
import Pill from "@/app/components/Pill"
import LikeButton from "@/app/components/Model/LikeButton"
import { ModelCardProps } from "@/app/lib/models"
import Image from "next/image"

// The card can't be one big <Link>: the creator link inside it would be a link inside a link (invalid HTML).
// Instead the title link stretches over the whole card (after:inset-0), and the creator link sits above it (z-10).

export default function ModelCard({ model }: ModelCardProps) {
    return (
        <article className="relative block group hover:shadow-[0_5px_12px_rgba(0,0,0,0.1)] hover:-translate-y-[3px] transition-all">
            <div className="overflow-hidden transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
                <div className="relative aspect-square">
                    <Image
                        src={model.image}
                        alt={model.name}
                        width={500}
                        height={500}
                        className="absolute inset-0 object-cover w-full h-full"
                    />
                </div>
                <div className="p-4">
                    <div className="flex justify-between mb-2 min-h-[3.5rem]">
                        <h2 className="text-xl font-semibold text-gray-800 line-clamp-2">
                            <Link href={`/3d-models/${model.id}`} className="after:absolute after:inset-0">
                                {model.name}
                            </Link>
                        </h2>
                    </div>
                    <p className="text-gray-800 text-sm line-clamp-2 min-h-[2.5rem] leading-[1.25rem]">
                        {model.description}
                    </p>
                    {model.creatorName && (
                        <p className="mt-1 text-xs text-gray-500">
                            by{' '}
                            {model.userId ? (
                                <Link href={`/user/${model.userId}`} className="relative z-10 font-medium text-gray-700 hover:text-orange-accent hover:underline">
                                    {model.creatorName}
                                </Link>
                            ) : model.creatorName}
                        </p>
                    )}
                    <div className="mt-2">
                        <Pill>{model.category}</Pill>
                    </div>
                    <div className="flex items-center mt-2 text-gray-600">
                        <LikeButton modelId={model.id} initialLikes={model.likes} initialLiked={model.likedByMe}
                            className="relative z-10" />
                    </div>
                </div>
            </div>
        </article>
    )
}
