import Link from "next/link"
import { NavLinkProps } from "../lib/models"
export default function NavLink({href, isActive, children}: NavLinkProps ){

    return(
        <li className="text-[12.5px] font-medium tracking-[0.06em] uppercase">
            <Link href={href} aria-current={isActive ? "page" : undefined}
                className={`inline-block py-1.5 border-b-2 transition-colors ${isActive ? "text-ink border-pink" : "text-muted border-transparent hover:text-ink"}`}>
                {children}
            </Link>
        </li>
    )
}
