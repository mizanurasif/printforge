'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'

// The viewer's code (and three.js with it) is split into its own chunk, loaded in the browser only.
// ssr: false is only allowed in Client Components, which is why this file exists between the page and the viewer.
const ModelViewer = dynamic(() => import('./ModelViewer'), {
    ssr: false,
    loading: () => <p className="flex items-center justify-center h-full text-gray-500">Loading 3D viewer...</p>,
})

// Shows the 3D model when there is one, otherwise the image
export default function ModelPreview({ image, modelFile, name }: {
    image: string
    modelFile: string | null
    name: string
}) {
    return (
        <figure className="relative overflow-hidden rounded-lg shadow-lg aspect-square bg-gray-100">
            {modelFile ? (
                <ModelViewer src={modelFile} name={name} poster={image} />
            ) : (
                <Image width={500} height={500} src={image} alt={name} loading="eager"
                    className="absolute inset-0 object-cover w-full h-full" />
            )}
        </figure>
    )
}
