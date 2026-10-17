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
/*
There are two reasons.

a) WebGL only exists in the browser. Next.js first renders pages on the server (in Node.js) to build the HTML. The server has no GPU, no window and no WebGL. ssr: false tells Next.js not to render this component on the server. It renders only in the browser.

You might think 'use client' already does that, but it doesn't. Client Components are still pre-rendered once on the server to produce the first HTML. Only ssr: false skips the server completely.

b) Code splitting. three.js is large, roughly 600 KB before compression. A normal import would put it in the page's main JavaScript bundle, and everyone would download it. dynamic(() => import(...)) puts three.js in a separate file that the browser downloads only when it actually shows a 3D model. The catalog grid, login page and dashboard never load it.

Why ModelPreview exists in between: Next.js only allows ssr: false inside a Client Component. The model detail page is a Server Component (it reads from the database), so it can't call dynamic(..., { ssr: false }) itself. ModelPreview is a small Client Component whose only job is to do that. HeroModel does the same for the home page.
*/