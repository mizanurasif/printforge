import ModelsGrid from '@/app/components/ModelsGrid';
import { getCategoryBySlug } from '@/app/lib/categories';
import { getModels } from '@/app/lib/database_old';
import { CategoryPageProps, Model} from '@/app/lib/models'
export default async function categoryPage({ params }: CategoryPageProps) {
    const {categoryName} = await params;
    const models = await getModels(categoryName);
    const category = await getCategoryBySlug(categoryName)
    return(
        <>
        <ModelsGrid title={category.displayName}
        models = {models}
        />
        </>
    )
} 