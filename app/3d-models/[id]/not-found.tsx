import NotFoundUI from '@/app/components/NotFoundUI'

export default function ModelNotFound() {
    return (
        <NotFoundUI
            title="Model not found"
            subtitle="It may have been deleted by its creator."
            link_href="/3d-models"
            link_text="Browse all models"
        />
    )
}
