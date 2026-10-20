import type { Model, ModelDetailPageProps } from "@/app/lib/models"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export async function generateMetadata({ params }: ModelDetailPageProps): Promise<Metadata> {
    const { id } = await params
    const model = /^\d+$/.test(id) ? await getModelById(id).catch(() => null) : null
    return model ? { title: model.name, description: model.description } : { title: 'Model not found' }
}
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
    const { id } = await params
    // Deleted models and ids like "abc" don't exist: show the "not found" page instead of an error
    if (!/^\d+$/.test(id)) notFound()
    let model: Model
    try {
        model = await getModelById(id, Number(session?.user.id) || undefined)
    } catch (error) {
        // getModelById throws "Model with id … not found" for a missing row; anything else (e.g. the database
        // being down) goes to app/error.tsx instead of pretending the model doesn't exist
        if (error instanceof Error && /not found/i.test(error.message)) notFound()
        throw error
    }
    const isOwner = session && model.userId === Number(session.user.id)
    return (
    <div className="pt-2 md:pt-6">
      <article className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <ModelPreview image={model.image} modelFile={model.modelFile} name={model.name} />

        <section className="flex flex-col justify-center h-full">
          <Link href={`/3d-models/categories/${model.category}`} aria-label={`Category: ${categoryLabel(model.category)}`}
            className="mb-4 inline-block border border-line bg-white rounded-full px-3 py-1 text-sm text-muted w-fit transition-colors hover:border-ink hover:text-ink">
            {categoryLabel(model.category)}
          </Link>
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
            {/* A file in /public downloads with a plain "download" link. Browsers ignore "download" for files on
                another site (Vercel Blob), so those ask Blob for a download with ?download=1 instead */}
            {model.modelFile && (
              <a href={model.modelFile.startsWith('https://') ? `${model.modelFile}${model.modelFile.includes('?') ? '&' : '?'}download=1` : model.modelFile}
                download={`${model.name.trim().replace(/[^\w-]+/g, '-')}.glb`}
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
