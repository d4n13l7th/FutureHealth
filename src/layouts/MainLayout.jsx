import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// ----------------------------------------------------------------
// TEMPORARY MOCK COMPONENTS
// ----------------------------------------------------------------
// These are minimal placeholders so MainLayout compiles and renders
// correctly before their real implementations exist. Each will be
// replaced by an import from its architecture-approved location:
//
//   import Navbar from '../components/layout/Navbar.jsx'
//   import Footer from '../components/layout/Footer.jsx'
//   import ChatWidget from '../components/chatbot/ChatWidget.jsx'
//
// TODO: Remove these mocks once the real components are generated.
// ----------------------------------------------------------------

/** TODO: replace with components/layout/Navbar.jsx */
function Navbar() {
  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <span className="text-lg font-bold tracking-tight text-slate-900">
          Future<span className="text-emerald-500">Health</span>
        </span>
        <span className="text-xs font-medium text-slate-400">Navbar (mock)</span>
      </div>
    </header>
  )
}

/** TODO: replace with components/layout/Footer.jsx */
function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-slate-400 sm:px-6 lg:px-8">
        Footer (mock) — &copy; {new Date().getFullYear()} FutureHealth
      </div>
    </footer>
  )
}

/** TODO: replace with components/chatbot/ChatWidget.jsx */
function ChatWidget() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105"
        aria-label="Buka asisten FutureHealth"
      >
        <span className="text-xs font-semibold">Chat</span>
      </button>
    </div>
  )
}

// ----------------------------------------------------------------
// MainLayout
// ----------------------------------------------------------------

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
 * The global `<ChatWidget />` is rendered only for authenticated
 * users, per the FutureHealth chatbot architecture (the assistant
 * is contextual to a user's simulation data and therefore only
 * meaningful once a user is logged in).
 * ----------------------------------------------------------------
 */
export default function MainLayout() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />

      {user && <ChatWidget />}
    </div>
  )
}