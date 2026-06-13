import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'

/**
 * EmptyDashboardState
 * ----------------------------------------------------------------
 * Placeholder UI shown on DashboardPage when the user has no
 * simulation history yet. Converts an empty dashboard into a
 * motivational prompt to run their first FutureHealth simulation.
 *
 * No outer margin — spacing is the parent's responsibility.
 * Purely presentational — no props, no context, no API calls.
 * ----------------------------------------------------------------
 */
export default function EmptyDashboardState() {
  return (
    <div className="card flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
        <Sparkles size={28} />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-900">Belum Ada Simulasi</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Anda belum menjalankan simulasi masa depan. Mulai sekarang untuk
          melihat bagaimana kebiasaan Anda hari ini dapat membentuk kesehatan
          Anda di masa depan.
        </p>
      </div>

      <Link to="/simulation" className="btn-primary">
        Mulai Simulasi Saya
        <ArrowRight size={18} />
      </Link>
    </div>
  )
}