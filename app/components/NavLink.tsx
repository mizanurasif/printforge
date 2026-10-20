'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NavLinkProps } from "../lib/models"
export default function NavLink({href, isActive, children}: NavLinkProps ){
    const pathname = usePathname()
    // Screen readers hear "current page" only on the exact page; on a page inside the section (a model, an edit page)
    // the link is marked as the current item of the menu instead
    const current = pathname === href ? "page" : isActive ? "true" : undefined

    return(
        <li className="text-[12.5px] font-medium tracking-[0.06em] uppercase">
            <Link href={href} aria-current={current}
                className={`inline-block py-1.5 border-b-2 transition-colors ${isActive ? "text-ink border-pink" : "text-muted border-transparent hover:text-ink"}`}>
                {children}
            </Link>
        </li>
    )
}
