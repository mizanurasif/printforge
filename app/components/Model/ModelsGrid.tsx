import ModelCard from "@/app/components/Model/ModelCard"
import { Model } from "@/app/lib/models"
import SortControls from "../SortControls"
import type {TransitionStartFunction} from 'react'
import LoadingUI from "../LoadingUI"
import NotFoundUI from "../NotFoundUI"



export default function ModelsGrid({ models, categoryName, search, isPending, startTransition }: {
    models: Model[],
    categoryName?: string,
    search?: string,
    isPending:boolean,
    startTransition:TransitionStartFunction}) {

    let title = "3D Models"
    if(categoryName) title = categoryName
    if(search) title = `Search For: ${search}`
    if (categoryName && search) title = `Search results for "${search}" in ${categoryName}`
    return (
        <>
            <div className="pt-8">
                <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="mb-2 eyebrow">Library</p>
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    </div>
                    <SortControls startTransition={startTransition}/>
                </div>
                
                {isPending ? (
                    <LoadingUI>Loading models...</LoadingUI>
                ) : models.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    
                    {models.map((model)=>(
                    <ModelCard
                        key={model.id} 
                        model={model}
                    />
                    ))}

                </div>
                ) : (
                    <NotFoundUI
                    title="No models found"
                    subtitle="Try searching for something else"
                    link_text="See all models"
                    link_href="/3d-models"
                    />
                )}
            </div>
        </>
    )
}