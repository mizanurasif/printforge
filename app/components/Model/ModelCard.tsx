import Link from "next/link"
import Pill from "@/app/components/Pill"
import LikeButton from "@/app/components/Model/LikeButton"
import { ModelCardProps } from "@/app/lib/models"
import Image from "next/image"

// The card can't be one big <Link>: the creator link inside it would be a link inside a link (invalid HTML).
// Instead the title link stretches over the whole card (after:inset-0), and the creator link sits above it (z-10).

export default function ModelCard({ model }: ModelCardProps) {
    return (
        <article className="relative flex flex-col overflow-hidden transition duration-200 bg-white border group border-line rounded-2xl hover:-translate-y-[3px] hover:border-pink hover:shadow-[0_14px_30px_-18px_rgb(23_21_43/0.35)]">
            <div className="relative aspect-square bg-model-bg">
                <Image
                    src={model.image}
                    alt={model.name}
                    width={500}
                    height={500}
                    className="absolute inset-0 object-cover w-full h-full transition-transform duration-300 group-hover:scale-[1.03]"
                />
            </div>
            <div className="flex flex-col flex-1 gap-1.5 px-4 pt-3.5 pb-3">
                <h2 className="text-base font-semibold leading-snug line-clamp-2">
                    <Link href={`/3d-models/${model.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                        {model.name}
                    </Link>
                </h2>
                <p className="text-sm text-muted line-clamp-2 min-h-[2.5rem] leading-[1.25rem]">
                    {model.description}
                </p>
                {model.creatorName && (
                    <p className="text-[13px] text-muted">
                        by{' '}
                        {model.userId ? (
                            <Link href={`/user/${model.userId}`} className="relative z-10 font-semibold text-ink hover:text-pink-ink hover:underline">
                                {model.creatorName}
                            </Link>
                        ) : <b className="font-semibold text-ink">{model.creatorName}</b>}
                    </p>
                )}
                <div className="flex items-center justify-between gap-2 mt-auto pt-1.5">
                    <Pill className="truncate">{model.category}</Pill>
                    <LikeButton modelId={model.id} initialLikes={model.likes} initialLiked={model.likedByMe}
                        className="relative z-10 p-1.5 -mr-1.5 text-[13px] font-semibold text-muted" iconClassName="w-[17px] h-[17px]" />
                </div>
            </div>
        </article>
    )
}
