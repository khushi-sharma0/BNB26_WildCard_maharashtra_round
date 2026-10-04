import React, { useState } from 'react'
import {
  FlaskConical,
  Bug,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  GitCompare,
  Check,
  X,
} from 'lucide-react'
import type { Run } from '../types'

interface InteractiveErrorPlaygroundProps {
  onSelectRun: (runId: string) => void
  onOpenReplayModal: () => void
  onOpenComparison: () => void
}

export const InteractiveErrorPlayground: React.FC<InteractiveErrorPlaygroundProps> = ({
  onSelectRun,
  onOpenReplayModal,
  onOpenComparison,
}) => {
  const [selectedTaskKey, setSelectedTaskKey] = useState<'pizza' | 'dinner' | 'temp' | 'grades'>('pizza')
  const [errorMode, setErrorMode] = useState<'buggy' | 'custom' | 'clean'>('buggy')
  const [customDiscount, setCustomDiscount] = useState<string>('500')
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'halted' | 'replaying' | 'fixed'>('idle')
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)

  const tasks = {
    pizza: {
      runId: 'RUN-101',
      title: '🍕 2 Pizzas ($15 each) + 1 Soda ($4) with 20% coupon & $5 delivery',
      subtotal: '$34.00',
      step3Name: 'Apply 20% Discount Coupon',
      buggyOutput: 'Discount = 34 * 20 = $680.00 | Resulting Subtotal: -$646.00 (ILLEGAL NEGATIVE)',
      cleanOutput: 'Discount = 34 * 0.20 = $6.80 | Discounted Subtotal: $27.20',
      finalCorrect: '$32.20 ($27.20 + $5 delivery)',
      explanation: 'Multiplied by 20 instead of 0.20, creating an impossible $680 discount on a $34 order.',
    },
    dinner: {
      runId: 'RUN-102',
      title: '💵 Split $100 dinner bill among 4 friends with 15% tip',
      subtotal: '$100.00',
      step3Name: 'Split Total Among 4 People',
      buggyOutput: 'Divided $100 / 4 = $25.00 per person (Forgot $15.00 tip! $15 deficit)',
      cleanOutput: 'Total with tip: $115.00 / 4 = $28.75 per person',
      finalCorrect: '$28.75 each (Full $115 covered)',
      explanation: 'Divided the pre-tip bill ($100) instead of the $115 total, shortchanging the tip.',
    },
    temp: {
      runId: 'RUN-103',
      title: '🌡️ Convert human body temperature 98.6°F to Celsius',
      subtotal: '98.6°F',
      step3Name: 'Apply Conversion Formula',
      buggyOutput: 'Formula: (98.6 * 9/5) + 32 = 209.48°C (Lethal boiling temperature!)',
      cleanOutput: 'Formula: (98.6 - 32) * 5/9 = 37.0°C (Normal Human Body Temp)',
      finalCorrect: '37.0°C (Normal Body Temp)',
      explanation: 'Inverted formula produced 209.48°C (above water boiling point), tripping medical guards.',
    },
    grades: {
      runId: 'RUN-104',
      title: '🎓 Average exam scores [85, 90, 95] for final grade',
      subtotal: '270 total points',
      step3Name: 'Divide Sum by Exam Count',
      buggyOutput: 'Average = 270 / 4 = 67.5% -> Assigned Grade: D (FAIL)',
      cleanOutput: 'Average = 270 / 3 = 90.0% -> Assigned Grade: A (PASS)',
      finalCorrect: '90.0% (Grade A - Passed)',
      explanation: 'Divided by 4 instead of 3, falsely failing an honor-roll student.',
    },
  }

  const activeTask = tasks[selectedTaskKey]

  const handleRunProcess = () => {
    setSimulationState('running')
    setCurrentStepIndex(1)

    // Simulate Step 1
    setTimeout(() => {
      setCurrentStepIndex(2)

      // Simulate Step 2
      setTimeout(() => {
        if (errorMode === 'clean') {
          // All steps pass cleanly
          setCurrentStepIndex(3)
          setTimeout(() => {
            setCurrentStepIndex(4)
            setTimeout(() => {
              setCurrentStepIndex(5)
              setSimulationState('fixed')
            }, 500)
          }, 500)
        } else {
          // Stops at Step 3 with error!
          setCurrentStepIndex(3)
          setSimulationState('halted')
          onSelectRun(activeTask.runId)
        }
      }, 700)
    }, 700)
  }

  const handleFixAndReplay = () => {
    setSimulationState('replaying')
    setTimeout(() => {
      setCurrentStepIndex(3)
      setTimeout(() => {
        setCurrentStepIndex(4)
        setTimeout(() => {
          setCurrentStepIndex(5)
          setSimulationState('fixed')
        }, 600)
      }, 600)
    }, 600)
  }

  return (
    <div className="error-lab-container">
      <div className="error-lab-header">
        <div className="lab-title-badge">
          <FlaskConical size={15} className="text-cyan" />
          <span>LIVE ERROR INJECTION EXPERIMENT</span>
        </div>
        <p className="lab-subtitle">
          Pick a simple everyday task, deliberately inject a calculation bug into a step, watch the agent fail and halt, then run it again correctly to get the right output.
        </p>
      </div>

      <div className="lab-controls-grid">
        {/* Task Choice */}
        <div className="lab-control-group">
          <label className="lab-label">1. Choose Simple Task:</label>
          <div className="lab-buttons-row">
            {(['pizza', 'dinner', 'temp', 'grades'] as const).map((key) => (
              <button
                key={key}
                className={`lab-pill-btn ${selectedTaskKey === key ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTaskKey(key)
                  setSimulationState('idle')
                  onSelectRun(tasks[key].runId)
                }}
              >
                {key === 'pizza' && '🍕 Pizza Order'}
                {key === 'dinner' && '💵 Dinner Split'}
                {key === 'temp' && '🌡️ Temperature'}
                {key === 'grades' && '🎓 Exam Grades'}
              </button>
            ))}
          </div>
          <div className="lab-task-preview">
            <strong>Task:</strong> {activeTask.title}
          </div>
        </div>

        {/* Error Injection Choice */}
        <div className="lab-control-group">
          <label className="lab-label">2. Deliberately Inject Error at Step 3:</label>
          <div className="lab-buttons-row">
            <button
              className={`lab-pill-btn error-btn ${errorMode === 'buggy' ? 'active' : ''}`}
              onClick={() => {
                setErrorMode('buggy')
                setSimulationState('idle')
              }}
            >
              <Bug size={13} />
              <span>Inject Deliberate Bug (Halt at Step 3)</span>
            </button>

            <button
              className={`lab-pill-btn ${errorMode === 'custom' ? 'active' : ''}`}
              onClick={() => {
                setErrorMode('custom')
                setSimulationState('idle')
              }}
            >
              <span>Custom Buggy Value</span>
            </button>

            <button
              className={`lab-pill-btn clean-btn ${errorMode === 'clean' ? 'active' : ''}`}
              onClick={() => {
                setErrorMode('clean')
                setSimulationState('idle')
              }}
            >
              <CheckCircle2 size={13} />
              <span>Clean Run (Correct Formula)</span>
            </button>
          </div>

          {errorMode === 'custom' && (
            <div className="custom-input-wrap">
              <label>Enter bad discount amount ($):</label>
              <input
                type="number"
                value={customDiscount}
                onChange={(e) => setCustomDiscount(e.target.value)}
                className="lab-input"
              />
              <span className="text-muted">(Will cause subtotal to go into negative balance)</span>
            </div>
          )}
        </div>

        {/* Action Run Button */}
        <div className="lab-action-column">
          <button
            className="button-primary lab-run-btn"
            onClick={handleRunProcess}
            disabled={simulationState === 'running' || simulationState === 'replaying'}
          >
            <Play size={14} fill="currentColor" />
            <span>
              {simulationState === 'running'
                ? 'Running Steps...'
                : simulationState === 'replaying'
                ? 'Replaying with Fix...'
                : 'Run Process Now'}
            </span>
          </button>
        </div>
      </div>

      {/* Live Stepper Execution Flow */}
      {simulationState !== 'idle' && (
        <div className="live-stepper-box">
          <div className="stepper-header">
            <span className="stepper-title">LIVE PROCESS EXECUTION FLOW</span>
            {simulationState === 'halted' && (
              <span className="status-tag status-failed">
                <AlertTriangle size={12} />
                HALTED AT STEP 03
              </span>
            )}
            {simulationState === 'fixed' && (
              <span className="status-tag status-success">
                <CheckCircle2 size={12} />
                COMPLETED WITH CORRECT OUTPUT
              </span>
            )}
          </div>

          <div className="steps-flow-row">
            <div className={`step-bubble ${currentStepIndex >= 1 ? 'passed' : ''}`}>
              <span className="bubble-num">1</span>
              <span className="bubble-text">Parse Request</span>
              {currentStepIndex >= 1 && <Check size={12} className="bubble-icon" />}
            </div>

            <div className="step-arrow">→</div>

            <div className={`step-bubble ${currentStepIndex >= 2 ? 'passed' : ''}`}>
              <span className="bubble-num">2</span>
              <span className="bubble-text">Compute Subtotal</span>
              {currentStepIndex >= 2 && <Check size={12} className="bubble-icon" />}
            </div>

            <div className="step-arrow">→</div>

            <div
              className={`step-bubble ${
                simulationState === 'halted'
                  ? 'failed'
                  : simulationState === 'fixed' || (simulationState === 'replaying' && currentStepIndex >= 3)
                  ? 'passed'
                  : currentStepIndex >= 3
                  ? 'passed'
                  : ''
              }`}
            >
              <span className="bubble-num">3</span>
              <span className="bubble-text">{activeTask.step3Name}</span>
              {simulationState === 'halted' ? (
                <X size={12} className="bubble-icon-fail" />
              ) : currentStepIndex >= 3 ? (
                <Check size={12} className="bubble-icon" />
              ) : null}
            </div>

            <div className="step-arrow">→</div>

            <div
              className={`step-bubble ${
                simulationState === 'halted'
                  ? 'blocked'
                  : simulationState === 'fixed' || currentStepIndex >= 4
                  ? 'passed'
                  : ''
              }`}
            >
              <span className="bubble-num">4</span>
              <span className="bubble-text">Downstream Step</span>
              {simulationState === 'halted' ? (
                <span className="blocked-tag">Blocked</span>
              ) : currentStepIndex >= 4 ? (
                <Check size={12} className="bubble-icon" />
              ) : null}
            </div>

            <div className="step-arrow">→</div>

            <div
              className={`step-bubble ${
                simulationState === 'halted'
                  ? 'blocked'
                  : simulationState === 'fixed' || currentStepIndex >= 5
                  ? 'passed'
                  : ''
              }`}
            >
              <span className="bubble-num">5</span>
              <span className="bubble-text">Final Receipt</span>
              {simulationState === 'halted' ? (
                <span className="blocked-tag">Blocked</span>
              ) : currentStepIndex >= 5 ? (
                <Check size={12} className="bubble-icon" />
              ) : null}
            </div>
          </div>

          {/* Outcome / Halted Banner */}
          {simulationState === 'halted' && (
            <div className="halted-alert-banner">
              <div className="alert-content">
                <AlertTriangle size={20} className="text-red" />
                <div>
                  <strong>PROCESS STOPPED AT STEP 3 DUE TO YOUR DELIBERATE ERROR!</strong>
                  <p>
                    {errorMode === 'custom'
                      ? `Custom discount of $${customDiscount} made the balance negative! Order cannot proceed.`
                      : activeTask.explanation}
                  </p>
                  <div className="bad-output-callout">
                    <span className="kicker">BUGGY OUTPUT:</span>
                    <code>
                      {errorMode === 'custom'
                        ? `Discount: $${customDiscount}.00 | Subtotal: -$${Math.abs(34 - Number(customDiscount))}.00 (ERROR)`
                        : activeTask.buggyOutput}
                    </code>
                  </div>
                </div>
              </div>

              <div className="alert-actions">
                <button className="button-primary fix-run-btn" onClick={handleFixAndReplay}>
                  <RotateCcw size={14} />
                  <span>Run Again Correctly (Fix & Replay)</span>
                </button>
              </div>
            </div>
          )}

          {/* Fixed / Correct Output Banner */}
          {simulationState === 'fixed' && (
            <div className="fixed-success-banner">
              <div className="success-content">
                <CheckCircle2 size={22} className="text-emerald" />
                <div>
                  <strong>🎉 PROCESS RAN AGAIN WITH THE FIX! CORRECT OUTPUT ACHIEVED!</strong>
                  <p>Step 3 was rectified with the formula. Downstream steps completed cleanly.</p>
                  <div className="good-output-callout">
                    <span className="kicker">CORRECT OUTPUT:</span>
                    <code>{activeTask.finalCorrect}</code>
                  </div>
                </div>
              </div>

              <div className="success-actions">
                <button className="button-secondary" onClick={onOpenComparison}>
                  <GitCompare size={14} />
                  <span>Compare Failed vs Correct Output</span>
                </button>
                <button
                  className="button-primary"
                  onClick={() => {
                    setSimulationState('idle')
                    setCurrentStepIndex(0)
                  }}
                >
                  <span>Try Another Task</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
