// FILE: src/hooks/useSimulationHistory.js

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getSimulationHistory } from '../services/supabase.js'

/**
 * useSimulationHistory
 * ----------------------------------------------------------------
 * Data-fetching hook for retrieving the authenticated user's past
 * simulations from Supabase (the `simulations` table, via
 * services/supabase.js's getSimulationHistory).
 *
 * Used by DashboardPage (last simulation, active goal summaries)
 * and HistoryPage (full history list, compare-futures source data).
 *
 * State:
 * - history:   array of simulation records, default []
 * - isLoading: true while a fetch is in flight
 * - error:     string message on failure, otherwise null
 *
 * Behavior:
 * - On mount (and whenever `user` changes), automatically calls
 *   fetchHistory() if the user is authenticated.
 * - If there is no authenticated user, history is reset to [] and
 *   isLoading is set to false without attempting a fetch.
 * - fetchHistory() can be called manually (e.g. after saving a new
 *   simulation, or to retry after an error).
 * ----------------------------------------------------------------
 */
export function useSimulationHistory() {
  const { user } = useAuth()

  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Fetches the current user's simulation history from Supabase
   * and updates local state accordingly.
   */
  const fetchHistory = useCallback(async () => {
    if (!user) {
      setHistory([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getSimulationHistory(user.id)

      if (fetchError) {
        setError(fetchError.message ?? 'Gagal memuat riwayat simulasi.')
        return
      }

      setHistory(data ?? [])
    } catch (err) {
      setError('Terjadi kesalahan tak terduga saat memuat riwayat simulasi.')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    history,
    isLoading,
    error,
    fetchHistory,
  }
}