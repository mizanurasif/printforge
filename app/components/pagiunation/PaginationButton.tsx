'use client'
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { TransitionStartFunction } from "react"


export default function PaginationButton({page,label,startTransition,isActive,isDisable=false}:{
    page:number,
    label?:string,
    isActive?:boolean,
    isDisable?:boolean
    startTransition: TransitionStartFunction
}){
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()


    function handlePage(){
    const urlSearchParams = new URLSearchParams(searchParams.toString())
    urlSearchParams.set('page',page.toString())
    const url = `${pathname}?${urlSearchParams.toString()}`
    console.log(pathname)
    console.log(url)
    startTransition(()=>{ 
        router.push(url)
        })
    }
  return (
    <button disabled = {isDisable} onClick= {handlePage} aria-current={isActive ? 'page' : undefined}
      className={`min-w-10 h-10 px-3 text-sm font-medium rounded-full border cursor-pointer transition-colors disabled:cursor-default ${isActive ? "text-white bg-ink border-ink" : 'bg-white border-line text-muted hover:text-ink hover:border-ink'}`}>  
      { label  || page}  
    </button>
  )
}