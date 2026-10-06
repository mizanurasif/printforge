import ModelsGrid from '../components/ModelsGrid';
import { getModels } from '../lib/database_old';
import { ModelsPageProps } from '../lib/models';
import Form from 'next/form'
export default async function Page({searchParams} : ModelsPageProps) {
console.log(await searchParams)
  const { query } = await searchParams
  const  models  = await getModels()
  console.log(query)
    const filtermodels = query
    ? models.filter(model => (model.name.toLowerCase().includes(query.toLowerCase()) || 
      model.description.toLowerCase().includes(query.toLowerCase()))) : models 
    console.log(filtermodels.length)

  return( 
    <>
      <Form action="/3d-models" className="w-full px-5 md:px-0 md:max-w-xl">
          <input
              type="text"
              name="query"
              placeholder="E.g. dragon"
              autoComplete="off"
              className="w-full py-3 pl-5 pr-5 text-sm placeholder-gray-500 bg-white border border-[#606060] rounded-full focus:border-[#606060] focus:outline-none focus:ring-0 md:text-base"
          />
      </Form>
      <ModelsGrid title="3D Models" models={filtermodels} />
    </>)
}
