import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  Brain,
  Compass,
  FileText,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

import PageContainer from '../components/layout/PageContainer.jsx'
import DisclaimerBanner from '../components/results/DisclaimerBanner'
import FutureSelfCard from '../components/results/FutureSelfCard'
import HealthAgeBadge from '../components/results/HealthAgeBadge'
import BMICard from '../components/results/BMICard'
import HealthScoreCircle from '../components/results/HealthScoreCircle'
import HealthTrendBadge from '../components/results/HealthTrendBadge'
import InsightsPanel from '../components/results/InsightsPanel'
import NarrativeReport from '../components/results/NarrativeReport'
import RecommendationsList from '../components/results/RecommendationsList'
import RiskRadar from '../components/results/RiskRadar'
import TrajectoryChart from '../components/results/TrajectoryChart'
import WhatIfPanel from '../components/whatif/WhatIfPanel'
import { useSimulationContext } from '../context/SimulationContext'
import { useSimulationRecord } from '../hooks/useSimulationRecord'

/**
 * Format the created_at timestamp of a historical simulation record
 * into a short, human-readable string (e.g. "22 Mei 2026 09.30").
 *
 * The function is defensive: if the timestamp is missing/invalid it
 * returns an empty string so the UI can gracefully fall back.
 *
 * @param {string|number|Date|undefined|null} createdAt
 * @returns {string}
 */
function formatRecordDate(createdAt) {
  if (!createdAt) return ''

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
}

export default function ResultsPage() {
  const { id } = useParams()
  const { currentResult, currentInputs, whatIfResult } = useSimulationContext()
  const { record, isLoading: isRecordLoading, error: recordError } = useSimulationRecord(id)

  const isReadOnly = Boolean(id)

  if (isReadOnly && isRecordLoading) {
    return (
      <PageContainer className="py-12">
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
          <p className="text-sm font-medium text-slate-500">Memuat data simulasi...</p>
        </div>
      </PageContainer>
    )
  }

  if (isReadOnly && (recordError || !record?.results)) {
    return (
      <PageContainer className="py-12">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{recordError ?? 'Data simulasi tidak ditemukan atau telah dihapus.'}</span>
          </div>
          <Link to="/history" className="btn-secondary px-4 py-2 text-sm">
            <ArrowLeft size={16} />
            Kembali ke Riwayat
          </Link>
        </div>
      </PageContainer>
    )
  }

  if (!isReadOnly && !currentResult) {
    return <Navigate to="/simulation" replace state={{ fromRedirect: true }} />
  }

  const resolvedResult = isReadOnly ? record.results : currentResult
  const resolvedInputs = isReadOnly ? record?.inputs : currentInputs

  const whatIfTimeline = !isReadOnly && whatIfResult?.timeline ? whatIfResult.timeline : undefined

  return (
    <PageContainer className="py-12">
      {isReadOnly && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className="pill">Simulasi {formatRecordDate(record?.created_at)}</span>
          <Link to="/history" className="btn-secondary px-4 py-2 text-sm">
            <ArrowLeft size={16} />
            Kembali ke Riwayat
          </Link>
        </div>
      )}

      <DisclaimerBanner text={resolvedResult.disclaimer} />

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="mb-8 grid gap-4 lg:grid-cols-[auto_1fr]"
      >
        <HealthScoreCircle score={resolvedResult.healthScore} category={resolvedResult.category} />
        <div className="grid gap-4 sm:grid-cols-3">
          <HealthAgeBadge actualAge={resolvedInputs?.age} healthAge={resolvedResult.healthAge} />
          <BMICard bmi={resolvedResult.bmi} bmiCategory={resolvedResult.bmiCategory} />
          <HealthTrendBadge trend={resolvedResult.healthTrend} />
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="mb-8"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
            <Compass size={16} className="text-emerald-600" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">01. Lintasan Kesehatan Anda</h2>
        </div>
        <TrajectoryChart timeline={resolvedResult.timeline} whatIfTimeline={whatIfTimeline} />
      </motion.section>

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="mb-8"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
            <Sparkles size={16} className="text-emerald-600" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">02. Diri Anda di Masa Depan</h2>
        </div>
        <FutureSelfCard futureSelf={resolvedResult.futureSelf} score={resolvedResult.healthScore} />
      </motion.section>

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="mb-8"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
            <FileText size={16} className="text-emerald-600" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">03. Cerita Perjalanan Kesehatan</h2>
        </div>
        <NarrativeReport narrative={resolvedResult.narrative} />
      </motion.section>

      {!isReadOnly && (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mb-8"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
              <Zap size={16} className="text-emerald-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">04. Skenario What-If</h2>
          </div>
          <WhatIfPanel />
        </motion.section>
      )}

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="mb-8"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
            <Brain size={16} className="text-emerald-600" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">05. Wawasan &amp; Rekomendasi</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <InsightsPanel
            insights={resolvedResult.insights}
            strongestFactor={resolvedResult.strongestFactor}
            weakestFactor={resolvedResult.weakestFactor}
          />
          <div className="flex flex-col gap-6">
            <RecommendationsList recommendations={resolvedResult.recommendations} />
            <RiskRadar risks={resolvedResult.risks} />
          </div>
        </div>
      </motion.section>
    </PageContainer>
  )
}
