
import { ReactNode } from "react";
import CategoriesNav from "../components/CategoriesNav";
import { getAllCategories } from "../lib/database/categories";

export default async function ModelLayout({ children }: {children: ReactNode}) {
    const categories = await getAllCategories();
    return (
        <>
            <div className="flex flex-col gap-6 px-4 py-6 mx-auto md:flex-row md:px-6 md:py-10 max-w-7xl">
            {/* Responsive Navigation */}
            <CategoriesNav categories={categories} />
            {/* Main Content Area */}
            <main className="flex-1 min-w-0">{children}</main>
            </div>
        </>
    )
}
