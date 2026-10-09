import { Link } from 'react-router-dom'
import { HeartPulse, ArrowRight } from 'lucide-react'
import PageContainer from '../layout/PageContainer.jsx'

/**
 * CTASection
 * ----------------------------------------------------------------
 * Landing page final call-to-action section with gradient card.
 * Purely presentational.
 * ----------------------------------------------------------------
 */
export default function CTASection() {
  return (
    <section className="py-16 sm:py-24">
      <PageContainer>
        <div className="card flex flex-col items-center gap-6 overflow-hidden rounded-3xl bg-emerald-700 px-6 py-12 text-center text-white shadow-glow-lg sm:px-12">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm">
            <HeartPulse size={28} />
          </span>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Siap melihat dirimu di masa depan?
          </h2>
          <p className="max-w-md text-emerald-50">
            "Saya bisa melihat seperti apa diri saya di masa depan jika mulai mengubah
            kebiasaan saya hari ini."
          </p>
          <Link
            to="/simulation"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-emerald-600 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Mulai Simulasi Saya
            <ArrowRight size={18} />
          </Link>
        </div>
      </PageContainer>
    </section>
  )
}
