import React, { useState } from 'react'
import {
  ArrowLeft,
  GitCompare,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Terminal,
  Download,
  Play,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Layers,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import type { Run, TraceStep } from '../types'
import { mockReplayRun } from '../mockData'

interface TraceComparisonProps {
  run: Run
  onBackToTrace: () => void
  onReplayAgain: () => void
}

export const TraceComparison: React.FC<TraceComparisonProps> = ({
  run,
  onBackToTrace,
  onReplayAgain,
}) => {
  const [activeTab, setActiveTab] = useState<'side-by-side' | 'unified'>('side-by-side')
  const originalSteps = run.steps
  const replaySteps = mockReplayRun.replaySteps

  return (
    <div className="trace-comparison-view">
      {/* Top Bar */}
      <div className="comparison-nav-bar">
        <button className="back-link-btn" onClick={onBackToTrace}>
          <ArrowLeft size={14} />
          <span>Back to trace {run.id}</span>
        </button>

        <div className="comparison-actions">
          <button className="button-secondary" onClick={() => window.print()}>
            <Download size={13} />
            <span>Export Diff</span>
          </button>
          <button className="button-primary" onClick={onReplayAgain}>
            <Play size={13} fill="currentColor" />
            <span>Branch New Replay</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="view-header">
        <div>
          <div className="section-eyebrow">
            <span className="eyebrow-accent" />
            TRACE ANALYSIS & VERIFICATION DIFF
          </div>
          <h1 className="view-title">Side-by-Side Trace Comparison</h1>
          <p className="view-subtitle">
            Step-by-step diff between original failure and checkpoint replay branch.
          </p>
        </div>
      </div>

      {/* Comparison Delta KPI Strip */}
      <div className="comparison-kpi-strip">
        <div className="kpi-item">
          <span className="kpi-label">ORIGINAL RUN</span>
          <strong className="kpi-val text-red">{run.id}</strong>
          <span className="kpi-sub">Status: Failed (Step 4 & 5)</span>
        </div>

        <div className="kpi-divider">
          <GitCompare size={18} className="text-cyan" />
        </div>

        <div className="kpi-item">
          <span className="kpi-label">REPLAY BRANCH</span>
          <strong className="kpi-val text-emerald">{mockReplayRun.replayRunId}</strong>
          <span className="kpi-sub">Status: 100% Success</span>
        </div>

        <div className="kpi-item highlight">
          <span className="kpi-label">EFFICIENCY DELTA</span>
          <strong className="kpi-val text-emerald">{mockReplayRun.timeSaved}</strong>
          <span className="kpi-sub">{mockReplayRun.tokenDelta}</span>
        </div>

        <div className="kpi-item highlight">
          <span className="kpi-label">VERIFIED OUTCOME</span>
          <strong className="kpi-val text-emerald">Total: $32.20</strong>
          <span className="kpi-sub">{mockReplayRun.reconciliationStatus}</span>
        </div>
      </div>

      {/* Legend & Summary */}
      <div className="diff-legend-bar">
        <div className="legend-items">
          <span className="legend-item">
            <span className="swatch removed" /> Original Output (Diverged/Failed)
          </span>
          <span className="legend-item">
            <span className="swatch added" /> Corrected Replay Output
          </span>
          <span className="legend-item">
            <span className="swatch identical" /> Identical Step State
          </span>
        </div>

        <div className="diff-summary-tag">
          <Sparkles size={13} className="text-cyan" />
          <span>1 step patched · 2 downstream steps reconciled · 0 errors</span>
        </div>
      </div>

      {/* Columns Container */}
      <div className="comparison-columns-container">
        {/* Left: Original Run */}
        <div className="comparison-column original-col">
          <div className="col-header">
            <div className="col-title-group">
              <div className="col-badge original-badge">
                <XCircle size={14} />
                <span>ORIGINAL RUN</span>
              </div>
              <h3 className="col-run-id">{run.id}</h3>
            </div>
            <div className="col-meta">
              <span>{run.duration}</span>
              <span>·</span>
              <span>{run.tokens} tokens</span>
            </div>
          </div>

          <div className="comparison-steps-list">
            {originalSteps.map((step, idx) => {
              const isChanged = idx >= 2
              return (
                <div
                  key={step.id}
                  className={`compare-step-card ${step.status} ${isChanged ? 'has-divergence' : ''}`}
                >
                  <div className="step-row-top">
                    <div className="step-tag-col">
                      <span className="step-idx">0{step.stepNumber}</span>
                      <strong className="step-title">{step.title}</strong>
                    </div>

                    <div className="step-meta-col">
                      <span className="step-tool-badge">
                        <Terminal size={11} />
                        <code>{step.tool}</code>
                      </span>
                      <span className="step-time">
                        <Clock size={11} />
                        {step.duration}
                      </span>
                      <span className={`status-icon-pill ${step.status}`}>
                        {step.status === 'success' ? (
                          <Check size={11} />
                        ) : step.status === 'suspicious' ? (
                          <AlertTriangle size={11} />
                        ) : (
                          <X size={11} />
                        )}
                        <span>{step.status}</span>
                      </span>
                    </div>
                  </div>

                  <div className="step-output-box">
                    <span className="output-kicker">Captured Output:</span>
                    <pre className={`output-text ${isChanged ? 'diff-removed-text' : ''}`}>
                      {step.output}
                    </pre>
                  </div>

                  {idx === 2 && (
                    <div className="divergence-point-callout">
                      <ArrowRight size={13} />
                      <span>Fault Injected Here: Inconsistent denominator generated</span>
                    </div>
                  )}

                  {idx === 3 && step.status === 'failed' && (
                    <div className="error-badge-strip">
                      <X size={13} />
                      <span>AssertionError: Unreconciled balance discrepancy</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="col-final-outcome failed-outcome">
            <span className="outcome-label">FINAL OUTCOME</span>
            <div className="outcome-content">
              <XCircle size={16} className="text-red" />
              <strong>Generation Halted · Unreconciled Financial Discrepancy</strong>
            </div>
          </div>
        </div>

        {/* Right: Replayed Run */}
        <div className="comparison-column replay-col">
          <div className="col-header">
            <div className="col-title-group">
              <div className="col-badge replay-badge">
                <CheckCircle2 size={14} />
                <span>REPLAY BRANCH</span>
              </div>
              <h3 className="col-run-id">{mockReplayRun.replayRunId}</h3>
            </div>
            <div className="col-meta">
              <span>{mockReplayRun.replayDuration}</span>
              <span>·</span>
              <span>{mockReplayRun.replayTokens} tokens</span>
            </div>
          </div>

          <div className="comparison-steps-list">
            {replaySteps.map((step, idx) => {
              const isChanged = idx >= 2
              return (
                <div
                  key={step.id}
                  className={`compare-step-card ${step.status} ${isChanged ? 'is-patched-step' : ''}`}
                >
                  <div className="step-row-top">
                    <div className="step-tag-col">
                      <span className="step-idx">0{step.stepNumber}</span>
                      <strong className="step-title">{step.title}</strong>
                    </div>

                    <div className="step-meta-col">
                      <span className="step-tool-badge">
                        <Terminal size={11} />
                        <code>{step.tool}</code>
                      </span>
                      <span className="step-time">
                        <Clock size={11} />
                        {step.duration}
                      </span>
                      <span className="status-icon-pill success">
                        <Check size={11} />
                        <span>passed</span>
                      </span>
                    </div>
                  </div>

                  <div className="step-output-box">
                    <span className="output-kicker">Replay Output:</span>
                    <pre className={`output-text ${isChanged ? 'diff-added-text' : ''}`}>
                      {step.output}
                    </pre>
                  </div>

                  {idx === 2 && (
                    <div className="rectified-point-callout">
                      <Check size={13} />
                      <span>Rectified State: 20% discount formula corrected ($34 * 0.20 = $6.80)</span>
                    </div>
                  )}

                  {idx === 3 && (
                    <div className="rectified-point-callout downstream">
                      <Check size={13} />
                      <span>Downstream Succeeded: Delivery fee (+$5.00) successfully added to $27.20</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="col-final-outcome success-outcome">
            <span className="outcome-label">FINAL OUTCOME</span>
            <div className="outcome-content">
              <CheckCircle2 size={16} className="text-emerald" />
              <strong>Receipt Confirmed · Final Total $32.20 Correctly Charged</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
