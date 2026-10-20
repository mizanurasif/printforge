'use client'

import { useEffect, useRef, useState } from 'react'
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

// Copies the WebGL canvas into a square PNG on the model background (bg-model-bg in globals.css) (the canvas itself is transparent).
// Must run right after a render: once the browser has shown the frame, the WebGL buffer is cleared.
function takeSnapshot(canvas: HTMLCanvasElement, onSnapshot: (image: Blob) => void) {
    const size = Math.min(canvas.width, canvas.height)
    const square = document.createElement('canvas')
    square.width = square.height = size
    const ctx = square.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#bae6fd'
    ctx.fillRect(0, 0, size, size)
    ctx.drawImage(canvas, (canvas.width - size) / 2, (canvas.height - size) / 2, size, size, 0, 0, size, size)
    square.toBlob((blob) => { if (blob) onSnapshot(blob) }, 'image/png')
}

// Replaces the colour map of every material whose name contains a key of `textures`.
// glTF textures aren't flipped (flipY = false), so replacement images must be stored the same way up as the file's own.
// The file's glow (emissive) map is kept but tinted soft pink, so its original colours don't show through the new ones.
// Each replacement is swapped in only once it has loaded; if one fails, those materials keep their original map.
async function retexture(model: THREE.Object3D, textures: Record<string, string>) {
    const entries = Object.entries(textures)
    if (!entries.length) return
    const loader = new THREE.TextureLoader()
    const loaded = new Map<string, THREE.Texture>()
    await Promise.all(entries.map(async ([, url]) => {
        try {
            const texture = await loader.loadAsync(url)
            texture.flipY = false
            texture.colorSpace = THREE.SRGBColorSpace
            loaded.set(url, texture)
        } catch (err: unknown) {
            console.error(`Couldn't load texture ${url}; keeping the original`, err)
        }
    }))
    model.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
        for (const material of materials) {
            const match = entries.find(([key]) => material.name.includes(key))
            const texture = match && loaded.get(match[1])
            if (!texture || !(material instanceof THREE.MeshStandardMaterial)) continue
            material.map?.dispose()
            material.map = texture
            material.emissive.set(0xffc2d8)
            material.emissiveIntensity = 0.35
            material.needsUpdate = true
        }
    })
}

// Only load this through ModelPreview (next/dynamic, ssr: false): WebGL doesn't exist on the server.
// See docs/3D_VIEWER_GUIDE.md for what each numbered part does.
// animate: play one of the file's animations, if it has any (see pickClip)
// zoom: false stops the wheel and touch from zooming, so the page still scrolls over the model
// onSnapshot: called once with a PNG of the first frame, e.g. to use as an uploaded model's picture
// textures: swaps a material's colour map, keyed by part of the material name, e.g. { '01a': '/img/a.png' }
export default function ModelViewer({ src, name, animate = true, zoom = true, onSnapshot, textures }: {
    src: string
    name: string
    animate?: boolean
    zoom?: boolean
    onSnapshot?: (image: Blob) => void
    textures?: Record<string, string>
}) {
    const mountRef = useRef<HTMLDivElement>(null)
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
    // A ref, so a new callback from the parent doesn't restart the effect (and reload the model)
    const onSnapshotRef = useRef(onSnapshot)
    useEffect(() => { onSnapshotRef.current = onSnapshot })
    // Compared as a string, so a new object with the same entries doesn't reload the model
    const texturesKey = JSON.stringify(textures ?? {})

    useEffect(() => {
        const mount = mountRef.current
        if (!mount) return
        let disposed = false

        // 1. Renderer:  creates a WebGL renderer, which adds a <canvas> inside the div. The GPU draws the 3D model onto that canvas.
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        // false: size the drawing buffer only, and let CSS size the canvas, so it never props its box open
        renderer.setSize(mount.clientWidth, mount.clientHeight, false)
        renderer.domElement.className = 'block w-full h-full'
        mount.appendChild(renderer.domElement)

        // 2. Scene, camera, and studio lighting
        const scene = new THREE.Scene() //The scene holds everything.
        const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.01, 1000) //The camera is your point of view, with a 45° field of view.
        const pmrem = new THREE.PMREMGenerator(renderer)
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture //RoomEnvironment provides soft studio lighting, so metal and glass reflect realistically

        // 3. Mouse and touch controls
        const controls = new OrbitControls(camera, renderer.domElement) //OrbitControls lets you drag to rotate and scroll to zoom. autoRotate spins the model slowly on its own.
        controls.enableDamping = true
        controls.autoRotate = true
        controls.enableZoom = zoom
        // OrbitControls blocks all touch scrolling on the canvas; without zoom, let vertical swipes scroll the page
        if (!zoom) renderer.domElement.style.touchAction = 'pan-y'
        let mixer: THREE.AnimationMixer | null = null
        let snapshotPending = false

        // 4. Load the file, then centre it and move the camera back until it fits
        new GLTFLoader().load(src, async (gltf) => {
            if (disposed) return
            const model = gltf.scene
            await retexture(model, JSON.parse(texturesKey))
            if (disposed) return
            // If it has an animation, pickClip chooses one and an AnimationMixer plays it
            const clip = animate ? pickClip(gltf.animations) : undefined
            if (clip) {
                mixer = new THREE.AnimationMixer(model)
                mixer.clipAction(clip).play()
                mixer.update(0)   // pose the model at the first frame, so the framing below fits the animation
                controls.autoRotate = false   // spinning hides subtle motion like an idle; dragging still turns it
            }
            //The code measures the model with a bounding box and moves it to the centre
            const box = new THREE.Box3().setFromObject(model)
            model.position.sub(box.getCenter(new THREE.Vector3()))
            scene.add(model)
            //It moves the camera back just far enough for the whole model to fit
            const radius = box.getSize(new THREE.Vector3()).length() / 2
            const distance = radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2))
            camera.position.set(0, radius * 0.4, distance)
            camera.near = distance / 100
            camera.far = distance * 100
            camera.updateProjectionMatrix()
            snapshotPending = true
            setStatus('ready')
        }, undefined, () => { if (!disposed) setStatus('error') })

        // 5. Draw a frame on every screen refresh, moving any animation on by the time since the last one
        let lastTime: number | null = null
        renderer.setAnimationLoop((time) => {
            if (mixer && lastTime !== null) mixer.update((time - lastTime) / 1000)
            lastTime = time
            controls.update()
            renderer.render(scene, camera)
            if (snapshotPending) {
                snapshotPending = false
                if (onSnapshotRef.current) takeSnapshot(renderer.domElement, onSnapshotRef.current)
            }
        })

        // 6. Keep the canvas the size of the div
        
        const observer = new ResizeObserver(() => {
            renderer.setSize(mount.clientWidth, mount.clientHeight, false)
            camera.aspect = mount.clientWidth / mount.clientHeight
            camera.updateProjectionMatrix()
        })
        observer.observe(mount)

        // 7. Clean up: free GPU memory and the WebGL context
        //runs when you leave the page. It frees the GPU memory used by geometry, materials and textures, and 
        // closes the WebGL context. Without this, every model page you visit would leak GPU memory
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
    }, [src, animate, zoom, texturesKey])

    return (
        <div ref={mountRef} className={`relative w-full h-full ${zoom ? 'touch-none' : 'touch-pan-y'}`} role="img" aria-label={`3D view of ${name}`}>
            {status === 'loading' && (
                // No picture while loading: the saved pictures have their own background, which wouldn't match the viewer's
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted">
                    <span aria-hidden="true" className="w-10 h-10 border-4 rounded-full border-lavender border-t-pink animate-spin motion-reduce:animate-none" />
                    Loading 3D model...
                </div>
            )}
            {status === 'error' && (
                <p className="absolute inset-0 flex items-center justify-center text-red-600">Couldn&apos;t load the 3D model.</p>
            )}
        </div>
    )
}
