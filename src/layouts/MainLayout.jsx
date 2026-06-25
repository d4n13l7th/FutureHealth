import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import ChatWidget from '../components/chatbot/ChatWidget.jsx'

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