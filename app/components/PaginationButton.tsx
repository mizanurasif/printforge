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
    <button disabled = {isDisable} onClick= {handlePage} className={`px-3 py-1.5 text-sm rounded-md border cursor-pointer ${isActive ? "text-white bg-orange-400 border-orange-400" : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>  
      { label  || page}  
    </button>
  )
}