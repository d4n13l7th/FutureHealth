/**
 * achievementService
 * ----------------------------------------------------------------
 * Pure logic service that evaluates achievement unlock conditions
 * against simulation history data. Uses a declarative rule list
 * so new achievements are just new entries — no UI changes needed.
 *
 * Persistence is delegated to backend.syncAchievements
 * (Cloudflare Worker + D1 `achievements` table). Unlocked keys are
 * written best-effort; when the network/user is unavailable the
 * evaluation still works from history alone.
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

import { getAchievements, syncAchievements } from './backend.js'

// ----------------------------------------------------------------
// Persistence (best-effort, D1-backed)
// ----------------------------------------------------------------

/**
 * Evaluates unlocked achievements from the given history and tries to
 * persist the winning keys to the backend (PUT /achievements). Never
 * throws: failures are swallowed so achievement syncing can never
 * break the simulation save flow.
 *
 * @param {Array} history - Simulation records from the backend API.
 * @returns {Promise<{ data: Array<string>, error: Error|null }>}
 */
export async function persistAchievementsBestEffort(history = []) {
  try {
    const unlocked = evaluateAchievements(history)
      .filter((a) => a.unlocked)
      .map((a) => a.key)
    if (unlocked.length === 0) return { data: [], error: null }
    const { data, error } = await syncAchievements(unlocked)
    return { data: data ?? [], error }
  } catch (err) {
    return { data: null, error: err }
  }
}

/**
 * Loads the achievement keys the server has stored, merged with the
 * client-side evaluation so previously-unlocked achievements survive
 * even when history is incomplete. Returns { data: Array<string>, error }.
 *
 * @param {Array} history
 * @returns {Promise<{ data: Array<string>, error: Error|null }>}
 */
export async function getPersistedAchievementKeys(history = []) {
  const clientKeys = evaluateAchievements(history)
    .filter((a) => a.unlocked)
    .map((a) => a.key)
  const { data, error } = await getAchievements()
  const serverKeys = Array.isArray(data) ? data : []
  const merged = Array.from(new Set([...clientKeys, ...serverKeys]))
  return { data: merged, error }
}

/**
 * Kept for callers that previously used the no-op. Delegates to the
 * history-based best-effort sync (ignores the single-key signature).
 *
 * @param {string} _userId
 * @param {string} _achievementKey
 */
export async function persistAchievement(_userId, _achievementKey) {
  return persistAchievementsBestEffort([])
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
