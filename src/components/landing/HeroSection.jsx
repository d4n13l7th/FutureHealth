import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import PageContainer from '../layout/PageContainer.jsx'

/**
 * HeroSection
 * ----------------------------------------------------------------
 * Landing page hero — headline, subtitle, primary CTA, and a
 * floating "current self → future self" illustration connected by
 * an animated dashed timeline.
 *
 * Purely presentational, no data fetching or context.
 * ----------------------------------------------------------------
 */
export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* Animated wellness mesh backdrop */}
      <div className="mesh-bg animate-mesh absolute inset-0 -z-10" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-white to-transparent" aria-hidden="true" />

      <PageContainer>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <span className="pill mb-4">
              <Sparkles size={14} />
              Simulasi Kesehatan Masa Depan
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Meet Your <span className="text-gradient">Future Health</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg text-slate-500 lg:mx-0">
              Temukan bagaimana kebiasaan kecil hari ini membentuk dirimu
              puluhan tahun ke depan — dan mulailah hari ini.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <Link to="/simulation" className="btn-primary">
                Mulai Simulasi Saya
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Current self -> Future self */}
          <div className="relative flex items-center justify-center gap-4 py-6 sm:gap-8">
            {/* Animated dashed timeline */}
            <svg
              className="absolute left-0 top-1/2 w-full -translate-y-1/2"
              height="8"
              preserveAspectRatio="none"
              viewBox="0 0 400 8"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="hero-timeline" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#CBD5E1" />
                  <stop offset="1" stopColor="#0EA5E9" />
                </linearGradient>
              </defs>
              <line
                x1="24"
                x2="376"
                y1="4"
                y2="4"
                stroke="url(#hero-timeline)"
                strokeWidth="2"
                strokeDasharray="6 8"
                strokeLinecap="round"
                className="animate-draw-line"
              />
            </svg>

            {/* Milestone marker */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="relative flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
              </span>
              <span className="mt-2 block text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Perjalanan
              </span>
            </div>

            {/* Current self */}
            <div
              className="card animate-float flex w-32 flex-col items-center gap-3 p-5 sm:w-40"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl sm:h-20 sm:w-20">
                🙂
              </span>
              <p className="text-center text-sm font-semibold text-slate-700">Diri Saat Ini</p>
            </div>

            {/* Future self */}
            <div
              className="card animate-float flex w-32 flex-col items-center gap-3 border-emerald-200 bg-gradient-to-br from-emerald-50 to-sky-50 p-5 shadow-glow sm:w-40"
              style={{ animationDelay: '1.4s' }}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl sm:h-20 sm:w-20">
                🤩
              </span>
              <p className="text-center text-sm font-semibold text-emerald-700">Diri Masa Depan</p>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}