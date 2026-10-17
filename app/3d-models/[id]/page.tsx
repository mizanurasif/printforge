import type { ModelDetailPageProps } from "@/app/lib/models"
import { getModelById } from "@/app/lib/database/database"
import Link from "next/link"
import { FaDownload, FaPen } from "react-icons/fa6"
import DeleteModelButton from "@/app/components/dashboard/DeleteModelButton"
import LikeButton from "@/app/components/Model/LikeButton"
import ModelPreview from "@/app/components/Model/ModelPreview"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
export default async function ModelDetailPage({ params }: ModelDetailPageProps) {
 
    const session = await getServerSession(authOptions)
    const model = await getModelById((await params).id, Number(session?.user.id) || undefined)
    const isOwner = session && model.userId === Number(session.user.id)
    return (
    <div className="container max-w-6xl px-4 py-8 mx-auto">
      <article className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ModelPreview image={model.image} modelFile={model.modelFile} name={model.name} />

        <section className="flex flex-col justify-center h-full">
          <div className="flex items-center mb-2 text-2xl text-gray-600">
            <LikeButton modelId={model.id} initialLikes={model.likes} initialLiked={model.likedByMe}
              className="font-light" iconClassName="w-6 h-6" />
          </div>
          <h1 className="mb-6 text-4xl font-bold">{model.name}</h1>

          {/* Owner-only controls; editModel and deleteModel re-check ownership on the server */}
          {isOwner && (
            <div className="flex items-center gap-2 mb-6">
              <Link href={`/dashboard/edit/${model.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:text-orange-accent">
                <FaPen aria-hidden="true" /> Edit
              </Link>
              <DeleteModelButton id={model.id} name={model.name}
                className="flex items-center justify-center w-9 h-9 border border-gray-300 rounded-md transition-colors" />
            </div>
          )}
          <span
            className="inline-block bg-transparent border border-gray-400 rounded-full px-3 py-1 text-sm text-gray-800 mb-6 w-fit"
            role="status"
            aria-label="Category"
          >
            {model.category}
          </span>

          <div className="mb-6 prose prose-lg max-w-none">
            <p className="leading-relaxed text-gray-700">
              {model.description}
            </p>
          </div>

          {/* The .glb is a static file in /public, so a plain link with "download" saves it under the model's name */}
          {model.modelFile && (
            <a href={model.modelFile} download={`${model.name.trim().replace(/[^\w-]+/g, '-')}.glb`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 mb-6 font-semibold text-white transition-colors rounded-md w-fit bg-orange-400 hover:bg-orange-500">
              <FaDownload aria-hidden="true" /> Download .glb
            </a>
          )}

          <footer className="text-sm text-gray-500">
            {model.creatorName && (
              <p className="mb-1">
                Created by{' '}
                {model.userId ? (
                  <Link href={`/user/${model.userId}`} className="font-medium text-gray-700 hover:text-orange-accent hover:underline">
                    {model.creatorName}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-700">{model.creatorName}</span>
                )}
              </p>
            )}
            <time dateTime={model.dateAdded.toISOString()}>
              Added on {model.dateAdded.toLocaleDateString()}
            </time>
          </footer>
        </section>
      </article>
    </div>
  )
}