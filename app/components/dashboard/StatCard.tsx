import { ReactNode } from 'react'

export default function StatCard({ label, value, hint, icon }: {
    label: string
    value: ReactNode
    hint?: string
    icon: ReactNode
}) {
    return (
        <div className="flex items-start gap-4 p-5 card">
            <div className="flex items-center justify-center w-11 h-11 text-xl rounded-2xl shrink-0 bg-lavender text-indigo">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-sm text-muted">{label}</p>
                <p className="text-2xl font-bold text-ink truncate">{value}</p>
                {hint && <p className="mt-1 text-xs text-muted truncate">{hint}</p>}
            </div>
        </div>
    )
}
