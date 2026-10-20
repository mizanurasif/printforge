import { TransitionStartFunction } from 'react'
import PaginationButton from './PaginationButton'

export default function PaginationControls({totalPages,currentPage,startTransition}: {
    totalPages: number,
    currentPage: number,
    startTransition:TransitionStartFunction
}){

    return (
        <nav aria-label="Pages" className="flex justify-center gap-1.5 mt-10">  
      {currentPage !== 1 && (
        <PaginationButton page={1} label="«" ariaLabel="First page" startTransition={startTransition}/>
      )}
      {currentPage !== 1 && (
        <PaginationButton page={currentPage-1} ariaLabel={`Previous page, page ${currentPage-1}`} startTransition={startTransition}/>
      )}
      <PaginationButton page={currentPage} isActive = {true} isDisable={true} startTransition={startTransition}/>
      {currentPage !== totalPages && (
        <PaginationButton page={currentPage+1} ariaLabel={`Next page, page ${currentPage+1}`} startTransition={startTransition}/>
      )}
      {currentPage !== totalPages && (
        <PaginationButton page={totalPages} label="»" ariaLabel={`Last page, page ${totalPages}`} startTransition={startTransition}/>
      )}
    </nav>
    )
}