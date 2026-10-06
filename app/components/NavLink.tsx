import Link from "next/link"
import { NavLinkProps } from "../lib/models"
export default function NavLink({href, isActive, children}: NavLinkProps ){

    return(
        <li className="text-sm uppercase">
            <Link href={href} className={`px-4 py-2 text-gray-700 transition-colors rounded-md cursor-pointer hover:text-orange-accent ${isActive === true ? "text-orange-accent" : "text-gray-700"}`}>
                {children}
            </Link>
        </li>
    )
}