/**
 * Safely derives a display name for the greeting:
 * 1. First word of user.user_metadata.full_name (if present)
 * 2. The local part of user.email (before "@")
 * 3. Fallback: "Pengguna"
 *
 * Defensive against `user` being null/undefined, and against
 * `full_name`/`email` being missing, empty, or non-string.
 */
function getDisplayName(user) {
  const fullName = user?.user_metadata?.full_name
  if (typeof fullName === 'string' && fullName.trim().length > 0) {
    return fullName.trim().split(/\s+/)[0]
  }

  const email = user?.email
  if (typeof email === 'string' && email.includes('@')) {
    const localPart = email.split('@')[0]
    if (localPart.length > 0) {
      return localPart
    }
  }

  return 'Pengguna'
}

/**
 * WelcomeCard
 * ----------------------------------------------------------------
 * Greeting banner at the top of the populated DashboardPage.
 *
 * Displays a small "Selamat datang kembali," line, a large
 * personalized heading ("{displayName} 👋"), and a motivating
 * subtitle, on a vibrant emerald-to-sky gradient background.
 *
 * Extremely defensive: `user`, `user.user_metadata`, `full_name`,
 * and `email` may all be missing — display name always falls back
 * gracefully to "Pengguna".
 *
 * No outer margin — spacing is the parent's responsibility.
 * Purely presentational — no context, no hooks, no API calls.
 * ----------------------------------------------------------------
 */
export default function WelcomeCard({ user }) {
  const displayName = getDisplayName(user)

  return (
    <div className="card bg-gradient-to-br from-emerald-500 to-sky-500 text-white">
      <p className="text-sm font-medium text-emerald-50">Selamat datang kembali,</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        {displayName} 👋
      </h1>
      <p className="mt-2 max-w-md text-sm text-emerald-50">
        Terus pantau perkembangan kesehatanmu dan temukan kemungkinan masa depan baru.
      </p>
    </div>
  )
}