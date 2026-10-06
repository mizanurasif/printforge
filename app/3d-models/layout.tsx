
import { ReactNode } from "react";
import CategoriesNav from "../components/CategoriesNav";
import { getAllCategories } from "../lib/categories";

export default async function ModelLayout({ children }: {children: ReactNode}) {
    const categories = await getAllCategories();
    return (
        <>
            <div className="relative flex flex-col min-h-screen md:flex-row">
            {/* Responsive Navigation */}
            <CategoriesNav categories={categories} />
            {/* Main Content Area */}
            <main className="flex-1 p-4 md:ml-64">{children}</main>
            </div>
        </>
    )
}
