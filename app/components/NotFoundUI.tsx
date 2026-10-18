import Link from 'next/link'
import { FaCube } from 'react-icons/fa6'
export default function NotFoundUI({title, subtitle,link_text,link_href}:{
    title:string,
    subtitle:string,
    link_text:string,
    link_href:string
}){
  return (
    <main className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <span aria-hidden="true" className="grid w-16 h-16 mb-2 place-items-center rounded-2xl bg-lavender text-indigo">
        <FaCube className="w-7 h-7" />
      </span>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted">{subtitle}</p>
      <Link href={link_href} className="mt-3 btn-primary">
	      {link_text}
      </Link>
  </main>
  )
}