import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import ModelsBrowser from '../components/Model/ModelsBrowser';
import { MODELS_PER_PAGE } from '../lib/constants';
import { getmodelcount, getModels } from '../lib/database/database';
import { ModelsPageProps } from '../lib/models';

export default async function Page({searchParams} : ModelsPageProps) {
  const search = (await searchParams).search?.toLowerCase() || '';
  const sort = (await searchParams).sort?.toLowerCase() || '';
  const page = Number((await searchParams).page) || 1
  const session = await getServerSession(authOptions)
  const  models  = await getModels({search, sort,page, modelsPerPage:MODELS_PER_PAGE, viewerId: Number(session?.user.id) || undefined})
  const totalPages = Math.max(Math.ceil(await getmodelcount({search}) / MODELS_PER_PAGE),1)
    if (page < 1 || page > totalPages){
      redirect('/3d-models')
  }


  return(
    <>
      <ModelsBrowser search={search}  models={models} totalPages = {totalPages} currentPage={page}/>
    </>)
}
