import Image from 'next/image'
import Link from 'next/link'
import { FaEye, FaHeart, FaPen } from 'react-icons/fa6'
import { Model } from '@/app/lib/models'
import DeleteModelButton from './DeleteModelButton'

function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function CategoryBadge({ slug }: { slug: string }) {
    return (
        <span className="inline-block px-2.5 py-0.5 text-xs text-ink border border-line rounded-full whitespace-nowrap">
            {slug.replace(/-/g, ' ')}
        </span>
    )
}

// Edit is a visual placeholder until that feature exists
function RowActions({ id, name }: { id: number, name: string }) {
    const base = 'flex items-center justify-center w-8 h-8 rounded-xl transition-colors'
    return (
        <div className="flex items-center gap-1">
            <Link href={`/3d-models/${id}`} aria-label={`View ${name}`} title="View"
                className={`${base} text-muted hover:bg-mist hover:text-pink-ink`}>
                <FaEye />
            </Link>
            <Link href={`/dashboard/edit/${id}`} aria-label={`Edit ${name}`} title="Edit (coming soon)"
                className={`${base} text-muted hover:bg-mist hover:text-pink-ink`}>
                <FaPen />
            </Link>
            <DeleteModelButton id={id} name={name} className={base} />
        </div>
    )
}

export default function MyModelsTable({ models }: { models: Model[] }) {
    return (
        <>
            {/* Desktop: table */}
            <div className="hidden overflow-hidden bg-white border border-line rounded-2xl shadow-sm md:block">
                {/* Scrolls vertically after ~6 rows and horizontally on narrow screens */}
                <div className="overflow-auto max-h-[28rem]">
                    <table className="w-full min-w-[720px] text-sm text-left">
                        {/* Sticky header; an inset shadow stands in for the bottom border, which sticky cells lose */}
                        <thead className="sticky top-0 z-10 text-xs tracking-wide text-muted uppercase bg-mist shadow-[inset_0_-1px_0_rgb(23_21_43/0.1)]">
                            <tr>
                                <th scope="col" className="px-4 py-3 font-medium">Model</th>
                                <th scope="col" className="px-4 py-3 font-medium">Category</th>
                                <th scope="col" className="px-4 py-3 font-medium text-right">Likes</th>
                                <th scope="col" className="px-4 py-3 font-medium">Uploaded</th>
                                <th scope="col" className="px-4 py-3 font-medium"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {models.map((model) => (
                                <tr key={model.id} className="transition-colors hover:bg-mist">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Image src={model.image} alt={model.name} width={56} height={56}
                                                className="object-cover rounded-xl w-14 h-14 shrink-0 bg-mist" />
                                            <div className="min-w-0">
                                                <Link href={`/3d-models/${model.id}`}
                                                    className="block font-semibold text-ink truncate hover:text-pink-ink">
                                                    {model.name}
                                                </Link>
                                                <p className="text-muted truncate max-w-xs">{model.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3"><CategoryBadge slug={model.category} /></td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                                            <FaHeart className="text-indigo" aria-hidden="true" />
                                            {model.likes.toLocaleString('en-US')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                                        <time dateTime={model.dateAdded.toISOString()}>{formatDate(model.dateAdded)}</time>
                                    </td>
                                    <td className="px-4 py-3"><RowActions id={model.id} name={model.name} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile: compact rows */}
            <ul className="bg-white border border-line divide-y divide-line rounded-2xl shadow-sm md:hidden">
                {models.map((model) => (
                    <li key={model.id} className="flex items-center gap-3 p-3">
                        <Image src={model.image} alt={model.name} width={56} height={56}
                            className="object-cover rounded-xl w-14 h-14 shrink-0 bg-mist" />
                        {/* The Link itself is the flex child, so flex-1 makes the whole middle area clickable */}
                        <Link href={`/3d-models/${model.id}`} aria-label={`View ${model.name}`} className="flex-1 min-w-0">
                            <p className="font-semibold text-ink truncate">{model.name}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted">
                                <span className="inline-flex items-center gap-1">
                                    <FaHeart className="text-indigo" aria-hidden="true" />
                                    {model.likes.toLocaleString('en-US')}
                                </span>
                                <time dateTime={model.dateAdded.toISOString()}>{formatDate(model.dateAdded)}</time>
                                <CategoryBadge slug={model.category} />
                            </div>
                        </Link>
                        <RowActions id={model.id} name={model.name} />
                    </li>
                ))}
            </ul>
        </>
    )
}
