import Image from 'next/image'
import Link from 'next/link'
import { FaCubes, FaUsers, FaGift } from 'react-icons/fa6'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'About' }

// Renders of real models from the library, cut out on transparent backgrounds
const mosaic = [
    { src: '/img/about/cottage.webp', alt: 'Medieval timber cottage' },
    { src: '/img/about/elephant.webp', alt: 'Carved wooden elephant' },
    { src: '/img/about/guardian.webp', alt: 'Stone guardian statue' },
    { src: '/img/about/cat.webp', alt: 'Concrete cat statue' },
    { src: '/img/about/bust.webp', alt: 'Marble bust' },
    { src: '/img/about/door.webp', alt: 'Medieval wooden door' },
]
// Tiles 2 and 4 sit on sky blue, tile 6 on blush; the rest on frosted white
const tileBg = [
    'bg-white/70',
    'bg-[radial-gradient(70%_60%_at_50%_40%,rgb(189_230_250/0.95),rgb(189_230_250/0)_70%),linear-gradient(180deg,#DDE3FA,#ECE4F4)]',
    'bg-white/70',
    'bg-[radial-gradient(70%_60%_at_50%_40%,rgb(189_230_250/0.95),rgb(189_230_250/0)_70%),linear-gradient(180deg,#DDE3FA,#ECE4F4)]',
    'bg-white/70',
    'bg-[radial-gradient(70%_60%_at_50%_40%,rgb(244_198_216/0.8),rgb(244_198_216/0)_70%),#F7EEF4]',
]

const facts = [
    { icon: FaCubes, title: '100K+ models', text: 'Access our vast library of community-created 3D models, from practical tools to artistic creations.' },
    { icon: FaUsers, title: 'Active community', text: 'Join thousands of makers who share tips, provide feedback, and collaborate on projects.' },
    { icon: FaGift, title: 'Free to use', text: 'Most models are free to download, with optional premium features for power users.' },
]

export default function AboutPage() {
    return (
        <main>
            <section className="relative overflow-hidden pastel-wash">
                <div aria-hidden="true" className="grid-floor" />
                <span aria-hidden="true" className="axis axis-x" />
                <span aria-hidden="true" className="axis axis-z" />

                <div className="relative grid items-center gap-10 px-6 py-12 mx-auto md:py-16 max-w-7xl md:grid-cols-2">
                    <div className="grid grid-cols-3 gap-3" aria-label="Models from the PrintForge library" role="group">
                        {mosaic.map((tile, i) => (
                            <span key={tile.src}
                                className={`grid place-items-center overflow-hidden rounded-2xl shadow-[0_16px_36px_-26px_rgb(70_60_140/0.55)] ${tileBg[i]} ${i === 0 ? 'col-span-2 row-span-2' : 'aspect-square'}`}>
                                <Image src={tile.src} alt={tile.alt} width={360} height={360}
                                    className={`object-contain w-auto h-auto max-h-[78%] drop-shadow-[0_8px_10px_rgb(70_60_140/0.25)] ${i === 0 ? 'max-w-[70%]' : 'max-w-[76%]'}`} />
                            </span>
                        ))}
                    </div>
                    <div className="space-y-4">
                        <p className="eyebrow">About PrintForge</p>
                        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                            Empowering makers <span className="text-indigo">worldwide</span>
                        </h1>
                        <p className="text-muted">
                            Founded in 2023, PrintForge has quickly become the
                            go-to platform for 3D printing enthusiasts, makers,
                            and professional designers to share and discover
                            amazing STL files for 3D printing.
                        </p>
                        <p className="text-muted">
                            Our mission is to foster a vibrant community where
                            creativity meets technology, enabling anyone to
                            bring their ideas to life through 3D printing.
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-6 py-12" aria-label="PrintForge at a glance">
                <div className="grid gap-5 mx-auto max-w-7xl md:grid-cols-3">
                    {facts.map(({ icon: Icon, title, text }) => (
                        <article key={title} className="p-6 card">
                            <span className="grid w-11 h-11 mb-4 place-items-center rounded-xl bg-lavender text-indigo">
                                <Icon aria-hidden="true" className="w-5 h-5" />
                            </span>
                            <h2 className="mb-2 text-xl font-semibold">{title}</h2>
                            <p className="text-muted">{text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="px-6 pb-16">
                <div className="flex flex-col gap-6 p-8 mx-auto max-w-7xl rounded-3xl pastel-wash md:flex-row md:items-center md:justify-between md:p-10">
                    <div className="max-w-2xl space-y-3">
                        <p className="eyebrow">Our vision</p>
                        <h2 className="text-3xl font-bold tracking-tight">Every idea, one print away</h2>
                        <p className="text-muted">
                            We want a world where anyone can find, tweak and print the object they have in mind,
                            and where the makers who design those objects get the credit and community they deserve.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0">
                        <Link href="/3d-models" className="btn-primary">Browse models</Link>
                        <Link href="/register" className="btn-ghost">Create account</Link>
                    </div>
                </div>
            </section>
        </main>
    )
}
