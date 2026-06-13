import { useState, useCallback } from 'react'
import { useSimulationContext } from '../context/SimulationContext.jsx'
import { runSimulation } from '../services/simulationEngine.js'

/**
 * useWhatIf
 * ----------------------------------------------------------------
 * Logical orchestrator for the What-If simulator on ResultsPage.
 *
 * Lets the user tweak individual lifestyle variables and instantly
 * see a recalculated result (`whatIfResult`) without mutating the
 * original simulation (`currentInputs`/`currentResult`), with the
 * option to later "adopt" the tweaked scenario as the new baseline.
 *
 * State:
 * - overrides: local, partial inputs object representing only the
 *   fields currently being tweaked (e.g. { exerciseFrequency: '...' })
 *
 * Actions:
 * - calculateWhatIf(newOverrides) — merges overrides into
 *   currentInputs, recalculates, and writes to
 *   SimulationContext.whatIfResult
 * - resetWhatIf() — clears overrides and whatIfResult
 * - applyWhatIfToCurrent() — promotes the current merged
 *   inputs/result into currentInputs/currentResult, then resets
 *   What-If state
 *
 * Usage (in WhatIfPanel):
 *   const { overrides, calculateWhatIf, resetWhatIf, applyWhatIfToCurrent } = useWhatIf()
 *   const { currentResult, whatIfResult } = useSimulationContext()
 *
 *   <WhatIfControl onChange={(field, value) => calculateWhatIf({ [field]: value })} />
 * ----------------------------------------------------------------
 */
export function useWhatIf() {
  const { currentInputs, setCurrentInputs, setCurrentResult, setWhatIfResult } =
    useSimulationContext()

  const [overrides, setOverrides] = useState({})

  /**
   * Merges new overrides into local state, recalculates the
   * simulation against `currentInputs + overrides`, and writes the
   * result to SimulationContext.whatIfResult for the impact preview.
   *
   * @param {object} newOverrides - Partial inputs to merge, e.g.
   *   { exerciseFrequency: '5 kali atau lebih per minggu' }
   */
  const calculateWhatIf = useCallback(
    (newOverrides) => {
      if (!currentInputs) {
        // No base simulation to compare against — nothing to do.
        return
      }

      setOverrides((previousOverrides) => {
        const mergedOverrides = { ...previousOverrides, ...newOverrides }
        const mergedInputs = { ...currentInputs, ...mergedOverrides }

        const result = runSimulation(mergedInputs)
        setWhatIfResult(result)

        return mergedOverrides
      })
    },
    [currentInputs, setWhatIfResult]
  )

  /**
   * Clears all active overrides and the What-If preview result,
   * returning the UI to "comparing against base scenario only".
   */
  const resetWhatIf = useCallback(() => {
    setOverrides({})
    setWhatIfResult(null)
  }, [setWhatIfResult])

  /**
   * Promotes the current What-If scenario (currentInputs +
   * overrides, and its recalculated result) into the baseline
   * currentInputs/currentResult, then resets What-If state.
   *
   * After this call, the previously-temporary "what if" scenario
   * becomes the new "current" simulation.
   */
  const applyWhatIfToCurrent = useCallback(() => {
    if (!currentInputs || Object.keys(overrides).length === 0) {
      // Nothing to apply.
      return
    }

    const mergedInputs = { ...currentInputs, ...overrides }
    const result = runSimulation(mergedInputs)

    setCurrentInputs(mergedInputs)
    setCurrentResult(result)

    setOverrides({})
    setWhatIfResult(null)
  }, [currentInputs, overrides, setCurrentInputs, setCurrentResult, setWhatIfResult])

  return {
    overrides,
    calculateWhatIf,
    resetWhatIf,
    applyWhatIfToCurrent,
  }
}