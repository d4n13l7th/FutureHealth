import { useState, useEffect } from 'react'
import { getSimulationById } from '../services/supabase.js'

/**
 * useSimulationRecord
 * ----------------------------------------------------------------
 * Data-fetching hook for retrieving a single simulation record from
 * Supabase by its `id` (the `simulations` table, via
 * services/supabase.js's getSimulationById).
 *
 * Intended for the /history/:id route: ResultsPage (in its
 * read-only mode) reads `id` via useParams() and passes it here to
 * load a historical record's `inputs`/`results`, instead of reading
 * SimulationContext.currentResult.
 *
 * NOTE: services/supabase.js does not yet export `getSimulationById`.
 * It is expected to follow the same Promise<{ data, error }>
 * contract as the existing getSimulationHistory, scoped to a single
 * row via `.eq('id', id).single()`.
 *
 * State:
 * - record:    the simulation record object, or null
 * - isLoading: true while a fetch is in flight (initially
 *              Boolean(id) — false if no id was provided at all)
 * - error:     string message on failure, otherwise null
 *
 * Behavior:
 * - If `id` is falsy, immediately clears `record`/`error` and sets
 *   `isLoading` to false — no fetch is attempted.
 * - If `id` is truthy, fetches the record. Re-runs whenever `id`
 *   changes (e.g. navigating between /history/:id routes).
 * - Guards against state updates after unmount.
 * ----------------------------------------------------------------
 */
export function useSimulationRecord(id) {
  const [record, setRecord] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(id))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) {
      setRecord(null)
      setError(null)
      setIsLoading(false)
      return
    }

    let isMounted = true

    setIsLoading(true)
    setError(null)

    async function fetchRecord() {
      try {
        const { data, error: fetchError } = await getSimulationById(id)

        if (!isMounted) return

        if (fetchError) {
          setError(fetchError.message ?? 'Gagal memuat data simulasi.')
          setRecord(null)
          return
        }

        setRecord(data ?? null)
      } catch (err) {
        if (!isMounted) return
        setError('Terjadi kesalahan tak terduga saat memuat data simulasi.')
        setRecord(null)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchRecord()

    return () => {
      isMounted = false
    }
  }, [id])

  return { record, isLoading, error }
}