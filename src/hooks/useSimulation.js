import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useSimulationContext } from '../context/SimulationContext.jsx'
import { runSimulation } from '../services/simulationEngine.js'
import { saveSimulation } from '../services/supabase.js'

/**
 * useSimulation
 * ----------------------------------------------------------------
 * Primary orchestrator for running and persisting a FutureHealth
 * simulation. Bridges three layers:
 *
 *   1. simulationEngine.js  — pure, deterministic calculation
 *   2. SimulationContext     — in-memory "active simulation" state
 *   3. services/supabase.js  — persistence (simulation history)
 *
 * Usage (in SimulationPage):
 *   const { runAndSaveSimulation, isSimulating } = useSimulation()
 *
 *   async function handleSubmit(formInputs) {
 *     const { result, error } = await runAndSaveSimulation(formInputs)
 *     if (!error) navigate('/results')
 *   }
 * ----------------------------------------------------------------
 */
export function useSimulation() {
  const { user } = useAuth()
  const { setCurrentInputs, setCurrentResult } = useSimulationContext()

  const [isSimulating, setIsSimulating] = useState(false)

  /**
   * Runs the simulation engine on the given inputs, immediately
   * updates SimulationContext so the UI can render results without
   * waiting on the network, then persists the record to Supabase
   * if the user is authenticated.
   *
   * @param {object} inputs - Raw form inputs from SimulationForm
   *   (personal info, lifestyle answers, target, commitmentLevel).
   * @returns {Promise<{ result: object|null, error: Error|null }>}
   */
  const runAndSaveSimulation = useCallback(
    async (inputs) => {
      setIsSimulating(true)

      try {
        // 1. Pure, deterministic calculation — never throws under
        // normal use, but guard anyway since malformed inputs from
        // a misbehaving form could theoretically reach here.
        const result = runSimulation(inputs)

        // 2. Update shared in-memory state immediately so
        // ResultsPage can render without waiting on persistence.
        setCurrentInputs(inputs)
        setCurrentResult(result)

        // 3. Persist to Supabase if the user is authenticated.
        // Awaited so save errors can be surfaced to the caller,
        // but the context has already been updated above — a save
        // failure does not block the user from viewing their result.
        if (user) {
          const { error: saveError } = await saveSimulation(user.id, inputs, result)

          if (saveError) {
            console.error('Gagal menyimpan simulasi ke Supabase:', saveError.message)
            return { result, error: saveError }
          }
        }

        return { result, error: null }
      } catch (err) {
        console.error('Gagal menjalankan simulasi:', err)
        return { result: null, error: err }
      } finally {
        setIsSimulating(false)
      }
    },
    [user, setCurrentInputs, setCurrentResult]
  )

  return {
    runAndSaveSimulation,
    isSimulating,
  }
}