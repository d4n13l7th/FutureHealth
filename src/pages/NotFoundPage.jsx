import { Link } from 'react-router-dom'
import { HelpCircle, ArrowLeft } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer.jsx'

/**
 * NotFoundPage
 * ----------------------------------------------------------------
 * Global 404 fallback, rendered for any unmatched route via
 * AppRouter.jsx's path="*".
 *
 * Centered layout: icon, heading, explanation, and a primary
 * action linking back to the landing page ("/") — chosen over
 * "/dashboard" since this page may be reached by unauthenticated
 * visitors as well.
 * ----------------------------------------------------------------
 */
export default function NotFoundPage() {
  return (
    <PageContainer className="py-12">
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
          <HelpCircle size={32} />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Halaman Tidak Ditemukan
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau
            tidak pernah ada. Silakan kembali ke halaman utama untuk
            melanjutkan.
          </p>
        </div>

        <Link to="/" className="btn-primary mt-2">
          <ArrowLeft size={18} />
          Kembali ke Beranda
        </Link>
      </div>
    </PageContainer>
  )
}