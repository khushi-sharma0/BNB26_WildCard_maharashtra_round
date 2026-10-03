import React, { useState, useMemo } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Database,
  Download,
  Flame,
  FlaskConical,
  GitCompare,
  Layers,
  MoreHorizontal,
  Play,
  Radio,
  Search,
  ShieldAlert,
  Sparkles,
  Terminal,
  X,
  Zap,
} from 'lucide-react'

import type { View, Run, RunStatus, FilterState, FailureCategory } from './types'
import { mockRuns, mockAgents, mockReplayRun } from './mockData'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { DemoTourBar, demoSteps } from './components/DemoTourBar'
import { ExecutionTimeline } from './components/ExecutionTimeline'
import { FailureHeatmap } from './components/FailureHeatmap'
import { AgentExplorer } from './components/AgentExplorer'
import { ReplayModal } from './components/ReplayModal'
import { TraceComparison } from './components/TraceComparison'
import { EmptyState } from './components/EmptyState'
import { InteractiveErrorPlayground } from './components/InteractiveErrorPlayground'

import './App.css'

export function App() {
  const [view, setView] = useState<View>('dashboard')
  const [selectedRunId, setSelectedRunId] = useState<string>('RUN-101')
  const [showReplayModal, setShowReplayModal] = useState(false)
  const [hasReplayed, setHasReplayed] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Demo Mode state
  const [isDemoActive, setIsDemoActive] = useState(false)
  const [demoStepIndex, setDemoStepIndex] = useState(0)

  // Filters and Sorting
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    agentId: 'all',
    failureCategory: 'all',
    search: '',
    sortBy: 'newest',
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Active selected run
  const activeRun = useMemo(() => {
    return mockRuns.find((r) => r.id === selectedRunId) || mockRuns[0]
  }, [selectedRunId])

  // Filtered & Sorted runs list
  const filteredRuns = useMemo(() => {
    return mockRuns
      .filter((run) => {
        // Status filter
        if (filters.status !== 'all' && run.status !== filters.status) return false
        // Agent filter
        if (filters.agentId !== 'all' && run.agentId !== filters.agentId) return false
        // Failure category
        if (
          filters.failureCategory !== 'all' &&
          run.failureCategory !== filters.failureCategory
        )
          return false
        // Search query
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase()
          const matchId = run.id.toLowerCase().includes(q)
          const matchTask = run.task.toLowerCase().includes(q)
          const matchAgent = run.agentName.toLowerCase().includes(q)
          const matchModel = run.model.toLowerCase().includes(q)
          if (!matchId && !matchTask && !matchAgent && !matchModel) return false
        }
        return true
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'oldest':
            return a.id.localeCompare(b.id)
          case 'duration-desc':
            return b.durationMs - a.durationMs
          case 'tokens-desc':
            return b.tokenCount - a.tokenCount
          case 'newest':
          default:
            return b.id.localeCompare(a.id)
        }
      })
  }, [filters])

  // Navigation handlers
  const handleOpenRun = (run: Run) => {
    setSelectedRunId(run.id)
    setView('runs')
  }

  const handleSelectAgentFromExplorer = (agentId: string) => {
    setFilters((prev) => ({ ...prev, agentId }))
    setView('runs')
    const agent = mockAgents.find((a) => a.id === agentId)
    showToast(`Filtered runs for ${agent?.name || 'Agent'}`)
  }

  const handleReplayComplete = (patchedOutput: string) => {
    setShowReplayModal(false)
    setHasReplayed(true)
    showToast('Replay simulation succeeded! Opening side-by-side trace diff...')
    setView('comparison')
    if (isDemoActive) {
      setDemoStepIndex(4) // Move to step 5 (index 4)
    }
  }

  // Demo Tour Navigation
  const handleDemoStepChange = (index: number) => {
    setDemoStepIndex(index)
    const stepObj = demoSteps[index]
    if (stepObj) {
      if (stepObj.step === 1) {
        setView('dashboard')
      } else if (stepObj.step === 2) {
        setSelectedRunId('RUN-101')
        setView('runs')
      } else if (stepObj.step === 3) {
        setSelectedRunId('RUN-101')
        setView('runs')
      } else if (stepObj.step === 4) {
        setSelectedRunId('RUN-101')
        setView('runs')
        setShowReplayModal(true)
      } else if (stepObj.step === 5) {
        setHasReplayed(true)
        setView('comparison')
      }
    }
  }

  const toggleDemoMode = () => {
    if (!isDemoActive) {
      setIsDemoActive(true)
      handleDemoStepChange(0)
      showToast('Guided demo walkthrough launched.')
    } else {
      setIsDemoActive(false)
      showToast('Exited demo mode.')
    }
  }

  return (
    <div className="blackbox-shell">
      {/* Top Navbar */}
      <Navbar
        currentView={view}
        selectedRun={view === 'runs' ? activeRun : undefined}
        isDemoActive={isDemoActive}
        onToggleDemo={toggleDemoMode}
        searchQuery={filters.search}
        onSearchChange={(search) => setFilters((prev) => ({ ...prev, search }))}
        onShowToast={showToast}
      />

      {/* Guided Demo Tour Banner */}
      <DemoTourBar
        currentStepIndex={demoStepIndex}
        isActive={isDemoActive}
        onNext={() => handleDemoStepChange(Math.min(demoSteps.length - 1, demoStepIndex + 1))}
        onPrev={() => handleDemoStepChange(Math.max(0, demoStepIndex - 1))}
        onSelectStep={handleDemoStepChange}
        onClose={() => setIsDemoActive(false)}
        onOpenReplayModal={() => setShowReplayModal(true)}
      />

      <div className="shell-body">
        {/* Left Sidebar */}
        <Sidebar
          currentView={view}
          onSelectView={setView}
          onSelectAgentFilter={(agentId) => {
            setFilters((prev) => ({ ...prev, agentId }))
            if (view !== 'runs') setView('runs')
          }}
          activeAgentFilter={filters.agentId}
          totalRunsCount={mockRuns.length}
        />

        {/* Main Content Area */}
        <main className="content-container">
          {/* VIEW 1: DASHBOARD */}
          {view === 'dashboard' && (
            <DashboardView
              runs={mockRuns}
              onOpenRun={handleOpenRun}
              onGoToRuns={() => setView('runs')}
              onGoToAnalytics={() => setView('analytics')}
              onStartDemo={toggleDemoMode}
            />
          )}

          {/* VIEW 2: RUNS LIST & DETAILS */}
          {view === 'runs' && (
            <RunsView
              runs={filteredRuns}
              activeRun={activeRun}
              selectedRunId={selectedRunId}
              onSelectRun={(run) => setSelectedRunId(run.id)}
              filters={filters}
              setFilters={setFilters}
              onReplayFromStep={() => setShowReplayModal(true)}
              onResetFilters={() =>
                setFilters({
                  status: 'all',
                  agentId: 'all',
                  failureCategory: 'all',
                  search: '',
                  sortBy: 'newest',
                })
              }
              onShowToast={showToast}
              onOpenComparison={() => {
                setHasReplayed(true)
                setView('comparison')
              }}
            />
          )}

          {/* VIEW 3: AGENT EXPLORER */}
          {view === 'agents' && (
            <AgentExplorer onSelectAgent={handleSelectAgentFromExplorer} />
          )}

          {/* VIEW 4: FAILURE HEATMAP */}
          {view === 'analytics' && <FailureHeatmap />}

          {/* VIEW 5: TRACE COMPARISON */}
          {view === 'comparison' && (
            hasReplayed ? (
              <TraceComparison
                run={activeRun}
                onBackToTrace={() => setView('runs')}
                onReplayAgain={() => setShowReplayModal(true)}
              />
            ) : (
              <div className="comparison-empty-wrapper">
                <EmptyState
                  type="no-comparison"
                  onAction={() => {
                    setSelectedRunId('RUN-101')
                    setShowReplayModal(true)
                  }}
                />
              </div>
            )
          )}
        </main>
      </div>

      {/* Replay Simulation Modal */}
      {showReplayModal && (
        <ReplayModal
          run={activeRun}
          isOpen={showReplayModal}
          onClose={() => setShowReplayModal(false)}
          onReplayComplete={handleReplayComplete}
        />
      )}

      {/* Global Toast */}
      {toastMessage && (
        <div className="global-toast" role="status">
          <CheckCircle2 size={16} className="text-emerald" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------
// SUBVIEW: DASHBOARD
// ----------------------------------------------------
function DashboardView({
  runs,
  onOpenRun,
  onGoToRuns,
  onGoToAnalytics,
  onStartDemo,
}: {
  runs: Run[]
  onOpenRun: (run: Run) => void
  onGoToRuns: () => void
  onGoToAnalytics: () => void
  onStartDemo: () => void
}) {
  return (
    <div className="dashboard-content">
      {/* Heading */}
      <div className="view-header dashboard-header">
        <div>
          <div className="section-eyebrow">
            <span className="eyebrow-accent" />
            AI AGENT OBSERVABILITY CLUSTER
          </div>
          <h1 className="view-title">System Overview</h1>
          <p className="view-subtitle">
            Continuous evaluation, trace telemetry, and automated root cause analysis across your agent pipelines.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button className="button-secondary" onClick={onStartDemo}>
            <Sparkles size={14} className="text-cyan" />
            <span>Guided Demo Flow</span>
          </button>
          <button className="button-primary" onClick={() => onOpenRun(runs[0])}>
            <Radio size={14} />
            <span>Inspect Live Trace</span>
          </button>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">TOTAL MONITORED RUNS</span>
            <Activity size={17} className="text-muted" />
          </div>
          <div className="stat-value-row">
            <strong className="stat-value">1,284</strong>
            <span className="trend-badge positive">
              <ArrowUpRight size={13} />
              12.8%
            </span>
          </div>
          <div className="stat-card-bottom">
            <span>vs previous 7 days</span>
            <div className="spark-bar-preview lime">
              <span style={{ height: '40%' }} />
              <span style={{ height: '60%' }} />
              <span style={{ height: '55%' }} />
              <span style={{ height: '75%' }} />
              <span style={{ height: '90%' }} />
              <span style={{ height: '100%' }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">SUCCESSFUL OUTCOMES</span>
            <CheckCircle2 size={17} className="text-emerald" />
          </div>
          <div className="stat-value-row">
            <strong className="stat-value">1,137</strong>
            <span className="trend-badge positive">
              <ArrowUpRight size={13} />
              88.6%
            </span>
          </div>
          <div className="stat-card-bottom">
            <span>1,137 passed verifications</span>
            <div className="spark-bar-preview cyan">
              <span style={{ height: '50%' }} />
              <span style={{ height: '70%' }} />
              <span style={{ height: '80%' }} />
              <span style={{ height: '85%' }} />
              <span style={{ height: '95%' }} />
              <span style={{ height: '90%' }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">FAILED EXECUTIONS</span>
            <ShieldAlert size={17} className="text-red" />
          </div>
          <div className="stat-value-row">
            <strong className="stat-value">147</strong>
            <span className="trend-badge negative">
              <ArrowDownRight size={13} />
              11.4%
            </span>
          </div>
          <div className="stat-card-bottom">
            <span>Down 2.1% this week</span>
            <div className="spark-bar-preview red">
              <span style={{ height: '80%' }} />
              <span style={{ height: '60%' }} />
              <span style={{ height: '50%' }} />
              <span style={{ height: '40%' }} />
              <span style={{ height: '35%' }} />
              <span style={{ height: '30%' }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">AVG LATENCY / DURATION</span>
            <Clock size={17} className="text-cyan" />
          </div>
          <div className="stat-value-row">
            <strong className="stat-value">3.42s</strong>
            <span className="trend-badge positive">
              <ArrowDownRight size={13} />
              0.6s
            </span>
          </div>
          <div className="stat-card-bottom">
            <span>Faster than p95 baseline</span>
            <div className="spark-bar-preview violet">
              <span style={{ height: '60%' }} />
              <span style={{ height: '50%' }} />
              <span style={{ height: '45%' }} />
              <span style={{ height: '38%' }} />
              <span style={{ height: '32%' }} />
              <span style={{ height: '28%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Chart & Diagnosis Row */}
      <div className="dashboard-grid-two">
        {/* SVG Area Chart: Volume Trends */}
        <div className="panel chart-panel">
          <div className="panel-top">
            <div>
              <div className="panel-eyebrow">CLUSTER EXECUTION VOLUME</div>
              <h3 className="panel-title">Weekly Run Volume & Health Ratio</h3>
            </div>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-dot success" /> Successful (1,137)
              </span>
              <span className="legend-item">
                <span className="legend-dot failed" /> Failed (147)
              </span>
            </div>
          </div>

          <div className="volume-svg-container">
            <svg viewBox="0 0 500 180" className="volume-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#1f242f" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#1f242f" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#1f242f" strokeDasharray="3 3" />

              {/* Area & Line: Success */}
              <path
                d="M 20,130 Q 95,80 170,110 T 320,60 T 480,45 L 480,165 L 20,165 Z"
                fill="url(#successGrad)"
              />
              <path
                d="M 20,130 Q 95,80 170,110 T 320,60 T 480,45"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />

              {/* Area & Line: Failed */}
              <path
                d="M 20,155 Q 95,145 170,140 T 320,148 T 480,152 L 480,165 L 20,165 Z"
                fill="url(#failedGrad)"
              />
              <path
                d="M 20,155 Q 95,145 170,140 T 320,148 T 480,152"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.8"
              />
            </svg>

            <div className="chart-x-axis">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Model Diagnosis & Root Cause Callout */}
        <div className="panel diagnosis-callout-panel">
          <div className="panel-top">
            <div>
              <div className="panel-eyebrow">AUTOMATED DIAGNOSIS</div>
              <h3 className="panel-title">TraceMind Failure Intelligence</h3>
            </div>
            <button className="icon-btn-subtle" onClick={onGoToAnalytics} title="Open Heatmap">
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="diagnosis-summary-card">
            <div className="diag-score-ring">
              <span className="diag-score-num">38%</span>
              <span className="diag-score-label">Extraction Drop-off</span>
            </div>
            <div className="diag-summary-text">
              <strong>Structured Extractor Bottleneck</strong>
              <p>
                Inconsistent percentages and schema anomalies in Step 3 are the leading cause of downstream calculation halts.
              </p>
            </div>
          </div>

          <div className="mini-step-frequency-bars">
            <div className="mini-bar-col">
              <div className="bar-track">
                <div className="bar-fill" style={{ height: '22%' }} />
              </div>
              <span>Query</span>
            </div>
            <div className="mini-bar-col">
              <div className="bar-track">
                <div className="bar-fill" style={{ height: '48%' }} />
              </div>
              <span>Retrieval</span>
            </div>
            <div className="mini-bar-col highlight">
              <div className="bar-track">
                <div className="bar-fill amber" style={{ height: '88%' }} />
              </div>
              <span>Extraction</span>
            </div>
            <div className="mini-bar-col">
              <div className="bar-track">
                <div className="bar-fill" style={{ height: '34%' }} />
              </div>
              <span>Calculate</span>
            </div>
            <div className="mini-bar-col">
              <div className="bar-track">
                <div className="bar-fill" style={{ height: '18%' }} />
              </div>
              <span>Synthesize</span>
            </div>
          </div>

          <button className="full-analytics-link button-secondary" onClick={onGoToAnalytics}>
            <Flame size={14} className="text-amber" />
            <span>Open Interactive Failure Heatmap</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="panel recent-runs-panel">
        <div className="panel-top">
          <div>
            <div className="panel-eyebrow">LATEST TRACES</div>
            <h3 className="panel-title">
              Recent Agent Activity <span className="title-count">({runs.slice(0, 6).length})</span>
            </h3>
          </div>
          <button className="text-link-btn" onClick={onGoToRuns}>
            <span>View all runs</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="blackbox-table">
            <thead>
              <tr>
                <th>RUN ID</th>
                <th>TASK</th>
                <th>AGENT</th>
                <th>STATUS</th>
                <th>DURATION</th>
                <th>TOKENS</th>
                <th>TIMESTAMP</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {runs.slice(0, 6).map((run) => (
                <tr
                  key={run.id}
                  onClick={() => onOpenRun(run)}
                  className="table-clickable-row"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onOpenRun(run)}
                >
                  <td className="col-id font-mono">{run.id}</td>
                  <td className="col-task">{run.task}</td>
                  <td className="col-agent">
                    <span className="agent-badge">
                      <span className={`agent-dot ${run.agentId.replace('agent-', '')}`} />
                      {run.agentName}
                    </span>
                  </td>
                  <td className="col-status">
                    <span className={`status-pill ${run.status}`}>
                      <span className="pill-dot" />
                      {run.status === 'success' ? 'Success' : run.status === 'failed' ? 'Failed' : 'Suspicious'}
                    </span>
                  </td>
                  <td className="col-duration font-mono">{run.duration}</td>
                  <td className="col-tokens font-mono">{run.tokens}</td>
                  <td className="col-time">{run.time}</td>
                  <td className="col-action">
                    <button
                      className="icon-btn-subtle"
                      aria-label={`Inspect ${run.id}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenRun(run)
                      }}
                    >
                      <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// SUBVIEW: RUNS LIST & TRACE DETAILS
// ----------------------------------------------------
function RunsView({
  runs,
  activeRun,
  selectedRunId,
  onSelectRun,
  filters,
  setFilters,
  onReplayFromStep,
  onResetFilters,
  onShowToast,
  onOpenComparison,
}: {
  runs: Run[]
  activeRun: Run
  selectedRunId: string
  onSelectRun: (run: Run) => void
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  onReplayFromStep: () => void
  onResetFilters: () => void
  onShowToast: (msg: string) => void
  onOpenComparison: () => void
}) {
  const [showRunList, setShowRunList] = useState(true)
  const [showErrorLab, setShowErrorLab] = useState(true)
  const [activeDetailTab, setActiveDetailTab] = useState<'both' | 'timeline' | 'diagnosis'>('both')

  return (
    <div className="runs-view-container">
      {/* Filter and Search Bar */}
      <div className="runs-filter-toolbar">
        {/* Toggle Runs List Sidebar button */}
        <button
          className={`filter-btn toggle-list-btn ${showRunList ? 'active' : ''}`}
          onClick={() => setShowRunList(!showRunList)}
          title={showRunList ? 'Collapse runs list to expand trace' : 'Show runs list'}
        >
          <Layers size={13} />
          <span>{showRunList ? 'Hide Run List' : 'Show Run List'}</span>
        </button>

        {/* Toggle Error Lab button */}
        <button
          className={`filter-btn lab-toggle-btn ${showErrorLab ? 'active' : ''}`}
          onClick={() => setShowErrorLab(!showErrorLab)}
          title="Toggle Interactive Error Injection Lab"
        >
          <FlaskConical size={13} />
          <span>{showErrorLab ? 'Hide Error Lab' : '🧪 Live Error Lab'}</span>
        </button>

        {/* Status filters */}
        <div className="status-button-group">
          {(['all', 'success', 'failed', 'suspicious'] as const).map((st) => (
            <button
              key={st}
              className={`filter-btn ${filters.status === st ? 'active' : ''}`}
              onClick={() => setFilters((prev) => ({ ...prev, status: st }))}
            >
              {st === 'all'
                ? 'All Runs'
                : st === 'success'
                ? 'Successful'
                : st === 'failed'
                ? 'Failed'
                : 'Suspicious'}
            </button>
          ))}
        </div>

        {/* View Mode Tabs (Both vs Timeline vs Diagnosis) */}
        <div className="status-button-group view-mode-tabs">
          <button
            className={`filter-btn ${activeDetailTab === 'both' ? 'active' : ''}`}
            onClick={() => setActiveDetailTab('both')}
            title="Show Timeline and Diagnosis"
          >
            All Panels
          </button>
          <button
            className={`filter-btn ${activeDetailTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveDetailTab('timeline')}
            title="Focus on Execution Timeline"
          >
            Timeline Only
          </button>
          <button
            className={`filter-btn ${activeDetailTab === 'diagnosis' ? 'active' : ''}`}
            onClick={() => setActiveDetailTab('diagnosis')}
            title="Focus on Failure Diagnosis & Replay"
          >
            Diagnosis & Replay
          </button>
        </div>

        {/* Agent dropdown */}
        <div className="filter-dropdown-wrap">
          <select
            className="filter-select"
            value={filters.agentId}
            onChange={(e) => setFilters((prev) => ({ ...prev, agentId: e.target.value }))}
          >
            <option value="all">All Agents (6)</option>
            {mockAgents.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort by dropdown */}
        <div className="filter-dropdown-wrap ml-auto">
          <span className="sort-label">Sort:</span>
          <select
            className="filter-select"
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))
            }
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="duration-desc">Highest duration</option>
            <option value="tokens-desc">Most tokens</option>
          </select>
        </div>
      </div>

      {/* Interactive Deliberate Error Injection & Step Runner Playground */}
      {showErrorLab && (
        <InteractiveErrorPlayground
          onSelectRun={(runId) => {
            const matched = runs.find((r) => r.id === runId)
            if (matched) onSelectRun(matched)
          }}
          onOpenReplayModal={onReplayFromStep}
          onOpenComparison={onOpenComparison}
        />
      )}

      {/* Main Content: Split or Detail */}
      {runs.length === 0 ? (
        <EmptyState type="no-runs" onAction={onResetFilters} />
      ) : (
        <div className={`runs-layout-split ${!showRunList ? 'list-collapsed' : ''}`}>
          {/* Left: Runs selection table */}
          {showRunList && (
            <div className="runs-list-sidebar">
              <div className="list-sidebar-header">
                <span>MATCHING RUNS ({runs.length})</span>
                <button
                  className="icon-btn-micro ml-auto"
                  onClick={() => setShowRunList(false)}
                  title="Collapse sidebar"
                >
                  Hide
                </button>
              </div>

              <div className="run-cards-scroll">
                {runs.map((run) => {
                  const isSelected = run.id === selectedRunId
                  return (
                    <div
                      key={run.id}
                      className={`run-sidebar-item ${isSelected ? 'selected' : ''} ${run.status}`}
                      onClick={() => onSelectRun(run)}
                    >
                      <div className="item-top">
                        <span className="item-id font-mono">{run.id}</span>
                        <span className={`status-pill micro ${run.status}`}>
                          <span className="pill-dot" />
                          {run.status}
                        </span>
                      </div>

                      <h4 className="item-task">{run.task}</h4>

                      <div className="item-meta">
                        <span className="item-agent">{run.agentName}</span>
                        <span className="item-duration">{run.duration}</span>
                        <span className="item-time">{run.time}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Right: Full Detail Trace View */}
          <div className="run-detail-viewport">
            {/* Top Detail Header */}
            <div className="trace-detail-header">
              <div className="trace-header-left">
                <div className="section-eyebrow">
                  <span className="eyebrow-accent" />
                  TRACE INSPECTOR / {activeRun.id}
                </div>
                <div className="trace-title-row">
                  <h1 className="trace-task-heading">{activeRun.task}</h1>
                  <span className={`status-pill ${activeRun.status}`}>
                    <span className="pill-dot" />
                    {activeRun.status === 'success'
                      ? 'Success'
                      : activeRun.status === 'failed'
                      ? 'Execution Failed'
                      : 'Suspicious Anomaly'}
                  </span>
                </div>
                <div className="trace-sub-meta">
                  <span>{activeRun.agentName}</span>
                  <span className="meta-sep">·</span>
                  <span>{activeRun.date}</span>
                  <span className="meta-sep">·</span>
                  <span>Model: <strong>{activeRun.model}</strong></span>
                  <span className="meta-sep">·</span>
                  <code>{activeRun.traceId}</code>
                </div>
              </div>

              <div className="trace-header-actions">
                <button
                  className="button-secondary"
                  onClick={() => {
                    navigator.clipboard?.writeText(activeRun.id)
                    onShowToast(`Copied ${activeRun.id} to clipboard!`)
                  }}
                >
                  <Copy size={13} />
                  <span>Copy ID</span>
                </button>
                <button className="button-secondary" onClick={() => window.print()}>
                  <Download size={13} />
                  <span>Export</span>
                </button>
                {activeRun.hasCheckpoint && (
                  <button className="button-primary" onClick={onReplayFromStep}>
                    <Play size={13} fill="currentColor" />
                    <span>Replay from Step 0{activeRun.checkpointStep || 3}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Run Metrics Bar */}
            <div className="trace-metrics-strip">
              <div className="metric-box">
                <Clock size={15} className="text-cyan" />
                <div className="metric-copy">
                  <span className="metric-lbl">TOTAL DURATION</span>
                  <strong className="metric-val">{activeRun.duration}</strong>
                </div>
              </div>

              <div className="metric-box">
                <Zap size={15} className="text-amber" />
                <div className="metric-copy">
                  <span className="metric-lbl">CONSUMED TOKENS</span>
                  <strong className="metric-val">{activeRun.tokens}</strong>
                </div>
              </div>

              <div className="metric-box">
                <Layers size={15} className="text-muted" />
                <div className="metric-copy">
                  <span className="metric-lbl">STEP COUNT</span>
                  <strong className="metric-val">{activeRun.steps.length} steps</strong>
                </div>
              </div>

              <div className="metric-box">
                <ShieldAlert size={15} className={activeRun.status === 'failed' ? 'text-red' : 'text-emerald'} />
                <div className="metric-copy">
                  <span className="metric-lbl">DIAGNOSIS</span>
                  <strong className="metric-val">
                    {activeRun.status === 'failed' ? 'Root Cause Flagged' : 'All Clear'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Grid Layout: Timeline (Left) + Diagnosis & Replay Panel (Right) */}
            <div className={`trace-content-grid tab-${activeDetailTab}`}>
              {/* Left Column: Advanced Execution Timeline */}
              {(activeDetailTab === 'both' || activeDetailTab === 'timeline') && (
                <div className="timeline-column">
                  <ExecutionTimeline
                    steps={activeRun.steps}
                    run={activeRun}
                    onReplayFromStep={onReplayFromStep}
                    highlightSuspicious={true}
                  />
                </div>
              )}

              {/* Right Column: AI Root Cause Analysis & Checkpoint Replay Card */}
              {(activeDetailTab === 'both' || activeDetailTab === 'diagnosis') && (
                <div className="side-inspector-column">
                  {/* Failure Diagnosis Panel */}
                  {activeRun.failureDiagnosis ? (
                    <div className="panel failure-diagnosis-panel" id="diagnosis-panel">
                      <div className="panel-top">
                        <div className="diag-header-left">
                          <ShieldAlert size={17} className="text-red" />
                          <div>
                            <div className="panel-eyebrow">ROOT CAUSE INTELLIGENCE</div>
                            <h3 className="panel-title">Automated Failure Diagnosis</h3>
                          </div>
                        </div>
                        <span className="ai-tag">
                          <Sparkles size={11} />
                          AI Analysis
                        </span>
                      </div>

                      <div className="confidence-meter-row">
                        <div className="meter-label-row">
                          <span>Diagnostic Confidence</span>
                          <strong>{activeRun.failureDiagnosis.confidence}%</strong>
                        </div>
                        <div className="confidence-track">
                          <div
                            className="confidence-fill"
                            style={{ width: `${activeRun.failureDiagnosis.confidence}%` }}
                          />
                        </div>
                      </div>

                      {/* Suspected Step Alert */}
                      <div className="suspected-step-box">
                        <span className="suspected-idx">
                          0{activeRun.failureDiagnosis.suspectedStepNumber}
                        </span>
                        <div className="suspected-info">
                          <span className="suspected-kicker">SUSPECTED DEFECT STEP</span>
                          <strong className="suspected-name">
                            {activeRun.failureDiagnosis.suspectedStepTitle}
                          </strong>
                        </div>
                        <AlertTriangle size={16} className="text-amber ml-auto" />
                      </div>

                      {/* Root Cause explanation */}
                      <div className="root-cause-explanation">
                        <p>{activeRun.failureDiagnosis.rootCause}</p>
                      </div>

                      {/* Supporting Evidence */}
                      <div className="evidence-section">
                        <span className="evidence-title">SUPPORTING EVIDENCE</span>
                        <ul className="evidence-list">
                          {activeRun.failureDiagnosis.evidence.map((ev, i) => (
                            <li key={i} className="evidence-item">
                              <span className="evidence-bullet" />
                              <span>{ev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommended Fix */}
                      <div className="recommended-fix-box">
                        <div className="fix-header">
                          <Sparkles size={13} className="text-cyan" />
                          <span>RECOMMENDED AUTO-PATCH</span>
                        </div>
                        <p className="fix-text">{activeRun.failureDiagnosis.recommendedFix}</p>
                      </div>

                      <div className="diagnosis-footer">
                        <span>{activeRun.failureDiagnosis.analyzedBy}</span>
                        <span>Analyzed just now</span>
                      </div>
                    </div>
                  ) : (
                    <div className="panel pass-panel">
                      <div className="pass-top">
                        <CheckCircle2 size={24} className="text-emerald" />
                        <div>
                          <h3>Clean Execution</h3>
                          <p>No anomalous steps or divergence detected in this run.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Checkpoint & Replay Launcher Panel */}
                  {activeRun.hasCheckpoint && (
                    <div className="panel checkpoint-launcher-panel" id="replay-action">
                      <div className="panel-eyebrow">RECOVERY & REPLAY</div>
                      <h3 className="panel-title">Checkpoint Branching</h3>
                      <p className="panel-description">
                        State snapshot captured at Step 0{activeRun.checkpointStep || 3}. Modify the extracted payload and re-evaluate downstream execution.
                      </p>

                      <div className="snapshot-status-box">
                        <Database size={15} className="text-cyan" />
                        <div className="snapshot-meta">
                          <strong>Step 0{activeRun.checkpointStep || 3} Snapshot Ready</strong>
                          <span>Cached token context · Low cost re-run</span>
                        </div>
                        <span className="snapshot-pill">READY</span>
                      </div>

                      <button className="replay-launch-btn button-primary" onClick={onReplayFromStep}>
                        <Play size={13} fill="currentColor" />
                        <span>Replay from Step 0{activeRun.checkpointStep || 3}</span>
                        <ArrowRight size={13} />
                      </button>

                      <div className="replay-cost-footnote">
                        <span>Est. Execution Cost: <strong>~$0.0038</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
