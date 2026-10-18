import Form from 'next/form'
import { usePathname, useRouter } from 'next/navigation'
import type { TransitionStartFunction } from 'react'
import { FaMagnifyingGlass } from 'react-icons/fa6'

export default function SearchForm({search,startTransition}:{
  search?:string,
  startTransition:TransitionStartFunction
}){
  const pathname = usePathname()
  const router = useRouter()

  function handleSearch(formData:FormData){
    const search = formData.get("search")?.toString().trim() || ""
    const url = search ? `${pathname}?search=${encodeURIComponent(search)}` : pathname 
    startTransition(()=>{
      router.push(url)
    })
    
  }
  return (
    <Form 
      action={handleSearch}
      role="search"
      className="relative w-full md:max-w-xl">
      <FaMagnifyingGlass aria-hidden="true" className="absolute w-4 h-4 -translate-y-1/2 pointer-events-none left-5 top-1/2 text-muted" />
      <input
        type="search"
        defaultValue={search}
        id="search"
        name="search"
        aria-label="Search models"
        placeholder="Search models, e.g. dragon"
        autoComplete="off"
        className="w-full py-3 pr-5 text-sm bg-white border rounded-full pl-12 placeholder:text-muted/70 border-line shadow-[0_10px_24px_-20px_rgb(23_21_43/0.5)] focus:outline-2 focus:outline-indigo md:text-base"
      />
    </Form>
  )
}