'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaCloudArrowUp, FaWandMagicSparkles, FaXmark } from 'react-icons/fa6'
import type { UploadState } from '@/app/dashboard/upload/actions'
import { Category } from '@/app/lib/models'
import { ModelFileViewer } from '../dashboard/ModelFileField'
import { shrinkImage } from '../dashboard/shrinkImage'

const MAX_IMAGE_MB = 5
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const NAME_MAX = 80
const DESCRIPTION_MAX = 500

// Sends the whole model (details, picture and .glb) to POST /api/models in one request.
// XMLHttpRequest rather than fetch, because fetch can't report upload progress.
function saveModel(formData: FormData, onProgress: (percent: number) => void): Promise<UploadState> {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/models')
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
        }
        xhr.onload = () => {
            try {
                resolve(JSON.parse(xhr.responseText) as UploadState)
            } catch {
                resolve({ error: 'Could not save the model. Please try again.' })
            }
        }
        xhr.onerror = () => resolve({ error: 'Network error. Check your connection and try again.' })
        xhr.send(formData)
    })
}

const inputClass = 'input'
const primaryButton = 'btn-primary disabled:cursor-not-allowed'
const secondaryButton = 'btn-ghost border-line'

function FieldError({ messages }: { messages?: string[] }) {
    if (!messages?.length) return null
    return <p className="mt-1 text-sm text-red-600">{messages[0]}</p>
}

// 1. pick an image  2. generate (POST /api/generate returns a .glb)  3. preview it in 3D
// 4. if the user keeps it, ask for a name, description and category  5. save it (POST /api/models)
export default function GenerateModelForm({ categories }: { categories: Category[] }) {
    const router = useRouter()
    const [image, setImage] = useState<{ file: File, previewUrl: string } | null>(null)
    const [imageError, setImageError] = useState<string | null>(null)
    const [generating, setGenerating] = useState(false)
    const [seconds, setSeconds] = useState(0)
    const [generateError, setGenerateError] = useState<string | null>(null)
    const [glb, setGlb] = useState<{ file: File, url: string } | null>(null)
    // On Vercel the server keeps the generated .glb in Blob storage and sends its URL; saving then reuses that file
    const [savedGlbUrl, setSavedGlbUrl] = useState<string | null>(null)
    // A picture of the 3D preview, used as the saved model's image
    const [snapshot, setSnapshot] = useState<Blob | null>(null)
    const [showSaveForm, setShowSaveForm] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [saving, setSaving] = useState(false)
    const [progress, setProgress] = useState<number | null>(null)
    const [state, setState] = useState<UploadState>({})

    function changeImage(file: File | null) {
        setImage(file ? { file, previewUrl: URL.createObjectURL(file) } : null)
        setImageError(null)
        setGenerateError(null)
    }
    useEffect(() => () => {
        if (image) URL.revokeObjectURL(image.previewUrl)
    }, [image])

    function changeGlb(file: File | null) {
        setGlb(file ? { file, url: URL.createObjectURL(file) } : null)
        setSnapshot(null)
        setShowSaveForm(false)
    }
    useEffect(() => () => {
        if (glb) URL.revokeObjectURL(glb.url)
    }, [glb])

    // Counts the seconds while generating, so the user can see it's still working
    useEffect(() => {
        if (!generating) return
        const timer = setInterval(() => setSeconds((s) => s + 1), 1000)
        return () => clearInterval(timer)
    }, [generating])

    function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
        const picked = event.target.files?.[0] ?? null
        event.target.value = ''   // so picking the same file again still fires onChange
        if (!picked) return
        if (!IMAGE_TYPES.includes(picked.type)) return setImageError('Choose a PNG, JPG or WebP image')
        if (picked.size > MAX_IMAGE_MB * 1024 * 1024) return setImageError(`Image must be ${MAX_IMAGE_MB}MB or smaller`)
        changeImage(picked)
    }

    async function generate() {
        if (!image) return
        setSeconds(0)
        setGenerating(true)
        setGenerateError(null)
        changeGlb(null)
        try {
            const body = new FormData()
            body.set('image', image.file)
            const res = await fetch('/api/generate', { method: 'POST', body })
            if (!res.ok) {
                let message = 'Something went wrong. Please try again.'
                try { message = (await res.json()).error ?? message } catch {}
                throw new Error(message)
            }
            let blob: Blob
            if (res.headers.get('content-type')?.includes('application/json')) {
                const { url } = await res.json()
                const file = await fetch(url)
                if (!file.ok) throw new Error('Could not load the generated model. Please try again.')
                blob = await file.blob()
                setSavedGlbUrl(url)
            } else {
                blob = await res.blob()
                setSavedGlbUrl(null)
            }
            changeGlb(new File([blob], 'generated.glb', { type: 'model/gltf-binary' }))
        } catch (err: unknown) {
            // fetch itself throws a TypeError when the request never got an answer
            setGenerateError(err instanceof TypeError ? 'Network error. Check your connection and try again.'
                : err instanceof Error ? err.message : 'Something went wrong. Please try again.')
        } finally {
            setGenerating(false)
        }
    }

    async function handleSave(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!glb) return
        const formData = new FormData(event.currentTarget)   // name, description, category
        // The picture of the 3D preview, or the original picture if the snapshot isn't ready
        const picture = snapshot ? new File([snapshot], 'snapshot.png', { type: 'image/png' }) : image?.file
        formData.set('image', picture ? await shrinkImage(picture) : new File([], ''))
        if (savedGlbUrl) formData.set('modelFileUrl', savedGlbUrl)
        else formData.set('modelFile', glb.file)

        setSaving(true)
        setState({})
        const result = await saveModel(formData, setProgress)
        if (result.modelId) return router.push(`/3d-models/${result.modelId}`)   // stays "Saving..." until the page changes
        setState(result)
        setSaving(false)
        setProgress(null)
    }

    function startOver() {
        changeGlb(null)
        changeImage(null)
    }

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
            <div className="flex flex-col gap-5 p-6 bg-white border border-line rounded-2xl shadow-sm h-fit">
                {/* Step 1: the picture */}
                <div>
                    <span className="block mb-1 text-sm font-medium">Picture</span>
                    {image ? (
                        <div className="flex items-center gap-4 p-3 border border-line rounded-xl">
                            {/* eslint-disable-next-line @next/next/no-img-element -- blob: preview URLs can't go through next/image */}
                            <img src={image.previewUrl} alt="Selected picture" className="object-cover w-20 h-20 rounded-xl" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{image.file.name}</p>
                                <p className="text-xs text-muted">{(image.file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button type="button" onClick={startOver} disabled={generating || saving} aria-label="Remove picture"
                                className="flex items-center justify-center w-8 h-8 text-muted rounded-xl cursor-pointer hover:bg-mist hover:text-red-600 disabled:opacity-40">
                                <FaXmark />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center border-2 border-line border-dashed rounded-xl cursor-pointer hover:border-indigo hover:bg-lavender/30">
                            <FaCloudArrowUp className="text-3xl text-muted/70" aria-hidden="true" />
                            <span className="text-sm font-medium text-ink">Click to choose a picture</span>
                            <span className="text-xs text-muted">PNG, JPG or WebP, up to {MAX_IMAGE_MB}MB. Works best with one object on a plain background.</span>
                            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleImage} />
                        </label>
                    )}
                    {imageError && <p className="mt-1 text-sm text-red-600">{imageError}</p>}
                </div>

                {/* Step 2: generate */}
                {!glb && (
                    <div className="flex justify-end">
                        <button type="button" onClick={generate} disabled={!image || generating} className={primaryButton}>
                            <FaWandMagicSparkles aria-hidden="true" />
                            {generating ? 'Generating...' : 'Generate 3D model'}
                        </button>
                    </div>
                )}
                {generateError && <p className="text-sm text-red-600" role="alert">{generateError}</p>}

                {/* Step 4: keep it? */}
                {glb && !showSaveForm && (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-ink">Your 3D model is ready. Drag the preview to look around it.</p>
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button type="button" onClick={generate} className={secondaryButton}>Generate again</button>
                            <button type="button" onClick={() => setShowSaveForm(true)} className={primaryButton}>Save model</button>
                        </div>
                    </div>
                )}

                {glb && showSaveForm && (
                    <form onSubmit={handleSave} noValidate className="flex flex-col gap-5 pt-5 border-t border-line">
                        <label className="block">
                            <span className="flex justify-between mb-1 text-sm font-medium">
                                Name
                                <span className="font-normal text-muted">{name.length}/{NAME_MAX}</span>
                            </span>
                            <input name="name" type="text" value={name} maxLength={NAME_MAX} placeholder="E.g. Ceramic Teapot" autoFocus
                                onChange={(e) => setName(e.target.value)} className={inputClass} />
                            <FieldError messages={state.fieldErrors?.name} />
                        </label>

                        <label className="block">
                            <span className="flex justify-between mb-1 text-sm font-medium">
                                Description
                                <span className="font-normal text-muted">{description.length}/{DESCRIPTION_MAX}</span>
                            </span>
                            <textarea name="description" rows={4} value={description} maxLength={DESCRIPTION_MAX}
                                placeholder="What is it, and any tips for printing it?"
                                onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-y`} />
                            <FieldError messages={state.fieldErrors?.description} />
                        </label>

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

                        {/* Problems with the files themselves, which have no field of their own here */}
                        <FieldError messages={state.fieldErrors?.image ?? state.fieldErrors?.modelFile} />
                        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button type="button" onClick={() => setShowSaveForm(false)} disabled={saving} className={secondaryButton}>Cancel</button>
                            <button type="submit" disabled={saving} className={`${primaryButton} disabled:cursor-wait`}>
                                {saving ? (progress !== null && progress < 100 ? `Saving 3D model... ${progress}%` : 'Saving...') : 'Save model'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Step 3: loading, then the 3D preview */}
            <aside className="lg:sticky lg:top-6 h-fit">
                <p className="mb-2 text-sm font-medium text-muted">Preview</p>
                <div className="relative w-full overflow-hidden bg-model-bg rounded-2xl shadow-md aspect-square">
                    {glb ? (
                        <ModelFileViewer src={glb.url} name={name || 'your generated model'} onSnapshot={setSnapshot} />
                    ) : (
                        <>
                            {image && (
                                // eslint-disable-next-line @next/next/no-img-element -- blob: URL
                                <img src={image.previewUrl} alt="" className={`object-contain w-full h-full ${generating ? 'opacity-40 blur-sm' : ''}`} />
                            )}
                            {generating ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center" role="status">
                                    <div className="w-12 h-12 border-4 border-lavender rounded-full border-t-pink animate-spin" aria-hidden="true" />
                                    <p className="font-semibold text-ink">Building your 3D model... {seconds}s</p>
                                    <p className="text-sm text-muted">This usually takes 15 to 60 seconds, longer when the free GPU is busy. Keep this page open.</p>
                                </div>
                            ) : !image && (
                                <p className="absolute inset-0 flex items-center justify-center px-6 text-sm text-center text-muted">
                                    Your 3D model will appear here.
                                </p>
                            )}
                        </>
                    )}
                </div>
            </aside>
        </div>
    )
}
