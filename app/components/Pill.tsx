import { PillProps } from "@/app/lib/models";

export default function Pill({ children, className = "" }: PillProps) {
    return (
        <span
            className={`inline-block border border-line rounded-full px-2.5 py-0.5 text-xs text-muted ${className}`}
        >
            {children}
        </span>
    )
}

