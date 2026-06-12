import { Link } from 'react-router-dom'
import { ArrowRight, Moon, Droplets, Dumbbell, Smartphone, Brain, Salad, Sparkles } from 'lucide-react'

// ----------------------------------------------------------------
// TEMPORARY MOCK COMPONENTS
// ----------------------------------------------------------------
// Minimal but content-accurate implementations so LandingPage
// compiles and renders meaningfully before extraction into their
// architecture-approved locations:
//
//   import PageContainer from '../components/layout/PageContainer.jsx'
//   import HeroSection from '../components/landing/HeroSection.jsx'
//   import ProblemSection from '../components/landing/ProblemSection.jsx'
//   import HowItWorksSection from '../components/landing/HowItWorksSection.jsx'
//   import CTASection from '../components/landing/CTASection.jsx'
//
// TODO: Remove these mocks once the real components are generated.
// ----------------------------------------------------------------

/** TODO: replace with components/layout/PageContainer.jsx */
function PageContainer({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}

/** TODO: replace with components/landing/HeroSection.jsx */
function HeroSection() {
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

/** TODO: replace with components/landing/ProblemSection.jsx */
function ProblemSection() {
  return (
    <section className="py-16 sm:py-24">
      <PageContainer className="max-w-3xl text-center">
        <h2 className="section-title">Tahu Pentingnya Sehat, Tapi Sulit Membayangkan Dampaknya?</h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-500">
          Banyak orang mengetahui pentingnya hidup sehat, namun sulit memahami bagaimana
          keputusan kecil setiap hari dapat memengaruhi kesehatan mereka dalam jangka panjang.
        </p>
        <p className="mt-3 text-lg leading-relaxed text-slate-500">
          <span className="font-semibold text-emerald-600">FutureHealth</span> hadir untuk
          menjembatani kesenjangan tersebut melalui simulasi kesehatan masa depan.
        </p>
      </PageContainer>
    </section>
  )
}

/** TODO: replace with components/landing/HowItWorksSection.jsx */
function HowItWorksSection() {
  const steps = [
    { icon: Droplets, title: 'Masukkan Kondisi Saat Ini', desc: 'Masukkan kondisi dan gaya hidup saat ini.' },
    { icon: Dumbbell, title: 'Pilih Target Kesehatan', desc: 'Pilih target kesehatan yang ingin dicapai.' },
    { icon: Brain, title: 'Jalankan Simulasi', desc: 'Jalankan simulasi masa depan kesehatanmu.' },
    { icon: Smartphone, title: 'Lihat Hasil Proyeksi', desc: 'Lihat hasil proyeksi kesehatan secara visual.' },
    { icon: Salad, title: 'Ubah & Bandingkan', desc: 'Ubah kebiasaan dan bandingkan hasilnya.' },
  ]

  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <PageContainer>
        <div className="text-center">
          <h2 className="section-title">Cara Kerja FutureHealth</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Lima langkah sederhana untuk melihat cerminan dirimu di masa depan.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="card flex flex-col items-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <Icon size={20} className="text-emerald-500" />
                </div>
                <h3 className="font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            )
          })}
        </div>
      </PageContainer>
    </section>
  )
}

/** TODO: replace with components/landing/CTASection.jsx */
function CTASection() {
  return (
    <section className="py-16 sm:py-24">
      <PageContainer>
        <div className="card flex flex-col items-center gap-6 bg-gradient-to-br from-emerald-500 to-sky-500 px-6 py-12 text-center text-white sm:px-12">
          <Moon size={32} />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
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

// ----------------------------------------------------------------
// LandingPage
// ----------------------------------------------------------------

/**
 * LandingPage
 * ----------------------------------------------------------------
 * Public marketing page rendered at "/". Orchestrates the landing
 * narrative by composing, in order:
 *
 *   1. HeroSection      — headline, subtitle, primary CTA, illustration
 *   2. ProblemSection   — the gap FutureHealth addresses
 *   3. HowItWorksSection — 5-step simulation process
 *   4. CTASection       — final call-to-action
 *
 * This component contains no business logic — it is purely a
 * composition layer. All visual/content logic lives in the section
 * components (currently mocked above, pending extraction to
 * components/landing/*).
 * ----------------------------------------------------------------
 */
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <CTASection />
    </>
  )
}