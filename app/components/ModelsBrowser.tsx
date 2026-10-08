'use client'

import SearchForm from '../components/SearchForm'
import ModelsGrid from '../components/ModelsGrid'
import PaginationControls from "./PaginationControls"
import {useTransition} from 'react'
import { Model } from '../lib/models'

export default function ModelsBrowser({search, models, categoryName, totalPages,currentPage}:{
  search?:string,
  models:Model[],
  categoryName?:string,
  totalPages: number,
  currentPage: number
}){

  const [isPending, startTransition] = useTransition()

  return (
    <div>
        <SearchForm 
            startTransition={startTransition}
            search={search}
        />
        <ModelsGrid 
            isPending={isPending} 
            search={search} 
            models={models}
            categoryName={categoryName}
            startTransition={startTransition}
        />

        {totalPages > 1 ? 
            <PaginationControls totalPages = {totalPages} currentPage = {currentPage} startTransition = {startTransition}/> : null}
    </div>
    
  )
}