'use client'

import dynamic from 'next/dynamic'
import React, { useState } from 'react'
import { FaCube, FaXmark } from 'react-icons/fa6'
import { upload } from '@vercel/blob/client'

const MAX_MODEL_MB = 80   // matches MAX_MODEL_BYTES in app/lib/modelFileUtils.ts, which is the real check

// The live 3D preview in the upload and edit forms (WebGL only exists in the browser, see ModelPreview)
export const ModelFileViewer = dynamic(() => import('@/app/components/Model/ModelViewer'), {
    ssr: false,
    loading: () => <p className="flex items-center justify-center w-full h-full text-sm text-muted">Loading 3D viewer...</p>,
})

// Sends the .glb to its own route after the form is saved. XMLHttpRequest rather than fetch,
// because fetch can't report upload progress and big files take a while.
/* Interview
"The model's details save through a Server Action, then the large .glb is sent as a raw PUT body to a route 
handler that streams it to disk. I used XHR instead of fetch because fetch can't report upload progress, 
and I wrapped it in a Promise so the forms can await it and show the server's error message."
*/
// direct: the server uses Vercel Blob (see app/lib/blobStorage.ts). Vercel caps requests at 4.5MB, so the file goes
// straight from the browser to Blob storage, and only its URL is sent to the route, which checks it before keeping it.
export async function uploadModelFile(modelId: number, file: File, onProgress: (percent: number) => void, direct = false): Promise<void> {
    if (direct) {
        const blob = await upload(`models/m${modelId}/model.glb`, file, {
            access: 'public',
            handleUploadUrl: '/api/models/upload-token',
            contentType: 'model/gltf-binary',
            multipart: file.size > 8 * 1024 * 1024,   // big files go up in parallel parts, retried if one fails
            onUploadProgress: ({ percentage }) => onProgress(Math.round(percentage)),
        })
        const res = await fetch(`/api/models/${modelId}/file`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: blob.url }),
        })
        if (res.ok) return
        let message = 'Upload failed'
        try { message = (await res.json()).error ?? message } catch {}
        throw new Error(message)
    }
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', `/api/models/${modelId}/file`)
        xhr.setRequestHeader('Content-Type', 'model/gltf-binary')
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
        }
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) return resolve()
            let message = 'Upload failed'
            try { message = JSON.parse(xhr.responseText).error ?? message } catch {}
            reject(new Error(message))
        }
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.send(file) // send the real bytes of cat.glb
    })
}

// Quick checks so the user hears about a wrong file right away; the server checks again
async function checkModelFile(file: File): Promise<string | null> {
    if (!file.name.toLowerCase().endsWith('.glb')) return 'Choose a .glb file (binary glTF)'
    if (file.size === 0) return 'This file is empty'
    if (file.size > MAX_MODEL_MB * 1024 * 1024) return `3D model must be ${MAX_MODEL_MB}MB or smaller`
    // A real .glb starts with "glTF", version 2, then its total length (the same check the server makes)
    const header = new DataView(await file.slice(0, 12).arrayBuffer())
    const magic = header.byteLength === 12 ? String.fromCharCode(...new Uint8Array(header.buffer, 0, 4)) : ''
    if (magic !== 'glTF' || header.getUint32(4, true) !== 2) return 'This is not a valid .glb file (binary glTF 2.0)'
    if (header.getUint32(8, true) !== file.size) return 'The .glb file is incomplete or damaged'
    return null
}

const rowClass = 'flex items-center gap-4 p-3 border border-line rounded-xl'
const iconButtonClass = 'flex items-center justify-center w-8 h-8 text-muted rounded-xl cursor-pointer hover:bg-mist hover:text-red-600'

// file: the newly picked .glb. hasCurrent: on the edit page, the model already has one (it can be replaced, not removed).
// serverError: e.g. "Choose a 3D model" from the Server Action
export default function ModelFileField({ file, onChange, hasCurrent = false, serverError }: {
    file: File | null
    onChange: (file: File | null) => void
    hasCurrent?: boolean
    serverError?: string
}) {
    const [error, setError] = useState<string | null>(null)

    async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
        const picked = event.target.files?.[0] ?? null
        event.target.value = ''   // so picking the same file again still fires onChange
        if (!picked) return
        const problem = await checkModelFile(picked)
        setError(problem)
        if (!problem) onChange(picked)
    }

    const fileInput = <input type="file" accept=".glb,model/gltf-binary" className="sr-only" onChange={handleFile} />

    return (
        <div>
            <span className="block mb-1 text-sm font-medium">3D model</span>
            {file ? (
                <div className={rowClass}>
                    <FaCube className="w-8 h-8 text-indigo shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={() => onChange(null)} aria-label={hasCurrent ? 'Keep current 3D model' : 'Remove 3D model'}
                        title={hasCurrent ? 'Keep current 3D model' : undefined} className={iconButtonClass}>
                        <FaXmark />
                    </button>
                </div>
            ) : hasCurrent ? (
                <div className={rowClass}>
                    <FaCube className="w-8 h-8 text-indigo shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Current 3D model</p>
                        <p className="text-xs text-muted">.glb, up to {MAX_MODEL_MB}MB</p>
                    </div>
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-ink border border-line rounded-xl cursor-pointer hover:border-indigo hover:bg-lavender/30">
                        Replace
                        {fileInput}
                    </label>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center border-2 border-line border-dashed rounded-xl cursor-pointer hover:border-indigo hover:bg-lavender/30">
                    <FaCube className="text-3xl text-muted/70" aria-hidden="true" />
                    <span className="text-sm font-medium text-ink">Click to choose a 3D model</span>
                    <span className="text-xs text-muted">.glb, up to {MAX_MODEL_MB}MB. Shown in 3D on your model&apos;s page.</span>
                    {fileInput}
                </label>
            )}
            {(error ?? serverError) && <p className="mt-1 text-sm text-red-600">{error ?? serverError}</p>}
        </div>
    )
}
