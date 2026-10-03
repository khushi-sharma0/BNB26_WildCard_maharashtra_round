import React from 'react'
import { Activity, Play, RefreshCw } from 'lucide-react'

interface EmptyStateProps {
  type: string
  onAction: () => void
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
  return (
    <div className="panel empty-state-container">
      <Activity size={40} className="text-muted mb-3" />
      <h3 className="empty-title">
        {type === 'no-runs' ? 'No Matching Traces Found' : 'No Trace Comparison Active'}
      </h3>
      <p className="empty-subtitle">
        {type === 'no-runs'
          ? 'Try adjusting your search query or filter settings.'
          : 'Run a checkpoint replay simulation on a failed trace to generate a side-by-side diff.'}
      </p>
      <button className="button-primary mt-4" onClick={onAction}>
        {type === 'no-runs' ? (
          <>
            <RefreshCw size={14} />
            <span>Reset Filters</span>
          </>
        ) : (
          <>
            <Play size={14} fill="currentColor" />
            <span>Start Replay Simulation</span>
          </>
        )}
      </button>
    </div>
  )
}
