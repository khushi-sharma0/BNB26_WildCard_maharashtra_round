import React from 'react'
import { ArrowLeft, ArrowRight, Play, Sparkles, X } from 'lucide-react'

export interface DemoStep {
  step: number
  title: string
  description: string
}

export const demoSteps: DemoStep[] = [
  {
    step: 1,
    title: '1. Overview Dashboard',
    description: 'Inspect cluster-wide run health, error rates, and key metrics.',
  },
  {
    step: 2,
    title: '2. Trace Inspector',
    description: 'Drill down into failed agent execution RUN-101.',
  },
  {
    step: 3,
    title: '3. Root Cause Analysis',
    description: 'Review automated AI diagnosis flagging Step 3 formula error.',
  },
  {
    step: 4,
    title: '4. Checkpoint Replay',
    description: 'Simulate re-running from Step 3 with corrected parameters.',
  },
  {
    step: 5,
    title: '5. Side-by-side Trace Diff',
    description: 'Compare original failed trace against corrected replayed trace.',
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

export function DemoTourBar({
  currentStepIndex,
  isActive,
  onNext,
  onPrev,
  onSelectStep,
  onClose,
  onOpenReplayModal,
}: DemoTourBarProps) {
  if (!isActive) return null

  const currentStep = demoSteps[currentStepIndex] || demoSteps[0]

  return (
    <div className="demo-tour-banner">
      <div className="demo-tour-left">
        <Sparkles size={16} className="text-cyan" />
        <strong className="demo-tour-title">{currentStep.title}:</strong>
        <span className="demo-tour-desc">{currentStep.description}</span>
      </div>

      <div className="demo-tour-center">
        {demoSteps.map((step, idx) => (
          <button
            key={step.step}
            className={`step-pill ${idx === currentStepIndex ? 'active' : ''}`}
            onClick={() => onSelectStep(idx)}
          >
            {step.step}
          </button>
        ))}
      </div>

      <div className="demo-tour-right">
        {currentStepIndex === 3 && (
          <button className="button-primary micro" onClick={onOpenReplayModal}>
            <Play size={12} fill="currentColor" />
            <span>Launch Replay</span>
          </button>
        )}
        <button className="icon-btn-subtle" onClick={onPrev} disabled={currentStepIndex === 0}>
          <ArrowLeft size={14} />
        </button>
        <button
          className="icon-btn-subtle"
          onClick={onNext}
          disabled={currentStepIndex === demoSteps.length - 1}
        >
          <ArrowRight size={14} />
        </button>
        <button className="icon-btn-subtle" onClick={onClose}>
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
