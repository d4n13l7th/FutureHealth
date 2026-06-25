import HeroSection from '../components/landing/HeroSection.jsx'
import ProblemSection from '../components/landing/ProblemSection.jsx'
import HowItWorksSection from '../components/landing/HowItWorksSection.jsx'
import CTASection from '../components/landing/CTASection.jsx'

/**
 * LandingPage
 * ----------------------------------------------------------------
 * Public marketing page rendered at "/". Orchestrates the landing
 * narrative by composing, in order:
 *
 *   1. HeroSection      — headline, subtitle, primary CTA, illustration
 *   2. ProblemSection   — the gap FutureHealth addresses
 *   3. HowItWorksSection — 5-step simulation process
 *   4. CTASection       — final call-to-action
 *
 * This component contains no business logic — it is purely a
 * composition layer. All visual/content logic lives in the section
 * components under components/landing/.
 * ----------------------------------------------------------------
 */
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <CTASection />
    </>
  )
}