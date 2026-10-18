// The PrintForge mark (a nozzle over three printed layers) and "printforge" wordmark
export default function Logo({ className = '' }: { className?: string }) {
    return (
        <span className={`flex items-center gap-2 font-display text-[26px] font-light leading-none tracking-tight text-ink ${className}`}>
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="w-[30px] h-[30px] shrink-0">
                <path d="M5 5h22M16 5v9M13 14h6l-3 4z" />
                <path d="M4 22h24M6 25.5h20M4 29h24" />
            </svg>
            <span>print<b className="font-light text-pink">forge</b></span>
        </span>
    )
}
