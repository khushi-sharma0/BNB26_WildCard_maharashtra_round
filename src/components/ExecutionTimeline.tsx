import React, { useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Clock, Play, Terminal, XCircle } from 'lucide-react'
import type { Run, TraceStep } from '../types'

interface ExecutionTimelineProps {
  steps: TraceStep[]
  run: Run
  onReplayFromStep?: () => void
  highlightSuspicious?: boolean
}

export function ExecutionTimeline({
  steps,
  run,
  onReplayFromStep,
  highlightSuspicious,
}: ExecutionTimelineProps) {
  const [expandedStepIds, setExpandedStepIds] = useState<Record<string, boolean>>({
    [steps[0]?.id || '']: true,
  })

  const toggleStep = (id: string) => {
    setExpandedStepIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="panel timeline-panel">
      <div className="panel-top">
        <div>
          <div className="panel-eyebrow">EXECUTION TIMELINE</div>
          <h3 className="panel-title">Trace Step Sequence ({steps.length} Steps)</h3>
        </div>
      </div>

      <div className="timeline-steps-list">
        {steps.map((step) => {
          const isExpanded = !!expandedStepIds[step.id]
          const isFailed = step.status === 'failed'
          const isSuspicious = step.status === 'suspicious'

          return (
            <div
              key={step.id}
              className={`timeline-step-card ${step.status} ${isExpanded ? 'expanded' : ''}`}
            >
              <div className="step-card-header" onClick={() => toggleStep(step.id)}>
                <button className="expand-icon-btn">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                <span className="step-number-badge">0{step.stepNumber}</span>

                <div className="step-title-wrap">
                  <h4 className="step-title">{step.title}</h4>
                  <div className="step-tool-badge font-mono">
                    <Terminal size={12} />
                    <span>{step.tool}</span>
                  </div>
                </div>

                <div className="step-meta">
                  <span className="step-duration">
                    <Clock size={12} />
                    {step.duration}
                  </span>
                  <span className={`status-pill micro ${step.status}`}>
                    {isFailed ? (
                      <XCircle size={12} />
                    ) : isSuspicious ? (
                      <AlertTriangle size={12} />
                    ) : (
                      <CheckCircle2 size={12} />
                    )}
                    <span>{step.status}</span>
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="step-card-body">
                  <div className="io-block">
                    <span className="io-label">INPUT PAYLOAD</span>
                    <pre className="io-code">{step.input}</pre>
                  </div>

                  <div className="io-block mt-3">
                    <span className="io-label">OUTPUT RESULT</span>
                    <pre className={`io-code ${isFailed ? 'failed-out' : ''}`}>{step.output}</pre>
                  </div>

                  {step.warning && (
                    <div className="step-warning-box">
                      <AlertTriangle size={14} className="text-amber" />
                      <span>{step.warning}</span>
                    </div>
                  )}

                  {step.errorDetail && (
                    <div className="step-error-box">
                      <XCircle size={14} className="text-red" />
                      <span>{step.errorDetail}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
