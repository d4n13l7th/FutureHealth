import { Link } from 'react-router-dom'
import { Globe, Target, HeartPulse, Activity, ArrowRight } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer.jsx'

const PILLARS = [
  {
    key: 'prevention',
    icon: Target,
    title: 'Pencegahan Penyakit',
    description:
      'FutureHealth membantu pengguna memahami bagaimana kebiasaan harian dapat memengaruhi risiko penyakit tidak menular di masa depan, sehingga langkah pencegahan dapat dimulai lebih awal — sebelum masalah kesehatan benar-benar terjadi.',
  },
  {
    key: 'monitoring',
    icon: Activity,
    title: 'Pemantauan Kesehatan',
    description:
      'Melalui pelacakan gaya hidup yang berkelanjutan dan proyeksi usia kesehatan, pengguna dapat memantau perkembangan kondisi mereka dari waktu ke waktu dan melihat dampak nyata dari setiap perubahan kebiasaan.',
  },
  {
    key: 'education',
    icon: HeartPulse,
    title: 'Edukasi & Kesadaran',
    description:
      'Wawasan dan rekomendasi yang dipersonalisasi membantu pengguna memahami faktor-faktor yang memengaruhi kesehatan mereka, meningkatkan kesadaran, dan mendorong pengambilan keputusan yang lebih sehat secara mandiri.',
  },
]

/**
 * SDGPage
 * ----------------------------------------------------------------
 * Public, static informational page ("/sdg") explaining how
 * FutureHealth aligns with UN SDG 3 (Good Health and Well-being).
 *
 * Structure:
 *   1. Hero — emerald gradient banner with title and intro.
 *   2. Pillars grid — three cards (Pencegahan, Pemantauan, Edukasi)
 *      describing FutureHealth's preventive/educational focus.
 *   3. CTA — encourages the user to start their simulation.
 *
 * Purely presentational — no data fetching, state, or context.
 * ----------------------------------------------------------------
 */
export default function SDGPage() {
  return (
    <PageContainer className="py-12">
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-sky-500 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
            <Globe size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Mendukung SDG 3: Kehidupan Sehat dan Sejahtera
          </h1>
          <p className="leading-relaxed text-emerald-50">
            FutureHealth dirancang untuk mendukung Tujuan Pembangunan Berkelanjutan
            (SDG) ke-3 dari Perserikatan Bangsa-Bangsa, yaitu memastikan kehidupan
            yang sehat dan mendorong kesejahteraan bagi semua orang di segala usia
            — melalui pendekatan pencegahan, kesadaran, dan perencanaan kesehatan
            jangka panjang.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="mt-12">
        <div className="text-center">
          <h2 className="section-title">Bagaimana FutureHealth Berkontribusi</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Tiga pilar utama yang menghubungkan simulasi masa depan FutureHealth
            dengan misi SDG 3.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon

            return (
              <div key={pillar.key} className="card flex flex-col gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-slate-900">{pillar.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {pillar.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12">
        <div className="card flex flex-col items-center gap-4 bg-slate-50 px-6 py-10 text-center sm:px-12">
          <span className="pill">Mulai Perjalanan Anda</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Lihat bagaimana kebiasaan Anda hari ini membentuk masa depan kesehatan Anda
          </h2>
          <p className="max-w-md text-sm text-slate-500">
            Jalankan simulasi pertama Anda dan jadilah bagian dari gerakan menuju
            kehidupan yang lebih sehat dan sejahtera.
          </p>
          <Link to="/simulation" className="btn-primary">
            Mulai Simulasi Sekarang
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </PageContainer>
  )
}