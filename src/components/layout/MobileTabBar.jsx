import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FlaskConical, History, User } from 'lucide-react'

/**
 * MobileTabBar
 * ----------------------------------------------------------------
 * Bottom tab bar for small screens (below md), rendered inside
 * MainLayout for authenticated users only. Desktop keeps the
 * top Navbar.
 *
 * Tabs: Dashboard, Simulasi, Riwayat, Profil — each at least 44px
 * tall for touch targets, with an emerald active state. Purely
 * presentational link rendering; auth state lives in MainLayout.
 * ----------------------------------------------------------------
 */

const TABS = [
  { to: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
  { to: '/simulation', label: 'Simulasi', icon: FlaskConical },
  { to: '/history', label: 'Riwayat', icon: History },
  { to: '/profile', label: 'Profil', icon: User },
]

export default function MobileTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Navigasi utama"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-[56px] flex-col items-center justify-center gap-0.5 ${
                isActive
                  ? 'text-emerald-600'
                  : 'text-slate-400 transition-colors hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                <span className="text-[11px] font-medium">{label}</span>
                <span
                  className={`h-1 w-1 rounded-full bg-emerald-500 transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}