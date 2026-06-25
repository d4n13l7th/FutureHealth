import { Droplets, Dumbbell, Brain, Smartphone, Salad } from 'lucide-react'
import PageContainer from '../layout/PageContainer.jsx'

const STEPS = [
  { icon: Droplets, title: 'Masukkan Kondisi Saat Ini', desc: 'Masukkan kondisi dan gaya hidup saat ini.' },
  { icon: Dumbbell, title: 'Pilih Target Kesehatan', desc: 'Pilih target kesehatan yang ingin dicapai.' },
  { icon: Brain, title: 'Jalankan Simulasi', desc: 'Jalankan simulasi masa depan kesehatanmu.' },
  { icon: Smartphone, title: 'Lihat Hasil Proyeksi', desc: 'Lihat hasil proyeksi kesehatan secara visual.' },
  { icon: Salad, title: 'Ubah & Bandingkan', desc: 'Ubah kebiasaan dan bandingkan hasilnya.' },
]

/**
 * HowItWorksSection
 * ----------------------------------------------------------------
 * Landing page section showing the 5-step simulation process.
 * Purely presentational with content from constants.
 * ----------------------------------------------------------------
 */
export default function HowItWorksSection() {
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
          {STEPS.map((step, index) => {
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
