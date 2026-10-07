/**
 * achievementService
 * ----------------------------------------------------------------
 * Pure logic service that evaluates achievement unlock conditions
 * against simulation history data. Uses a declarative rule list
 * so new achievements are just new entries — no UI changes needed.
 *
 * No persistence backend in the current version — achievements are
 * evaluated entirely client-side.
 *
 * Used by: AchievementsStrip, DashboardPage
 * ----------------------------------------------------------------
 */

// ----------------------------------------------------------------
// Achievement definitions (declarative)
// ----------------------------------------------------------------

const ACHIEVEMENT_RULES = [
  {
    key: 'future_planner',
    label: 'Future Planner',
    description: 'Menyelesaikan simulasi pertama Anda.',
    icon: '🎯',
    condition: (history) => history.length >= 1,
  },
  {
    key: 'health_explorer',
    label: 'Health Explorer',
    description: 'Menjalankan 3 simulasi dengan target yang berbeda.',
    icon: '🔍',
    condition: (history) => {
      const uniqueTargets = new Set(history.map((sim) => sim.inputs?.target).filter(Boolean))
      return uniqueTargets.size >= 3
    },
  },
  {
    key: 'consistency_builder',
    label: 'Consistency Builder',
    description: 'Menjalankan 5 simulasi atau lebih.',
    icon: '🔥',
    condition: (history) => history.length >= 5,
  },
  {
    key: 'future_architect',
    label: 'Future Architect',
    description: 'Mencapai skor kesehatan 85+ dalam simulasi.',
    icon: '🏆',
    condition: (history) =>
      history.some((sim) => (sim.health_score ?? sim.results?.healthScore) >= 85),
  },
]

// ----------------------------------------------------------------
// Public API
// ----------------------------------------------------------------

/**
 * Evaluates all achievement rules against the provided simulation
 * history and returns the full list with unlock status.
 *
 * @param {Array} history - Array of simulation records from the backend API.
 * @returns {Array<{ key, label, description, icon, unlocked: boolean }>}
 */
export function evaluateAchievements(history = []) {
  return ACHIEVEMENT_RULES.map((rule) => ({
    key: rule.key,
    label: rule.label,
    description: rule.description,
    icon: rule.icon,
    unlocked: rule.condition(history),
  }))
}

/**
 * Returns only the unlocked achievements.
 *
 * @param {Array} history
 * @returns {Array<{ key, label, description, icon, unlocked: true }>}
 */
export function getUnlockedAchievements(history = []) {
  return evaluateAchievements(history).filter((a) => a.unlocked)
}

/**
 * Returns the total number of achievements and how many are unlocked.
 *
 * @param {Array} history
 * @returns {{ total: number, unlocked: number }}
 */
export function getAchievementProgress(history = []) {
  const all = evaluateAchievements(history)
  return {
    total: all.length,
    unlocked: all.filter((a) => a.unlocked).length,
  }
}

/**
 * Intentionally a no-op in the current Cloudflare backend: there is
 * no `achievements` table, so unlocked achievements are only shown
 * in-memory from the simulation history. Kept as an async function
 * so callers (e.g. DashboardPage) work unchanged.
 *
 * @param {string} userId
 * @param {string} achievementKey
 */
export async function persistAchievement(_userId, _achievementKey) {
  // No persistence backend available — achievements are evaluated
  // client-side from simulation history only.
  return
}

/**
 * Returns all achievement rule definitions (without evaluation).
 * Useful for rendering the full achievements list in the UI.
 */
export function getAchievementDefinitions() {
  return ACHIEVEMENT_RULES.map(({ key, label, description, icon }) => ({
    key,
    label,
    description,
    icon,
  }))
}
