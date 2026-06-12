import { Link } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'

/**
 * Footer
 * ----------------------------------------------------------------
 * Global footer rendered once inside MainLayout for every route.
 *
 * Sections:
 * - Brand + short tagline + SDG 3 badge
 * - Navigation links (internal + mock legal pages)
 * - Dynamic copyright year
 *
 * Purely presentational — no auth state or business logic.
 * ----------------------------------------------------------------
 */
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand + tagline + SDG badge */}
          <div className="max-w-sm">
            <Link to="/" className="text-lg font-bold tracking-tight text-slate-900">
              Future<span className="text-emerald-500">Health</span>
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Simulasikan masa depan kesehatanmu dan temukan bagaimana kebiasaan
              hari ini membentuk versi dirimu yang akan datang.
            </p>

            {/* SDG 3 badge */}
            <Link
              to="/sdg"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <HeartPulse size={14} />
              Mendukung SDG 3 — Kehidupan Sehat &amp; Sejahtera
            </Link>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col gap-2 text-sm sm:flex-row sm:gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Navigasi
              </span>
              <Link to="/" className="text-slate-600 transition-colors hover:text-emerald-600">
                Beranda
              </Link>
              <Link to="/sdg" className="text-slate-600 transition-colors hover:text-emerald-600">
                Tentang SDG 3
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Legal
              </span>
              <a href="#" className="text-slate-600 transition-colors hover:text-emerald-600">
                Kebijakan Privasi
              </a>
              <a href="#" className="text-slate-600 transition-colors hover:text-emerald-600">
                Syarat Ketentuan
              </a>
            </div>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          &copy; {currentYear} FutureHealth. Seluruh hasil simulasi bersifat edukatif
          dan bukan merupakan diagnosis medis.
        </div>
      </div>
    </footer>
  )
}