import React, { useState } from 'react'
import {
  Check,
  AlertTriangle,
  X,
  Clock,
  Zap,
  Terminal,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
  Play,
  CheckCircle2,
} from 'lucide-react'
import type { TraceStep, Run } from '../types'

interface ExecutionTimelineProps {
  steps: TraceStep[]
  run: Run
  onReplayFromStep?: (stepNumber: number) => void
  highlightSuspicious?: boolean
}

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({
  steps,
  run,
  onReplayFromStep,
  highlightSuspicious = true,
}) => {
  // Find index of first suspicious or failed step to default expand
  const defaultExpandedIndex = steps.findIndex(
    (s) => s.status === 'suspicious' || s.status === 'failed'
  )
  const [expandedIndices, setExpandedIndices] = useState<number[]>(
    defaultExpandedIndex !== -1 ? [defaultExpandedIndex] : [0]
  )
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const toggleStep = (idx: number) => {
    setExpandedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    )
  }

  const expandAll = () => setExpandedIndices(steps.map((_, i) => i))
  const collapseAll = () => setExpandedIndices([])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="execution-timeline-card">
      <div className="timeline-header">
        <div className="timeline-title-area">
          <div className="section-eyebrow">
            <span className="eyebrow-accent" />
            INSTRUMENTED AGENT TIMELINE
          </div>
          <h2 className="timeline-title">
            Execution Flow <span className="step-counter">({steps.length} sequential steps)</span>
          </h2>
        </div>

        <div className="timeline-controls">
          <button className="text-btn" onClick={expandAll}>
            Expand all
          </button>
          <span className="control-separator">·</span>
          <button className="text-btn" onClick={collapseAll}>
            Collapse all
          </button>
        </div>
      </div>

      <div className="timeline-container">
        {steps.map((step, idx) => {
          const isExpanded = expandedIndices.includes(idx)
          const isSuspicious = step.status === 'suspicious'
          const isFailed = step.status === 'failed'
          const isSuccess = step.status === 'success'
          const isAutoHighlighted = highlightSuspicious && (isSuspicious || isFailed)

          return (
            <div
              key={step.id || idx}
              className={`timeline-item ${step.status} ${isExpanded ? 'is-expanded' : ''} ${
                isAutoHighlighted ? 'auto-highlight' : ''
              }`}
            >
              {/* Rail / Node */}
              <div className="timeline-rail">
                <div className={`timeline-node ${step.status}`}>
                  {isSuccess && <Check size={13} className="node-icon success" />}
                  {isSuspicious && <AlertTriangle size={13} className="node-icon suspicious" />}
                  {isFailed && <X size={13} className="node-icon failed" />}
                </div>
                {idx < steps.length - 1 && <div className={`timeline-connector ${step.status}`} />}
              </div>

              {/* Step Card */}
              <div className={`step-card ${step.status} ${isAutoHighlighted ? 'card-glow' : ''}`}>
                <div
                  className="step-card-header"
                  onClick={() => toggleStep(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && toggleStep(idx)}
                >
                  <div className="step-header-left">
                    <span className="step-number-tag">0{step.stepNumber}</span>
                    <h3 className="step-name">{step.title}</h3>

                    {/* Status badge */}
                    <span className={`status-pill ${step.status}`}>
                      <span className="pill-dot" />
                      {step.status === 'success'
                        ? 'Passed'
                        : step.status === 'suspicious'
                        ? 'Anomaly Flagged'
                        : 'Execution Failed'}
                    </span>

                    {isSuspicious && (
                      <span className="suspicious-attention-badge">
                        <Sparkles size={11} />
                        Needs Review
                      </span>
                    )}
                  </div>

                  <div className="step-header-right">
                    {/* Tool Badge */}
                    <span className="meta-badge tool-badge" title="Invoked Tool / Function">
                      <Terminal size={12} />
                      <code>{step.tool}</code>
                    </span>

                    {/* Duration Badge */}
                    <span className="meta-badge duration-badge" title="Execution Duration">
                      <Clock size={12} />
                      {step.duration}
                    </span>

                    {/* Token Badge */}
                    <span className="meta-badge token-badge" title="Estimated Tokens">
                      <Zap size={12} />
                      {step.tokens} tok
                    </span>

                    <button
                      className="icon-btn-toggle"
                      aria-label={isExpanded ? 'Collapse step' : 'Expand step'}
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Animated Collapsible Details */}
                {isExpanded && (
                  <div className="step-card-body">
                    {/* Warning Callout */}
                    {step.warning && (
                      <div className="warning-callout">
                        <div className="callout-header">
                          <AlertTriangle size={15} />
                          <strong>Anomaly Detected by AnomalyEngine</strong>
                          {step.anomalyScore && (
                            <span className="anomaly-score-tag">
                              Risk Score: {step.anomalyScore}/100
                            </span>
                          )}
                        </div>
                        <p className="callout-text">{step.warning}</p>
                      </div>
                    )}

                    {/* Error Detail Callout */}
                    {step.errorDetail && (
                      <div className="error-callout">
                        <div className="callout-header">
                          <ShieldAlert size={15} />
                          <strong>Downstream Execution Error</strong>
                        </div>
                        <p className="callout-text">{step.errorDetail}</p>
                      </div>
                    )}

                    <div className="io-grid">
                      {/* Input */}
                      <div className="io-box input-box">
                        <div className="io-top">
                          <span className="io-label">INPUT PAYLOAD</span>
                          <button
                            className="copy-btn"
                            onClick={() => copyToClipboard(step.input, `${step.id}-in`)}
                            title="Copy input"
                          >
                            {copiedId === `${step.id}-in` ? (
                              <CheckCircle2 size={12} className="text-emerald" />
                            ) : (
                              <Copy size={12} />
                            )}
                            <span>{copiedId === `${step.id}-in` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="io-code">{step.input}</pre>
                      </div>

                      {/* Output */}
                      <div className={`io-box output-box ${step.status}`}>
                        <div className="io-top">
                          <span className="io-label">
                            STEP OUTPUT {step.status !== 'success' && `(${step.status.toUpperCase()})`}
                          </span>
                          <button
                            className="copy-btn"
                            onClick={() => copyToClipboard(step.output, `${step.id}-out`)}
                            title="Copy output"
                          >
                            {copiedId === `${step.id}-out` ? (
                              <CheckCircle2 size={12} className="text-emerald" />
                            ) : (
                              <Copy size={12} />
                            )}
                            <span>{copiedId === `${step.id}-out` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className={`io-code ${isSuspicious ? 'suspicious-output' : ''}`}>
                          {step.output}
                        </pre>
                      </div>
                    </div>

                    {/* Step Actions footer */}
                    <div className="step-card-footer">
                      <div className="footer-meta">
                        <span>
                          <Layers size={12} /> Frame 0{step.stepNumber} of 0{steps.length}
                        </span>
                        <span>·</span>
                        <span>Captured at state snapshot</span>
                      </div>

                      {(isSuspicious || isFailed || run.hasCheckpoint) && onReplayFromStep && (
                        <button
                          className="replay-step-trigger button-secondary"
                          onClick={() => onReplayFromStep(step.stepNumber)}
                        >
                          <Play size={12} fill="currentColor" />
                          <span>Replay from step 0{step.stepNumber}</span>
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="timeline-footer-strip">
        <span className="pulse-dot" />
        <span>Full trace recorded with high-fidelity checkpointing</span>
        <span className="strip-divider">·</span>
        <span>Duration: {run.duration}</span>
        <span className="strip-divider">·</span>
        <span>Total Tokens: {run.tokens}</span>
      </div>
    </div>
  )
}
