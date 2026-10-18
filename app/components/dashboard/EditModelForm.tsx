'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { startTransition, useActionState, useEffect, useState } from 'react'
import { FaCloudArrowUp, FaHeart, FaXmark } from 'react-icons/fa6'
import type { UploadState } from '@/app/dashboard/upload/actions'
import { editModel } from '@/app/dashboard/edit/[id]/action'
import { Category, Model } from '@/app/lib/models'
import ModelFileField, { ModelFileViewer, uploadModelFile } from './ModelFileField'

const initialState: UploadState = {}
const NAME_MAX = 80
const DESCRIPTION_MAX = 500

const inputClass = 'input'

function FieldError({ messages }: { messages?: string[] }) {
    if (!messages?.length) return null
    return <p className="mt-1 text-sm text-red-600">{messages[0]}</p>
}

export default function EditModelForm({ model, categories }: { model: Model , categories: Category[] }) {
    const router = useRouter()
    const [progress, setProgress] = useState<number | null>(null)

    // The .glb is too big for a Server Action (6MB limit), so it's taken out of the form
    // and sent to its own route once the other changes are saved
    async function submit(prevState: UploadState, formData: FormData): Promise<UploadState> {
        const glb = formData.get('modelFile')
        formData.delete('modelFile')
        if (glb instanceof File) formData.set('hasModelFile', '1')

        const result = await editModel(prevState, formData)
        if (!result.modelId || !(glb instanceof File)) return result

        try {
            await uploadModelFile(result.modelId, glb, setProgress)
        } catch (err: unknown) {
            setProgress(null)
            const reason = err instanceof Error ? err.message : 'Upload failed'
            return { error: `Your changes were saved, but the new 3D file couldn't be uploaded (${reason}). Please try again.` }
        }
        router.push(`/3d-models/${result.modelId}`)
        return result
    }
    const [state, formAction, pending] = useActionState(submit, initialState)

    // Controlled fields drive the live preview and survive a failed submit
    const [name, setName] = useState(model.name)
    const [description, setDescription] = useState(model.description)
    const [category, setCategory] = useState(model.category)
    const [image, setImage] = useState<{ file: File, previewUrl: string } | null>(null)
    const imageFile = image?.file ?? null
    // A newly picked file's blob URL, otherwise the model's current image
    const previewUrl = image?.previewUrl ?? model.image
    const [modelFile, setModelFile] = useState<{ file: File, url: string } | null>(null)
    // A picture of the new 3D model, used as the new image when no image is chosen
    const [snapshot, setSnapshot] = useState<Blob | null>(null)

    function changeModelFile(file: File | null) {
        setModelFile(file ? { file, url: URL.createObjectURL(file) } : null)
        setSnapshot(null)
    }
    useEffect(() => () => {
        if (modelFile) URL.revokeObjectURL(modelFile.url)
    }, [modelFile])
    // What the 3D preview shows: the newly picked file, else the current one
    const viewerSrc = modelFile?.url ?? model.modelFile

    function changeImage(file: File | null) {
        setImage(file ? { file, previewUrl: URL.createObjectURL(file) } : null)
        //console.log("url",image?.previewUrl)
    }
    function handleUploadedImage(event: React.ChangeEvent<HTMLInputElement>)
    {
        const file = event.target.files?.[0] ?? null;
        changeImage(file)
  
    }
    // Free the previous preview's memory when the image changes or the page is left
    useEffect(() => () => {
        if (image) URL.revokeObjectURL(image.previewUrl)
    }, [image])

    // Submit manually: a plain `action={formAction}` resets the form afterwards,
    // which would wipe the user's input (and chosen image) when validation fails
    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const snapshotImage = modelFile && snapshot ? new File([snapshot], 'snapshot.png', { type: 'image/png' }) : null
        formData.set('image', imageFile ?? snapshotImage ?? new File([], ''))
        formData.set('modelId', model.id.toString())
        if (modelFile) formData.set('modelFile', modelFile.file)
        startTransition(() => formAction(formData))
    }

    const categoryLabel = categories.find((c) => c.slug === category)?.displayName

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 p-6 bg-white border border-line rounded-2xl shadow-sm">
                {/* Image */}
                <div>
                    <span className="block mb-1 text-sm font-medium">Image <span className="font-normal text-muted">(optional)</span></span>
                    <div className="flex items-center gap-4 p-3 border border-line rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element -- blob: preview URLs can't go through next/image */}
                        <img src={previewUrl} alt="Model image" className="object-cover w-20 h-20 rounded-xl" />
                        <div className="flex-1 min-w-0">
                            {imageFile ? (
                                <>
                                    <p className="text-sm font-medium truncate">{imageFile.name}</p>
                                    <p className="text-xs text-muted">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-medium">Current image</p>
                                    <p className="text-xs text-muted">PNG, JPG or WebP, up to 5MB</p>
                                </>
                            )}
                        </div>
                        {imageFile ? (
                            <button type="button" onClick={() => changeImage(null)} aria-label="Undo image change" title="Keep current image"
                                className="flex items-center justify-center w-8 h-8 text-muted rounded-xl cursor-pointer hover:bg-mist hover:text-red-600">
                                <FaXmark />
                            </button>
                        ) : (
                            <label className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-ink border border-line rounded-xl cursor-pointer hover:border-indigo hover:bg-lavender/30">
                                <FaCloudArrowUp aria-hidden="true" /> Change
                                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only"
                                    onChange={handleUploadedImage} />
                            </label>
                        )}
                    </div>
                    <FieldError messages={state.fieldErrors?.image} />
                </div>

                <ModelFileField file={modelFile?.file ?? null} onChange={changeModelFile}
                    hasCurrent={model.modelFile !== null} serverError={state.fieldErrors?.modelFile?.[0]} />

                {/* Name */}
                <label className="block">
                    <span className="flex justify-between mb-1 text-sm font-medium">
                        Name
                        <span className="font-normal text-muted/70">{name.length}/{NAME_MAX}</span>
                    </span>
                    <input name="name" type="text" value={name} maxLength={NAME_MAX} placeholder="E.g. Articulated Dragon"
                        onChange={(e) => setName(e.target.value)} className={inputClass} />
                    <FieldError messages={state.fieldErrors?.name} />
                </label>

                {/* Description */}
                <label className="block">
                    <span className="flex justify-between mb-1 text-sm font-medium">
                        Description
                        <span className="font-normal text-muted/70">{description.length}/{DESCRIPTION_MAX}</span>
                    </span>
                    <textarea name="description" rows={5} value={description} maxLength={DESCRIPTION_MAX}
                        placeholder="What is it, how does it print, any supports needed?"
                        onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-y`} />
                    <FieldError messages={state.fieldErrors?.description} />
                </label>

                {/* Category */}
                <label className="block">
                    <span className="block mb-1 text-sm font-medium">Category</span>
                    <select name="category" value={category} onChange={(e) => setCategory(e.target.value)}
                        className={`${inputClass} bg-white`}>
                        <option value="" disabled>Choose a category</option>
                        {categories.map((c) => (
                            <option key={c.slug} value={c.slug}>{c.displayName}</option>
                        ))}
                    </select>
                    <FieldError messages={state.fieldErrors?.category} />
                </label>

                {state.error && <p className="text-sm text-red-600">{state.error}</p>}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <Link href="/dashboard" className="btn-ghost border-line">
                        Cancel
                    </Link>
                    <button type="submit" disabled={pending}
                        className="btn-primary">
                        {pending ? (progress !== null ? `Uploading 3D model... ${progress}%` : 'Saving...') : 'Save changes'}
                    </button>
                </div>
            </form>

            {/* Live preview */}
            <aside className="lg:sticky lg:top-6 h-fit">
                <p className="mb-2 text-sm font-medium text-muted">Preview</p>
                <div className="overflow-hidden bg-white rounded-2xl shadow-md">
                    {viewerSrc ? (
                        <div className="w-full aspect-square bg-model-bg">
                            <ModelFileViewer src={viewerSrc} name={name || 'your model'}
                                onSnapshot={modelFile ? setSnapshot : undefined} />
                        </div>
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element -- may be a blob: URL
                        <img src={previewUrl} alt="" className="object-cover w-full aspect-square bg-model-bg" />
                    )}
                    <div className="p-4">
                        <h3 className="text-xl font-semibold text-ink line-clamp-2">{name || 'Model name'}</h3>
                        <p className="mt-2 text-sm text-ink line-clamp-2">{description || 'Your description will appear here.'}</p>
                        <span className="inline-block px-3 py-1 mt-2 text-sm text-ink border border-line rounded-full">
                            {categoryLabel ?? 'Category'}
                        </span>
                        <div className="flex items-center mt-2 text-muted">
                            <FaHeart className="w-4 h-4 mr-1 text-muted/40" aria-hidden="true" /> 0
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    )
}
