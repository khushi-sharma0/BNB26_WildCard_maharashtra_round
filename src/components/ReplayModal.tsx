import React, { useState } from 'react'
import { Play, Sparkles, X, CheckCircle2, RefreshCw } from 'lucide-react'
import type { Run } from '../types'

interface ReplayModalProps {
  run: Run
  isOpen: boolean
  onClose: () => void
  onReplayComplete: (patchedOutput: string) => void
}

export function ReplayModal({
  run,
  isOpen,
  onClose,
  onReplayComplete,
}: ReplayModalProps) {
  const [patchedInput, setPatchedInput] = useState(
    run.replayOutputPreset ||
      'Discount applied: $6.80 (20% of $34.00) | Discounted Subtotal: $27.20'
  )
  const [isSimulating, setIsSimulating] = useState(false)

  if (!isOpen) return null

  const handleSimulate = () => {
    setIsSimulating(true)
    setTimeout(() => {
      setIsSimulating(false)
      onReplayComplete(patchedInput)
    }, 1200)
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Sparkles className="text-cyan" size={18} />
            <h3>Checkpoint Replay Simulation</h3>
          </div>
          <button className="icon-btn-subtle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            Replaying trace for <strong>{run.id}</strong> starting at Step 0
            {run.checkpointStep || 3}. Modify step payload to simulate corrected execution.
          </p>

          <div className="form-group mt-4">
            <label className="form-label">Patched Formula / Output Payload</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={patchedInput}
              onChange={(e) => setPatchedInput(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="button-primary"
            onClick={handleSimulate}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Simulating Replay...</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>Execute Replay</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
