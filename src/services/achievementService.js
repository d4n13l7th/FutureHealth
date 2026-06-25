/**
 * achievementService
 * ----------------------------------------------------------------
 * Pure logic service that evaluates achievement unlock conditions
 * against simulation history data. Uses a declarative rule list
 * so new achievements are just new entries — no UI changes needed.
 *
 * Optionally persists unlocked achievements to a Supabase
 * `achievements` table (if available).
 *
 * Used by: AchievementsStrip, DashboardPage
 * ----------------------------------------------------------------
 */

import { supabase } from './supabase.js'

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
 * @param {Array} history - Array of simulation records from Supabase.
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
 * Persists a newly unlocked achievement to the Supabase
 * `achievements` table. Silently no-ops if the table doesn't exist
 * or the insert fails (achievements are a bonus feature, not
 * mission-critical).
 *
 * @param {string} userId
 * @param {string} achievementKey
 */
export async function persistAchievement(userId, achievementKey) {
  try {
    await supabase
      .from('achievements')
      .upsert(
        { user_id: userId, achievement_key: achievementKey, unlocked_at: new Date().toISOString() },
        { onConflict: 'user_id,achievement_key' }
      )
  } catch (err) {
    // Silently ignore — achievements persistence is optional
    console.warn('Achievement persistence skipped:', err.message)
  }
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
