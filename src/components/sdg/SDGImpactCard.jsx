import { Globe, HeartPulse } from 'lucide-react'

/**
 * SDGImpactCard
 * ----------------------------------------------------------------
 * Reusable card explaining how FutureHealth aligns with UN SDG 3
 * (Good Health and Well-being). Can be used on SDGPage and
 * optionally on LandingPage.
 *
 * Props:
 * - title:       string — pillar title (e.g. "Pencegahan Penyakit")
 * - description: string — explanatory text
 * - icon:        LucideIcon — optional override icon (defaults to HeartPulse)
 * - className:   string — additional CSS classes
 * ----------------------------------------------------------------
 */
export default function SDGImpactCard({
  title,
  description,
  icon: Icon = HeartPulse,
  className = '',
}) {
  return (
    <div className={`card flex flex-col gap-3 ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Icon size={22} />
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  )
}
