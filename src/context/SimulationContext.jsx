import { createContext, useContext, useState } from 'react'

/**
 * SimulationContext
 * ----------------------------------------------------------------
 * In-memory state container for the "active" simulation — i.e.
 * whatever the user is currently filling out, viewing, or
 * exploring via the What-If panel.
 *
 * This context holds RAW STATE ONLY:
 * - currentInputs: the lifestyle/profile inputs from SimulationForm
 * - currentResult: the output of simulationEngine.runSimulation()
 * - whatIfResult:  the output of simulationEngine.runWhatIf(), or
 *                  null when no What-If override is active
 *
 * It does NOT:
 * - run the simulation engine (see hooks/useSimulation.js,
 *   hooks/useWhatIf.js, and services/simulationEngine.js)
 * - read from or write to Supabase (see hooks/useSimulation.js and
 *   hooks/useSimulationHistory.js)
 *
 * This keeps SimulationContext a thin, predictable "shared memory"
 * layer that SimulationPage, ResultsPage, WhatIfPanel, and
 * ChatWidget can all read from and write to without prop-drilling
 * or redundant network calls.
 * ----------------------------------------------------------------
 */
const SimulationContext = createContext(undefined)

export function SimulationProvider({ children }) {
  const [currentInputs, setCurrentInputs] = useState(null)
  const [currentResult, setCurrentResult] = useState(null)
  const [whatIfResult, setWhatIfResult] = useState(null)

  /**
   * Resets the active simulation back to its initial empty state.
   * Useful when starting a brand-new simulation, or when the user
   * navigates away from a flow that should not persist in memory
   * (e.g. signing out).
   */
  function clearSimulation() {
    setCurrentInputs(null)
    setCurrentResult(null)
    setWhatIfResult(null)
  }

  const value = {
    currentInputs,
    setCurrentInputs,
    currentResult,
    setCurrentResult,
    whatIfResult,
    setWhatIfResult,
    clearSimulation,
  }

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  )
}

/**
 * useSimulationContext
 * ----------------------------------------------------------------
 * Hook for consuming SimulationContext. Throws if used outside of
 * SimulationProvider so misconfiguration is caught during
 * development.
 *
 * @returns {{
 *   currentInputs: object|null,
 *   setCurrentInputs: (inputs: object|null) => void,
 *   currentResult: object|null,
 *   setCurrentResult: (result: object|null) => void,
 *   whatIfResult: object|null,
 *   setWhatIfResult: (result: object|null) => void,
 *   clearSimulation: () => void,
 * }}
 */
export function useSimulationContext() {
  const context = useContext(SimulationContext)
  if (context === undefined) {
    throw new Error('useSimulationContext must be used within a SimulationProvider')
  }
  return context
}