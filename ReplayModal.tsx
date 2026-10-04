import React, { useState, useEffect } from 'react'
import {
  Play,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Database,
  Terminal,
  RotateCcw,
  Check,
} from 'lucide-react'
import type { Run } from '../types'

interface ReplayModalProps {
  run: Run
  isOpen: boolean
  onClose: () => void
  onReplayComplete: (patchedOutput: string) => void
}

type SimulationPhase = 'idle' | 'validating' | 're-evaluating' | 'synthesizing' | 'completed'

export const ReplayModal: React.FC<ReplayModalProps> = ({
  run,
  isOpen,
  onClose,
  onReplayComplete,
}) => {
  const initialOutput =
    run.failureDiagnosis?.suggestedPatch ||
    run.replayOutputPreset ||
    (run.steps[2] ? run.steps[2].output : '')

  const [output, setOutput] = useState(initialOutput)
  const [simulationPhase, setSimulationPhase] = useState<SimulationPhase>('idle')
  const [progress, setProgress] = useState(0)
  const [phaseMessage, setPhaseMessage] = useState('')

  useEffect(() => {
    setOutput(initialOutput)
    setSimulationPhase('idle')
    setProgress(0)
  }, [run.id])

  if (!isOpen) return null

  const handleApplyPreset = () => {
    if (run.failureDiagnosis?.suggestedPatch) {
      setOutput(run.failureDiagnosis.suggestedPatch)
    } else if (run.replayOutputPreset) {
      setOutput(run.replayOutputPreset)
    }
  }

  const startReplaySimulation = () => {
    setSimulationPhase('validating')
    setProgress(20)
    setPhaseMessage('Validating patched calculation formula...')

    // Phase 1 -> Phase 2
    setTimeout(() => {
      setSimulationPhase('re-evaluating')
      setProgress(60)
      setPhaseMessage('Re-evaluating downstream steps with patched values...')
    }, 700)

    // Phase 2 -> Phase 3
    setTimeout(() => {
      setSimulationPhase('synthesizing')
      setProgress(88)
      setPhaseMessage('Emitting verified receipt with correct total ($32.20)...')
    }, 1500)

    // Phase 3 -> Completed
    setTimeout(() => {
      setSimulationPhase('completed')
      setProgress(100)
      setPhaseMessage('Replay simulation passed! Correct output achieved.')
    }, 2200)

    // Trigger parent callback to transition to side-by-side comparison
    setTimeout(() => {
      onReplayComplete(output)
    }, 2800)
  }

  const isSimulating = simulationPhase !== 'idle' && simulationPhase !== 'completed'

  return (
    <div className="modal-scrim" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && !isSimulating && onClose()}>
      <div className="replay-modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
        {/* Header */}
        <div className="modal-top">
          <div className="modal-kicker">
            <Database size={13} className="text-cyan" />
            <span>CHECKPOINT BRANCH & REPLAY · STEP 03</span>
          </div>
          <button
            className="icon-btn-subtle"
            onClick={onClose}
            disabled={isSimulating}
            aria-label="Close replay modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-header-copy">
          <h2 id="modal-heading" className="modal-heading">
            Live Replay & Downstream Re-evaluation
          </h2>
          <p className="modal-sub">
            Branch execution from Step 03 checkpoint. Correct the faulty extraction data below to simulate how downstream steps recalculate.
          </p>
        </div>

        {/* Checkpoint Meta Card */}
        <div className="checkpoint-banner">
          <div className="checkpoint-node-icon">
            <Terminal size={15} />
          </div>
          <div className="checkpoint-node-info">
            <strong>Information Extraction (Step 03)</strong>
            <span>Tool: <code>structured_extractor</code> · Snapshot: 10:42:21.6 · State Hash: <code>0x9F4A8</code></span>
          </div>
          <span className="checkpoint-tag">EDITABLE SNAPSHOT</span>
        </div>

        {/* Simulation in progress state */}
        {simulationPhase !== 'idle' ? (
          <div className="simulation-container">
            <div className="simulation-header">
              <div className="simulation-spinner-col">
                {simulationPhase === 'completed' ? (
                  <CheckCircle2 size={24} className="text-emerald anim-bounce" />
                ) : (
                  <div className="spinner-ring" />
                )}
              </div>
              <div className="simulation-text-col">
                <span className="simulation-step-indicator">
                  {simulationPhase === 'validating' && 'STAGE 1/3: STATE VALIDATION'}
                  {simulationPhase === 're-evaluating' && 'STAGE 2/3: DOWNSTREAM EXECUTION'}
                  {simulationPhase === 'synthesizing' && 'STAGE 3/3: FINAL SYNTHESIS'}
                  {simulationPhase === 'completed' && 'REPLAY COMPLETED SUCCESSFULLY'}
                </span>
                <p className="simulation-message">{phaseMessage}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="simulation-progress-track">
              <div
                className={`simulation-progress-bar ${simulationPhase === 'completed' ? 'completed' : ''}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Simulated execution steps list */}
            <div className="simulation-steps-preview">
              <div className={`sim-step ${progress >= 20 ? 'done' : 'pending'}`}>
                <span className="sim-dot" />
                <span>03. Extraction Patch Applied</span>
                {progress >= 20 && <Check size={13} className="text-emerald" />}
              </div>
              <div className={`sim-step ${progress >= 60 ? 'done' : progress >= 20 ? 'active' : 'pending'}`}>
                <span className="sim-dot" />
                <span>04. Python Reconciliation Kernel</span>
                {progress >= 60 && <Check size={13} className="text-emerald" />}
              </div>
              <div className={`sim-step ${progress >= 95 ? 'done' : progress >= 60 ? 'active' : 'pending'}`}>
                <span className="sim-dot" />
                <span>05. Executive Response Synthesizer</span>
                {progress >= 95 && <Check size={13} className="text-emerald" />}
              </div>
            </div>

            {simulationPhase === 'completed' && (
              <div className="simulation-done-notice">
                <Sparkles size={14} className="text-emerald" />
                <span>Launching Side-by-Side Trace Comparison...</span>
              </div>
            )}
          </div>
        ) : (
          /* Editor form when idle */
          <div className="modal-form-area">
            <div className="editor-topline">
              <label htmlFor="replay-editor" className="editor-label">
                STEP OUTPUT DATA (JSON / TEXT)
              </label>
              <button className="apply-preset-btn" onClick={handleApplyPreset}>
                <Sparkles size={12} className="text-cyan" />
                <span>Apply TraceMind Recommended Fix</span>
              </button>
            </div>

            <textarea
              id="replay-editor"
              className="replay-textarea"
              rows={6}
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              spellCheck={false}
              placeholder="Enter corrected extraction text or JSON..."
            />

            <div className="editor-hint">
              <Sparkles size={13} className="text-amber" />
              <span>
                Tip: Enforce normalized forecast denominators ($4.6M, $3.0M, $1.6M, $1.0M) so downstream python verification reconciles to exactly -$0.2M shortfall.
              </span>
            </div>

            {/* Simulation cost & trigger */}
            <div className="modal-footer">
              <div className="cost-est">
                <Zap size={13} className="text-amber" />
                <span>Estimated Replay Cost: <strong>$0.0038</strong> (Cached context)</span>
              </div>

              <div className="modal-btn-row">
                <button className="button-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button className="button-primary" onClick={startReplaySimulation}>
                  <Play size={13} fill="currentColor" />
                  <span>Execute Replay</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
