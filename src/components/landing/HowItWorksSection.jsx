import { Droplets, Dumbbell, Brain, Smartphone, Salad } from 'lucide-react'
import PageContainer from '../layout/PageContainer.jsx'

const STEPS = [
  { icon: Droplets, title: 'Kenali Kondisimu', desc: 'Masukkan data diri dan gaya hidup saat ini.' },
  { icon: Dumbbell, title: 'Pilih Target Sehat', desc: 'Pilih target kesehatan yang ingin kamu raih.' },
  { icon: Brain, title: 'Jalankan Simulasi', desc: 'Simulasi memproyeksikan masa depan kesehatanmu.' },
  { icon: Smartphone, title: 'Lihat Hasil Proyeksi', desc: 'Visualisasi skor kesehatan, usia, dan tren.' },
  { icon: Salad, title: 'Ubah & Bandingkan', desc: 'Sesuaikan kebiasaan dan lihat dampaknya.' },
]

/**
 * HowItWorksSection
 * ----------------------------------------------------------------
 * Landing page section showing the 5-step simulation process as a
 * numbered stepper with a dashed connector that draws in on desktop.
 * Purely presentational with content from constants.
 * ----------------------------------------------------------------
 */
export default function HowItWorksSection() {
  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <PageContainer>
        <div className="text-center">
          <span className="pill">Cara Kerja</span>
          <h2 className="section-title mt-3">Dari Kebiasaan ke Masa Depan</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Lima langkah sederhana untuk melihat cerminan dirimu di masa depan.
          </p>
        </div>

        <div className="relative mt-16">
          {/* Dashed connector (desktop only) */}
          <div className="absolute left-[9%] right-[9%] top-5 hidden lg:block" aria-hidden="true">
            <svg className="w-full" height="2" preserveAspectRatio="none" viewBox="0 0 1000 2" fill="none">
              <line
                x1="0"
                x2="1000"
                y1="1"
                y2="1"
                stroke="#C0DDCB"
                strokeWidth="2"
                strokeDasharray="6 8"
                strokeLinecap="round"
                className="animate-draw-line"
              />
            </svg>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-glow">
                    {index + 1}
                  </div>
                  <div className="card card-interactive mt-6 w-full p-5">
                    <Icon size={24} className="mx-auto text-emerald-500" />
                    <h3 className="mt-3 font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </PageContainer>
    </section>
  )
}