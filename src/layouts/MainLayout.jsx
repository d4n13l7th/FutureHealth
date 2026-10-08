import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import ChatWidget from '../components/chatbot/ChatWidget.jsx'
import MobileTabBar from '../components/layout/MobileTabBar.jsx'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * RouteFallback
 * ----------------------------------------------------------------
 * Shown by the Suspense boundary around <Outlet /> while a
 * React.lazy page chunk (AppRouter.jsx) is still loading. Navbar,
 * Footer, and ChatWidget stay mounted because the boundary only
 * wraps the routed content.
 * ----------------------------------------------------------------
 */
function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-400">
      <Loader2 size={32} className="animate-spin text-emerald-500" />
      <p className="text-sm">Memuat halaman…</p>
    </div>
  )
}

/**
 * MainLayout
 * ----------------------------------------------------------------
 * Global application shell rendered for every route.
 *
 * Layout strategy ("sticky footer"):
 * - Root container: `min-h-screen flex flex-col` — full viewport
 *   height, content stacked vertically.
 * - `<main>`: `flex-grow` — expands to fill remaining space, so on
 *   short pages the footer is pushed to the bottom of the viewport
 *   instead of floating in the middle.
 * - `<Footer />` then naturally sits at the bottom, either pinned
 *   to the viewport edge (short pages) or after content (tall pages).
 *
 * The global `<ChatWidget />` is rendered for ALL users (including
 * guests) so it doubles as an advertising and help tool for the
 * platform. When no simulation data is available the chatbot
 * still answers general questions about FutureHealth and SDG 3.
 * ----------------------------------------------------------------
 */
export default function MainLayout() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 pb-16 md:pb-0">
      <Navbar />

      <main className="flex-grow">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />

      {user && <MobileTabBar />}

      <ChatWidget />
    </div>
  )
}