import ProgressBar from '../ui/ProgressBar.jsx'

/**
 * StepProgressBar
 * ----------------------------------------------------------------
 * Domain-specific wrapper around ui/ProgressBar for the multi-step
 * SimulationForm wizard. Translates "step X of Y" into a label
 * ("Langkah X dari Y") and a percentage passed to ProgressBar.
 *
 * Props:
 * - currentStep: number (1-based) — the active step.
 * - totalSteps: number — total number of steps in the wizard.
 *
 * Purely presentational — no context, no state.
 *
 * Usage:
 *   <StepProgressBar currentStep={2} totalSteps={4} />
 * ----------------------------------------------------------------
 */
export default function StepProgressBar({ currentStep, totalSteps }) {
    const progress = (currentStep / totalSteps) * 100

    return (
        <div className="mb-8">
            <p className="mb-2 text-sm font-semibold text-slate-500">
                Langkah {currentStep} dari {totalSteps}
            </p>
            <ProgressBar progress={progress} />
        </div>
    )
}