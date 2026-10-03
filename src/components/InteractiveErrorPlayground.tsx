import React from 'react'
import { FlaskConical, Play, Sparkles } from 'lucide-react'

interface InteractiveErrorPlaygroundProps {
  onSelectRun: (runId: string) => void
  onOpenReplayModal: () => void
  onOpenComparison: () => void
}

export function InteractiveErrorPlayground({
  onSelectRun,
  onOpenReplayModal,
  onOpenComparison,
}: InteractiveErrorPlaygroundProps) {
  return (
    <div className="panel error-lab-banner mb-4">
      <div className="error-lab-left">
        <FlaskConical size={18} className="text-amber" />
        <div>
          <strong>🧪 Interactive Failure Injection & Recovery Lab</strong>
          <p className="text-xs text-muted">
            Select pre-seeded failure scenarios to test BlackBox AI diagnosis & checkpoint recovery.
          </p>
        </div>
      </div>

      <div className="error-lab-actions">
        <button
          className="button-secondary micro"
          onClick={() => onSelectRun('RUN-101')}
        >
          <span>Scenario 1: Cart Calculation Bug</span>
        </button>
        <button
          className="button-secondary micro"
          onClick={() => onSelectRun('RUN-102')}
        >
          <span>Scenario 2: Tip Shortfall</span>
        </button>
        <button
          className="button-primary micro"
          onClick={onOpenReplayModal}
        >
          <Play size={12} fill="currentColor" />
          <span>Launch Replay</span>
        </button>
      </div>
    </div>
  )
}
