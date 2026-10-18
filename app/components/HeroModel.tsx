'use client'

import dynamic from 'next/dynamic'

// Same viewer as the model pages, loaded in the browser only (ssr: false needs a Client Component)
const ModelViewer = dynamic(() => import('./Model/ModelViewer'), { ssr: false })

// The phoenix's two materials, recoloured to the site's pastel palette
const PASTEL_TEXTURES = {
    '01a': '/phoenix-bird/textures/pastel-01a.png',
    '01b': '/phoenix-bird/textures/pastel-01b.png',
}

// The animated phoenix on the home page. Zoom is off so scrolling over it still scrolls the page.
export default function HeroModel() {
    return (
        <div className="relative w-full min-w-0 max-w-[600px] aspect-square md:flex-1">
            {/* A soft lavender halo and floor shadow behind the bird */}
            <div aria-hidden="true" className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgb(228_231_251/0.95)_0_30%,rgb(217_211_238/0.9)_42%,rgb(239_201_218/0.55)_54%,rgb(239_201_218/0)_66%)]" />
            <div aria-hidden="true" className="absolute left-1/2 bottom-[12%] w-[56%] h-[9%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(110_90_170/0.32),transparent)]" />
            <div className="relative w-full h-full">
                <ModelViewer src="/phoenix-bird/phoenix-bird.glb" name="a phoenix in flight" animate zoom={false} textures={PASTEL_TEXTURES} />
            </div>
            <span className="absolute z-10 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white rounded-full shadow-[0_12px_28px_-18px_rgb(23_21_43/0.45)] top-[4%] left-[4%] pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="w-4 h-4 text-pink">
                    <path d="M21 12a9 4 0 1 1-4-3.3" /><path d="M17 5v4h4" />
                </svg>
                Drag to rotate
            </span>
        </div>
    )
}
