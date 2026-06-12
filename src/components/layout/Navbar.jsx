import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * Navbar
 * ----------------------------------------------------------------
 * Global top navigation, rendered once inside MainLayout for every
 * route. Adapts its link set based on authentication state and
 * highlights the active route.
 *
 * - Unauthenticated: public links + "Masuk" / "Daftar" actions.
 * - Authenticated: app links + profile/sign-out section.
 *
 * Responsive: horizontal nav on md+ screens, collapsible mobile
 * menu below that breakpoint.
 * ----------------------------------------------------------------
 */

const PUBLIC_LINKS = [
  { to: '/', label: 'Beranda' },
  { to: '/sdg', label: 'Tentang SDG 3' },
]

const AUTHENTICATED_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/history', label: 'Riwayat' },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = user ? AUTHENTICATED_LINKS : PUBLIC_LINKS

  function isActive(path) {
    return location.pathname === path
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false)
  }

  async function handleSignOut() {
    closeMobileMenu()
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="text-lg font-bold tracking-tight text-slate-900"
        >
          Future<span className="text-emerald-500">Health</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth actions */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {/* TODO: refactor into <Button as={Link} variant="ghost"> once components/ui/Button.jsx exists */}
              <Link
                to="/profile"
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  isActive('/profile')
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <User size={16} />
                Profil
              </Link>
              {/* TODO: refactor into <Button variant="ghost"> once components/ui/Button.jsx exists */}
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={16} />
                Keluar
              </button>
            </>
          ) : (
            <>
              {/* TODO: refactor into <Button as={Link} variant="secondary"> once components/ui/Button.jsx exists */}
              <Link
                to="/auth"
                className="btn-secondary px-4 py-2 text-sm"
              >
                Masuk
              </Link>
              {/* TODO: refactor into <Button as={Link} variant="primary"> once components/ui/Button.jsx exists */}
              <Link
                to="/auth"
                className="btn-primary px-4 py-2 text-sm"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="flex items-center justify-center rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-50 md:hidden"
          aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMobileMenu}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive('/profile')
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <User size={16} />
                  Profil
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut size={16} />
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  onClick={closeMobileMenu}
                  className="btn-secondary w-full px-4 py-2.5 text-sm"
                >
                  Masuk
                </Link>
                <Link
                  to="/auth"
                  onClick={closeMobileMenu}
                  className="btn-primary w-full px-4 py-2.5 text-sm"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}