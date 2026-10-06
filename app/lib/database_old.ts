
import modelsdata from '../data/data.json';
import { Model } from './models';


export async function getModels(category?: string): Promise<Model[]> {
    let models : Model[] = [...modelsdata];
      if(category){
      models = models.filter((model) => 
        model.category === category
      )
  }
    return models;
}

export async function getModelById(id: string | number): Promise<Model> {
  // These functions don't technically need to be async functions,
  // but we're planning for the future when they'll be fetching
  // from a real data source.
  const foundModel = modelsdata.find(
    (model: Model) => model.id.toString() === id.toString()
  )
  if (!foundModel) {
    throw new Error(`Model with id ${id} not found`)
  }
  return foundModel
}