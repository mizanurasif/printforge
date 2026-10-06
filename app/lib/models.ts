import type { ReactNode } from "react"

export interface Model {
  id: number
  name: string
  description: string
  likes: number
  image: string
  category: string
  dateAdded: string
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
    title: string
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
    searchParams: {
        query?: string
    }
}