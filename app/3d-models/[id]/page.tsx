import type { ModelDetailPageProps } from "@/app/lib/models"
import { getModelById } from "@/app/lib/database/database"
import Link from "next/link"
import { FaDownload, FaPen } from "react-icons/fa6"
import DeleteModelButton from "@/app/components/dashboard/DeleteModelButton"
import LikeButton from "@/app/components/Model/LikeButton"
import ModelPreview from "@/app/components/Model/ModelPreview"
import { categoryLabel } from "@/app/components/categoryLabel"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
export default async function ModelDetailPage({ params }: ModelDetailPageProps) {
 
    const session = await getServerSession(authOptions)
    const model = await getModelById((await params).id, Number(session?.user.id) || undefined)
    const isOwner = session && model.userId === Number(session.user.id)
    return (
    <div className="pt-2 md:pt-6">
      <article className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <ModelPreview image={model.image} modelFile={model.modelFile} name={model.name} />

        <section className="flex flex-col justify-center h-full">
          <span className="mb-4 inline-block border border-line bg-white rounded-full px-3 py-1 text-sm text-muted w-fit"
            role="status" aria-label="Category">
            {categoryLabel(model.category)}
          </span>
          <h1 className="mb-3 text-4xl font-bold tracking-tight">{model.name}</h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-6 text-sm text-muted">
            {model.creatorName && (
              <p>
                by{' '}
                {model.userId ? (
                  <Link href={`/user/${model.userId}`} className="font-semibold text-ink hover:text-pink-ink hover:underline">
                    {model.creatorName}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink">{model.creatorName}</span>
                )}
              </p>
            )}
            <time dateTime={model.dateAdded.toISOString()}>
              Added {model.dateAdded.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </time>
          </div>

          <p className="mb-8 leading-relaxed text-muted max-w-[60ch]">
            {model.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* The .glb is a static file in /public, so a plain link with "download" saves it under the model's name */}
            {model.modelFile && (
              <a href={model.modelFile} download={`${model.name.trim().replace(/[^\w-]+/g, '-')}.glb`}
                className="btn-primary min-h-12 px-6">
                <FaDownload aria-hidden="true" /> Download .glb
              </a>
            )}
            <LikeButton modelId={model.id} initialLikes={model.likes} initialLiked={model.likedByMe}
              className="gap-0.5 px-5 bg-white border rounded-full min-h-12 border-line font-semibold text-ink hover:border-pink"
              iconClassName="w-5 h-5" />
          </div>

          {/* Owner-only controls; editModel and deleteModel re-check ownership on the server */}
          {isOwner && (
            <div className="flex items-center gap-2 pt-5 border-t border-line">
              <span className="mr-auto text-sm text-muted">This is your model</span>
              <Link href={`/dashboard/edit/${model.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white border rounded-full border-line text-ink hover:border-ink">
                <FaPen aria-hidden="true" /> Edit
              </Link>
              <DeleteModelButton id={model.id} name={model.name}
                className="flex items-center justify-center w-9 h-9 bg-white border border-line rounded-full transition-colors" />
            </div>
          )}
        </section>
      </article>
    </div>
  )
}
