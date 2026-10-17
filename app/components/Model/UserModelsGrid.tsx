'use client'

import { useTransition } from 'react'
import ModelCard from '@/app/components/Model/ModelCard'
import LoadingUI from '@/app/components/LoadingUI'
import PaginationControls from '@/app/components/pagiunation/PaginationControls'
import { Model } from '@/app/lib/models'

// One page of a creator's models, with the same pagination as the catalog
export default function UserModelsGrid({ models, totalPages, currentPage }: {
    models: Model[],
    totalPages: number,
    currentPage: number
}) {
    const [isPending, startTransition] = useTransition()

    return (
        <>
            {isPending ? (
                <LoadingUI>Loading models...</LoadingUI>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {models.map((model) => <ModelCard key={model.id} model={model} />)}
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-8">
                    <PaginationControls totalPages={totalPages} currentPage={currentPage} startTransition={startTransition} />
                </div>
            )}
        </>
    )
}
