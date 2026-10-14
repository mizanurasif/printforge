'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

// Files often hold several clips (Idle, Walk, Run...). A walk or run cycle stays in place and looks odd on a
// turntable, so prefer a calm showcase clip; otherwise play the first one.
// Zero-length clips are single poses, not animations (game files hold many), so they're skipped.
const PREFERRED_CLIPS = [/idle/i, /survey/i, /breath/i, /inspect/i]
function pickClip(clips: THREE.AnimationClip[]): THREE.AnimationClip | undefined {
    const moving = clips.filter((c) => c.duration > 0)
    for (const pattern of PREFERRED_CLIPS) {
        const clip = moving.find((c) => pattern.test(c.name))
        if (clip) return clip
    }
    return moving[0]
}

// Only load this through ModelPreview (next/dynamic, ssr: false): WebGL doesn't exist on the server.
// See docs/3D_VIEWER_GUIDE.md for what each numbered part does.
// poster: the model's picture, shown until the 3D file has loaded
// animate: play one of the file's animations, if it has any (see pickClip)
// zoom: false stops the wheel and touch from zooming, so the page still scrolls over the model
export default function ModelViewer({ src, name, poster, animate = true, zoom = true }: {
    src: string
    name: string
    poster?: string
    animate?: boolean
    zoom?: boolean
}) {
    const mountRef = useRef<HTMLDivElement>(null)
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

    useEffect(() => {
        const mount = mountRef.current
        if (!mount) return
        let disposed = false

        // 1. Renderer: draws into a <canvas> added inside our div
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        // false: size the drawing buffer only, and let CSS size the canvas, so it never props its box open
        renderer.setSize(mount.clientWidth, mount.clientHeight, false)
        renderer.domElement.className = 'block w-full h-full'
        mount.appendChild(renderer.domElement)

        // 2. Scene, camera, and studio lighting
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.01, 1000)
        const pmrem = new THREE.PMREMGenerator(renderer)
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

        // 3. Mouse and touch controls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.autoRotate = true
        controls.enableZoom = zoom
        // OrbitControls blocks all touch scrolling on the canvas; without zoom, let vertical swipes scroll the page
        if (!zoom) renderer.domElement.style.touchAction = 'pan-y'
        let mixer: THREE.AnimationMixer | null = null

        // 4. Load the file, then centre it and move the camera back until it fits
        new GLTFLoader().load(src, (gltf) => {
            if (disposed) return
            const model = gltf.scene
            const clip = animate ? pickClip(gltf.animations) : undefined
            if (clip) {
                mixer = new THREE.AnimationMixer(model)
                mixer.clipAction(clip).play()
                mixer.update(0)   // pose the model at the first frame, so the framing below fits the animation
                controls.autoRotate = false   // spinning hides subtle motion like an idle; dragging still turns it
            }
            const box = new THREE.Box3().setFromObject(model)
            model.position.sub(box.getCenter(new THREE.Vector3()))
            scene.add(model)

            const radius = box.getSize(new THREE.Vector3()).length() / 2
            const distance = radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2))
            camera.position.set(0, radius * 0.4, distance)
            camera.near = distance / 100
            camera.far = distance * 100
            camera.updateProjectionMatrix()
            setStatus('ready')
        }, undefined, () => { if (!disposed) setStatus('error') })

        // 5. Draw a frame on every screen refresh, moving any animation on by the time since the last one
        let lastTime: number | null = null
        renderer.setAnimationLoop((time) => {
            if (mixer && lastTime !== null) mixer.update((time - lastTime) / 1000)
            lastTime = time
            controls.update()
            renderer.render(scene, camera)
        })

        // 6. Keep the canvas the size of the div
        const observer = new ResizeObserver(() => {
            renderer.setSize(mount.clientWidth, mount.clientHeight, false)
            camera.aspect = mount.clientWidth / mount.clientHeight
            camera.updateProjectionMatrix()
        })
        observer.observe(mount)

        // 7. Clean up: free GPU memory and the WebGL context
        return () => {
            disposed = true
            observer.disconnect()
            renderer.setAnimationLoop(null)
            mixer?.stopAllAction()
            controls.dispose()
            scene.traverse((obj) => {
                if (!(obj instanceof THREE.Mesh)) return
                obj.geometry.dispose()
                const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
                for (const material of materials) {
                    for (const value of Object.values(material)) {
                        if (value instanceof THREE.Texture) value.dispose()
                    }
                    material.dispose()
                }
            })
            scene.environment?.dispose()
            pmrem.dispose()
            renderer.dispose()
            mount.removeChild(renderer.domElement)
        }
    }, [src, animate, zoom])

    return (
        <div ref={mountRef} className={`relative w-full h-full ${zoom ? 'touch-none' : 'touch-pan-y'}`} role="img" aria-label={`3D view of ${name}`}>
            {status === 'loading' && (
                <>
                    {poster && <Image width={500} height={500} src={poster} alt="" loading="eager"
                        className="absolute inset-0 object-cover w-full h-full" />}
                    <p className="absolute inset-x-0 bottom-3 text-sm text-center text-gray-500">Loading 3D model...</p>
                </>
            )}
            {status === 'error' && (
                <p className="absolute inset-0 flex items-center justify-center text-red-600">Couldn&apos;t load the 3D model.</p>
            )}
        </div>
    )
}
