import { ReactNode } from 'react'
export default function LoadingUI({children}: { children:ReactNode}) {  
  return (
    <>
    <main role="status" className="flex flex-col items-center gap-4 py-16">  
      {/* A pastel ring spinner, drawn in CSS so it matches the theme */}
      <span aria-hidden="true" className="w-12 h-12 border-4 rounded-full border-lavender border-t-pink animate-spin motion-reduce:animate-none" />
      <p className="font-semibold text-muted">{children}</p>  
    </main>
    </>
  )  
}