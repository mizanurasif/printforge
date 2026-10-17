import Image from 'next/image'
import Link from 'next/link'
import printforgeLogo from '@/public/printforge-logo.svg'

const columns = [
    {
        title: 'Explore',
        links: [
            { href: '/3d-models', label: 'All models' },
            { href: '/3d-models?sort=popular', label: 'Most popular' },
            { href: '/3d-models?sort=recent', label: 'Recently added' },
        ],
    },
    {
        title: 'Create',
        links: [
            { href: '/dashboard/upload', label: 'Upload a model' },
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/register', label: 'Create an account' },
        ],
    },
    {
        title: 'PrintForge',
        links: [
            { href: '/about', label: 'About' },
            // CC-BY models require their authors to be credited wherever they're shown
            { href: '/models/SOURCES.md', label: '3D model credits' },
        ],
    },
]

export default function Footer() {
    return (
        <footer className="mt-16 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 gap-10 px-6 py-12 mx-auto max-w-7xl md:grid-cols-[2fr_1fr_1fr_1fr]">
                <div className="col-span-2 space-y-4 md:col-span-1">
                    <Link href="/" aria-label="PrintForge home" className="block w-fit">
                        <Image src={printforgeLogo} alt="" className="w-[160px] h-auto" />
                    </Link>
                    <p className="max-w-xs text-sm text-gray-600">
                        Discover, share and print 3D models made by a community of makers.
                    </p>
                </div>

                {columns.map((column) => (
                    <nav key={column.title} aria-label={column.title}>
                        <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-900 uppercase">{column.title}</h2>
                        <ul className="space-y-2">
                            {column.links.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-gray-600 transition-colors hover:text-orange-accent">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                ))}
            </div>

            <div className="border-t border-gray-200">
                <p className="px-6 py-6 mx-auto text-xs text-gray-500 max-w-7xl">
                    &copy; {new Date().getFullYear()} PrintForge. Models belong to their creators.
                </p>
            </div>
        </footer>
    )
}
