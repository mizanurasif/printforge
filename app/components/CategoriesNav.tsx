"use client"

import Link from "next/link";
import { usePathname } from "next/navigation"
import { CategoriesNavProps } from "../lib/models";

// A row of chips on phones, a sticky list beside the grid on wider screens
function CategoryLink({ href, isActive, children }: { href: string, isActive: boolean, children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} aria-current={isActive ? "page" : undefined}
                className={`block px-3.5 py-2 text-sm rounded-full border md:border-0 whitespace-nowrap transition-colors ${isActive
                    ? "bg-ink text-white border-ink font-semibold"
                    : "bg-white md:bg-transparent border-line text-muted hover:text-ink hover:bg-lavender/60"}`}>
                {children}
            </Link>
        </li>
    )
}

export default function CategoriesNav({ categories }: CategoriesNavProps) {
    const pathName =  usePathname();
    return(
        <>
            <aside className="w-full md:w-60 md:shrink-0">
                <div className="relative md:sticky md:top-24">
                <p className="hidden mb-3 ml-3.5 text-xs font-bold tracking-[0.1em] uppercase md:block">Categories</p>
                <nav aria-label="Categories" className="w-full overflow-x-auto md:overflow-visible scrollbar-hide">
                    <ul className="flex gap-2 pb-1 md:flex-col md:gap-0.5 md:pb-0">
                    <CategoryLink href="/3d-models" isActive={pathName === "/3d-models"}>
                        All models
                    </CategoryLink>
                    {categories.map(item => (
                        <CategoryLink
                        href={`/3d-models/categories/${item.slug}`}
                        isActive={pathName === `/3d-models/categories/${item.slug}`}
                        key={item.slug}
                        >
                        {item.displayName}
                        </CategoryLink>
                    ))}
                    </ul>
                </nav>
                {/* Fading edge/gradient for horizontal scroll hint on mobile */}
                <div className="absolute top-0 right-0 w-8 h-full pointer-events-none bg-gradient-to-l from-page to-transparent md:hidden" />
                </div>
            </aside>
        </>
    )
}
