'use client'

import dynamic from 'next/dynamic'

// Same viewer as the model pages, loaded in the browser only (ssr: false needs a Client Component)
const ModelViewer = dynamic(() => import('./Model/ModelViewer'), { ssr: false })

// The animated phoenix on the home page. Zoom is off so scrolling over it still scrolls the page.
export default function HeroModel() {
    return (
        <div className="w-full min-w-0 max-w-[600px] aspect-square md:flex-1">
            <ModelViewer src="/models/phoenix-bird/phoenix-bird.glb" name="a phoenix in flight" animate zoom={false} />
        </div>
    )
}
