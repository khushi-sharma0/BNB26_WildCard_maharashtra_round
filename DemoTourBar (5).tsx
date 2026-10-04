import React from 'react'
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Play, Eye, RotateCcw, X } from 'lucide-react'

export interface DemoStep {
  step: number
  title: string
  subtitle: string
  view: 'dashboard' | 'runs' | 'analytics' | 'agents' | 'comparison'
  highlightTarget?: string
}

export const demoSteps: DemoStep[] = [
  {
    step: 1,
    title: '1. Overview & Health',
    subtitle: 'Observe cluster health & failure volume across all active agents',
    view: 'dashboard',
  },
  {
    step: 2,
    title: '2. Failed Trace (RUN-101)',
    subtitle: 'Trace pizza order calculation halted at Step 03',
    view: 'runs',
  },
  {
    step: 3,
    title: '3. Root Cause Diagnosis',
    subtitle: 'TraceMind AI pinpoints suspicious extraction at step 03',
    view: 'runs',
    highlightTarget: 'diagnosis-panel',
  },
  {
    step: 4,
    title: '4. Replay from Step 03',
    subtitle: 'Patch faulty extraction and re-evaluate downstream execution',
    view: 'runs',
    highlightTarget: 'replay-action',
  },
  {
    step: 5,
    title: '5. Side-by-Side Diff',
    subtitle: 'Verify rectified calculation and zero reconciliation error',
    view: 'comparison',
  },
]

interface DemoTourBarProps {
  currentStepIndex: number
  isActive: boolean
  onNext: () => void
  onPrev: () => void
  onSelectStep: (index: number) => void
  onClose: () => void
  onOpenReplayModal: () => void
}

export const DemoTourBar: React.FC<DemoTourBarProps> = ({
  currentStepIndex,
  isActive,
  onNext,
  onPrev,
  onSelectStep,
  onClose,
  onOpenReplayModal,
}) => {
  if (!isActive) return null

  const current = demoSteps[currentStepIndex]
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === demoSteps.length - 1

  return (
    <div className="demo-tour-bar" role="region" aria-label="Guided Demo Walkthrough">
      <div className="demo-tour-inner">
        <div className="demo-tour-badge">
          <Sparkles size={14} className="sparkle-anim" />
          <span>GUIDED DEMO MODE</span>
        </div>

        <div className="demo-tour-steps">
          {demoSteps.map((s, idx) => {
            const isCompleted = idx < currentStepIndex
            const isCurrent = idx === currentStepIndex
            return (
              <button
                key={s.step}
                className={`demo-step-pill ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => onSelectStep(idx)}
                title={s.subtitle}
              >
                <span className="step-num">
                  {isCompleted ? <CheckCircle2 size={12} /> : `0${s.step}`}
                </span>
                <span className="step-name">{s.title.split('. ')[1]}</span>
              </button>
            )
          })}
        </div>

        <div className="demo-tour-message">
          <strong>{current.title}:</strong>
          <span>{current.subtitle}</span>
        </div>

        <div className="demo-tour-actions">
          {currentStepIndex === 3 && (
            <button className="button-accent-glow" onClick={onOpenReplayModal}>
              <Play size={13} fill="currentColor" />
              <span>Launch Replay</span>
            </button>
          )}

          <div className="demo-nav-group">
            <button
              className="icon-btn-subtle"
              onClick={onPrev}
              disabled={isFirst}
              aria-label="Previous demo step"
            >
              <ArrowLeft size={14} />
            </button>
            <button
              className="demo-next-btn button-primary"
              onClick={onNext}
              disabled={isLast}
            >
              <span>{isLast ? 'Demo Completed' : 'Next Step'}</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <button className="icon-btn-subtle close-btn" onClick={onClose} aria-label="Exit Demo">
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
