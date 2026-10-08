import { TransitionStartFunction } from 'react'
import PaginationButton from '../components/PaginationButton'

export default function PaginationControls({totalPages,currentPage,startTransition}: {
    totalPages: number,
    currentPage: number,
    startTransition:TransitionStartFunction
}){

    const pagearr = Array.from({length: totalPages}, (_,i) => i+1);
    return (
        <div className="flex justify-center gap-1">  
      {currentPage !== 1 && (
        <PaginationButton page={1} label="<<" startTransition={startTransition}/>
      )}
      {currentPage !== 1 && (
        <PaginationButton page={currentPage-1} startTransition={startTransition}/>
      )}
      <PaginationButton page={currentPage} isActive = {true} isDisable={true} startTransition={startTransition}/>
      {currentPage !== totalPages && (
        <PaginationButton page={currentPage+1} startTransition={startTransition}/>
      )}
      {currentPage !== totalPages && (
        <PaginationButton page={totalPages} label=">>" startTransition={startTransition}/>
      )}
    </div>
    )
}