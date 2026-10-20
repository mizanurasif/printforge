'use client'

import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import { TransitionStartFunction } from 'react'

export default function SortButton({children, sort,startTransition}:{
  children:React.ReactNode,
  sort:string,
  startTransition: TransitionStartFunction
}){

    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()

    // sort "" is the default order, which has no ?sort= in the address
    const isActive = (searchParams.get("sort") ?? '') === sort

    function handleSort(){
    const urlSearchParams = new URLSearchParams(searchParams.toString())
    if (sort) urlSearchParams.set('sort', sort)
    else urlSearchParams.delete('sort')
    urlSearchParams.delete('page')
    const url = `${pathname}?${urlSearchParams.toString()}`

    startTransition(()=>{ 
      router.push(url)
        })
    }

    return (
    <button
        onClick={handleSort}
        aria-pressed={isActive}
        className={`px-3.5 py-1.5 text-sm font-medium rounded-full border cursor-pointer transition-colors ${isActive ? "text-white bg-ink border-ink" : 'bg-white border-line text-muted hover:text-ink hover:border-ink'}`}
    >
        {children}
    </button>

    )
}