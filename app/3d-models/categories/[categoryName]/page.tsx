import ModelsBrowser from '@/app/components/Model/ModelsBrowser';
import { getCategoryBySlug } from '@/app/lib/database/categories';
import { MODELS_PER_PAGE } from '@/app/lib/constants';
import { getmodelcount, getModels } from '@/app/lib/database/database';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ categoryName: string }> }): Promise<Metadata> {
    const category = await getCategoryBySlug((await params).categoryName)
    return { title: category ? category.displayName : 'Category not found' }
}
export default async function categoryPage({ params, searchParams}:
                                        { params: Promise<{ categoryName: string }>,
                                          searchParams: Promise<{ search?: string, sort?: string, page?:string}>}) {

    const categorySlug= (await params).categoryName;
    const sort = (await searchParams).sort?.toLowerCase() || '';
    const search = (await searchParams).search?.toLowerCase() || '';
    const page = Number((await searchParams).page) || 1
    const category = await getCategoryBySlug(categorySlug)
    if (!category){
        notFound()
    }

    const totalPages = Math.max(Math.ceil(await getmodelcount({categorySlug,search}) / MODELS_PER_PAGE), 1)
    if (!Number.isInteger(page) || page < 1 || page > totalPages) redirect(`/3d-models/categories/${categorySlug}`)
    const session = await getServerSession(authOptions)
    const models = await getModels({categorySlug,search,sort,page,modelsPerPage:MODELS_PER_PAGE, viewerId: Number(session?.user.id) || undefined});

    return(
        <>
        <ModelsBrowser categoryName={category.displayName}
        models = {models}
        search={search}
        totalPages={totalPages}
        currentPage={page}
        />
        </>
    )
} 