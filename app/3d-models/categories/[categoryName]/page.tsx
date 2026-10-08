import ModelsBrowser from '@/app/components/ModelsBrowser';
import ModelsGrid from '@/app/components/ModelsGrid';
import { getCategoryBySlug, getModelsByCategorySlug } from '@/app/lib/categories';
import { MODELS_PER_PAGE } from '@/app/lib/constants';
import { getmodelcount, getModels } from '@/app/lib/database';
import { CategoryPageProps, Model} from '@/app/lib/models'
import { notFound } from 'next/navigation';
export default async function categoryPage({ params, searchParams}:
                                        { params: Promise<{ categoryName: string }>,
                                          searchParams: Promise<{ search?: string, sort?: string, page?:string}>}) {

    const categorySlug= (await params).categoryName;
    const sort = (await searchParams).sort?.toLowerCase() || '';
    const search = (await searchParams).search?.toLowerCase() || '';
    const page = Number((await searchParams).page) || 1
    const category = await getCategoryBySlug(categorySlug)
    console.log(category)
    if (!category){
        notFound()
    }

    const modelCount = Math.ceil(await getmodelcount({categorySlug,search}) / MODELS_PER_PAGE)
    console.log(modelCount)
    const models = await getModels({categorySlug,search,sort,page,modelsPerPage:MODELS_PER_PAGE});

    return(
        <>
        <ModelsBrowser categoryName={category.displayName}
        models = {models}
        search={search}
        totalPages={modelCount}
        currentPage={page}
        />
        </>
    )
} 