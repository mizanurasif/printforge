import Link from 'next/link'
import Logo from './Logo'

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
            { href: '/dashboard', label: 'My account' },
            { href: '/register', label: 'Create an account' },
        ],
    },
    {
        title: 'PrintForge',
        links: [
            { href: '/about', label: 'About' },
            // CC-BY models require their authors to be credited wherever they're shown
            { href: '/credits', label: '3D model credits' },
        ],
    },
]

export default function Footer() {
    return (
        <footer className="border-t border-line bg-mist">
            <div className="grid grid-cols-2 gap-10 px-6 pt-12 pb-10 mx-auto max-w-7xl md:grid-cols-[1.6fr_1fr_1fr_1fr]">
                <div className="col-span-2 space-y-3 md:col-span-1">
                    <Link href="/" aria-label="PrintForge home" className="block w-fit">
                        <Logo />
                    </Link>
                    <p className="max-w-xs text-sm text-muted">
                        Discover, share and print 3D models made by a community of makers.
                    </p>
                </div>

                {columns.map((column) => (
                    <nav key={column.title} aria-label={column.title}>
                        <h2 className="mb-3.5 text-xs font-bold tracking-[0.1em] uppercase">{column.title}</h2>
                        <ul className="space-y-0.5">
                            {column.links.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="inline-block py-1.5 text-sm transition-colors text-muted hover:text-pink-ink">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                ))}
            </div>

            <div className="px-6 mx-auto max-w-7xl">
                <p className="py-5 text-xs text-center border-t border-line text-muted">
                    &copy; {new Date().getFullYear()} PrintForge. Models belong to their creators.
                </p>
            </div>
        </footer>
    )
}
