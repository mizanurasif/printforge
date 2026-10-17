import type { ReactNode } from "react"

export interface Model {
  id: number
  name: string
  description: string
  likes: number
  image: string
  modelFile: string | null   // URL of a .glb in /public, or null for image-only models
  category: string
  dateAdded: Date
  userId: number | null
  creatorName: string | null
  likedByMe: boolean      // whether the logged-in viewer liked it (false when logged out)
}

export type ModelDetailPageProps = {
    params: Promise<{
        id: string
    }>
}

// Components Types
export type ModelCardProps = {
    model: Model
}

export type PillProps = {
    children: ReactNode
    className?: string
}

export type ModelsGridProps = {
    
    categoryName?: string
    search?: string
    models: Model[]
}

export type Category = {
    displayName: string
    slug: string
}

export type CategoriesNavProps = {
    categories: Category[]
}

export type CategoriesData = {
    categories: Category[]
}

export type CategoryPageProps = {
    params: Promise<{
        categoryName: string
    }>
}

export type NavLinkProps = {
    href: string,
    isActive?: boolean,
    children: ReactNode
}
export type ModelsPageProps = {
    searchParams: Promise<{
        search?: string,
        sort?: string,
        page?: string
    }>
}