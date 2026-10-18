
import Link from 'next/link';
import { FaArrowRight, FaArrowUpFromBracket } from 'react-icons/fa6';
import HeroModel from './components/HeroModel';
export default function Home() {
  return (
  <>
  <main>
      {/* The hero is styled like a 3D viewport: pastel wash, perspective grid floor and X/Z axis lines */}
      <section className="relative overflow-hidden pastel-wash">
        <div aria-hidden="true" className="grid-floor" />
        <span aria-hidden="true" className="axis axis-x" />
        <span aria-hidden="true" className="axis axis-z" />

        <div className="relative flex flex-col-reverse items-center justify-between gap-8 px-6 py-12 mx-auto md:flex-row md:py-20 max-w-7xl">
          <div className="flex-1 w-full min-w-0 space-y-6">
            <p className="hidden eyebrow md:flex">
              Your go-to platform for 3D printing files
            </p>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight md:text-[56px]">
              Discover what&apos;s possible with <span className="text-indigo">3D printing</span>
            </h1>
            <p className="max-w-[46ch] text-lg text-muted">
              Join our community of creators and explore a vast
              library of user-submitted models. Spin them in 3D, save your favorites and follow the makers behind them.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/3d-models" className="btn-primary min-h-12 px-6">
                Browse models <FaArrowRight aria-hidden="true" />
              </Link>
              <Link href="/dashboard/upload" className="btn-ghost min-h-12 px-6">
                <FaArrowUpFromBracket aria-hidden="true" /> Upload a model
              </Link>
            </div>
            <p className="flex items-center gap-2 text-sm text-muted">
              Accepts
              <span className="px-2 py-1 text-[11.5px] font-semibold tracking-wide border rounded-md bg-white/75 border-line text-ink">.GLB</span>
            </p>
          </div>
          <HeroModel />
        </div>
      </section>
    </main>
  </>
  
);
}
