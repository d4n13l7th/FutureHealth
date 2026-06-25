import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import PageContainer from '../layout/PageContainer.jsx'

/**
 * HeroSection
 * ----------------------------------------------------------------
 * Landing page hero section — headline, subtitle, primary CTA, and
 * a "current self → future self" illustration card.
 *
 * Purely presentational, no data fetching or context.
 * ----------------------------------------------------------------
 */
export default function HeroSection() {
  return (
    <section className="overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white py-16 sm:py-24">
      <PageContainer>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <span className="pill mb-4">
              <Sparkles size={14} />
              Simulasi Kesehatan Masa Depan
            </span>
            <h1 className="section-title">
              Meet Your <span className="text-emerald-500">Future Health</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg text-slate-500 lg:mx-0">
              Temukan bagaimana kebiasaan hari ini membentuk kesehatanmu di masa depan.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <Link to="/simulation" className="btn-primary">
                Mulai Simulasi Saya
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Current self -> Future self illustration */}
          <div className="relative flex items-center justify-center gap-4 sm:gap-8">
            <div className="card flex w-32 flex-col items-center gap-2 sm:w-40">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl sm:h-20 sm:w-20">
                🙂
              </div>
              <p className="text-center text-sm font-semibold text-slate-700">Diri Saat Ini</p>
            </div>

            <div className="flex flex-1 flex-col items-center gap-1">
              <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-slate-200 via-emerald-300 to-sky-400" />
              <span className="text-xs font-medium text-slate-400">Perjalanan Transformasi</span>
            </div>

            <div className="card flex w-32 flex-col items-center gap-2 border-emerald-200 bg-emerald-50 sm:w-40">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl sm:h-20 sm:w-20">
                🤩
              </div>
              <p className="text-center text-sm font-semibold text-emerald-700">Diri Masa Depan</p>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
