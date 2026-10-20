import fs from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: '3D model credits',
    description: 'Where every 3D model in PrintForge comes from, its licence, and who made it.',
}

type Credit = { category: string, file: string, source: string, sourceUrl: string | null, license: string, credit: string }

// The credits live in public/models/SOURCES.md (a markdown table). Read it at build time and show it as a page,
// instead of linking to the raw .md file
async function readCredits(): Promise<Credit[]> {
    const md = await fs.readFile(path.join(process.cwd(), 'public/models/SOURCES.md'), 'utf8')
    return md.split('\n')
        .filter((line) => line.startsWith('|') && !line.startsWith('|---') && !line.startsWith('| Category'))
        .map((line) => {
            const [category, file, source, license, credit] = line.split('|').slice(1, -1).map((c) => c.trim())
            const link = /^\[(.+)\]\((.+)\)$/.exec(source)
            return { category, file: file.replace(/`/g, ''), source: link ? link[1] : source, sourceUrl: link ? link[2] : null, license, credit }
        })
}

export default async function CreditsPage() {
    const credits = await readCredits()
    return (
        <main className="max-w-6xl px-4 py-10 mx-auto md:px-6">
            <p className="mb-2 eyebrow">Licences</p>
            <h1 className="mb-3 text-3xl font-bold tracking-tight">3D model credits</h1>
            <p className="max-w-[65ch] mb-8 text-muted">
                Every catalog model is a real binary glTF file. <strong className="text-ink">CC0</strong> models are public domain;
                {' '}<strong className="text-ink">CC-BY</strong> models are free to use as long as their authors are credited, as they are here.
            </p>
            <div className="overflow-x-auto card">
                <table className="w-full min-w-[720px] text-sm text-left">
                    <thead className="text-xs tracking-wide uppercase bg-mist text-muted">
                        <tr>
                            <th scope="col" className="px-4 py-3 font-semibold">Model file</th>
                            <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                            <th scope="col" className="px-4 py-3 font-semibold">Source</th>
                            <th scope="col" className="px-4 py-3 font-semibold">Licence</th>
                            <th scope="col" className="px-4 py-3 font-semibold">Credit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {credits.map((c) => (
                            <tr key={c.file}>
                                <td className="px-4 py-3 font-medium break-all text-ink">{c.file.split('/').pop()}</td>
                                <td className="px-4 py-3">
                                    <Link href={`/3d-models/categories/${c.category}`} className="text-indigo hover:underline">{c.category}</Link>
                                </td>
                                <td className="px-4 py-3">
                                    {c.sourceUrl ? <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="text-indigo hover:underline">{c.source}</a> : c.source}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">{c.license}</td>
                                <td className="px-4 py-3 text-muted">{c.credit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    )
}
