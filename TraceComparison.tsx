import React from 'react'
import { ArrowLeft, CheckCircle2, GitCompare, Play, Sparkles, XCircle } from 'lucide-react'
import type { Run } from '../types'
import { mockReplayRun } from '../mockData'

interface TraceComparisonProps {
  run: Run
  onBackToTrace: () => void
  onReplayAgain: () => void
}

export function TraceComparison({
  run,
  onBackToTrace,
  onReplayAgain,
}: TraceComparisonProps) {
  return (
    <div className="trace-comparison-container">
      <div className="view-header">
        <div className="header-left-row">
          <button className="button-secondary micro mr-3" onClick={onBackToTrace}>
            <ArrowLeft size={14} />
            <span>Back to Trace</span>
          </button>
          <div>
            <div className="section-eyebrow">
              <span className="eyebrow-accent" />
              SIDE-BY-SIDE TRACE DIFF
            </div>
            <h1 className="view-title">Original vs Replayed Trace Comparison</h1>
          </div>
        </div>

        <div className="header-actions">
          <button className="button-primary" onClick={onReplayAgain}>
            <Play size={13} fill="currentColor" />
            <span>Replay Again</span>
          </button>
        </div>
      </div>

      <div className="comparison-banner">
        <CheckCircle2 size={18} className="text-emerald" />
        <div>
          <strong>Replay Simulation Verified Successful</strong>
          <p>
            Replayed execution saved {mockReplayRun.timeSaved} and reduced token consumption by{' '}
            {mockReplayRun.tokenDelta}.
          </p>
        </div>
      </div>

      <div className="diff-columns-grid">
        {/* Left Column: Original Failed Trace */}
        <div className="panel diff-column original">
          <div className="panel-top">
            <div>
              <span className="diff-tag failed">ORIGINAL FAILED TRACE</span>
              <h3 className="panel-title">{run.id}</h3>
            </div>
            <span className="font-mono text-muted">{run.duration}</span>
          </div>

          <div className="diff-steps-list">
            {run.steps.map((step) => (
              <div key={step.id} className={`diff-step-card ${step.status}`}>
                <div className="diff-step-head">
                  <span>Step 0{step.stepNumber}: {step.title}</span>
                  <span className="status-badge">{step.status}</span>
                </div>
                <pre className="diff-code">{step.output}</pre>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Replayed Corrected Trace */}
        <div className="panel diff-column replayed">
          <div className="panel-top">
            <div>
              <span className="diff-tag success">REPLAYED CORRECTED TRACE</span>
              <h3 className="panel-title">{mockReplayRun.replayRunId}</h3>
            </div>
            <span className="font-mono text-emerald">{mockReplayRun.replayDuration}</span>
          </div>

          <div className="diff-steps-list">
            {mockReplayRun.replaySteps.map((step) => (
              <div
                key={step.id}
                className={`diff-step-card ${step.status} ${step.diffChanged ? 'patched' : ''}`}
              >
                <div className="diff-step-head">
                  <span>Step 0{step.stepNumber}: {step.title}</span>
                  <span className="status-badge">{step.status}</span>
                </div>
                <pre className="diff-code">{step.output}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
