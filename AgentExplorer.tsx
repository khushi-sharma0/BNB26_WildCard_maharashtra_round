import React, { useState } from 'react'
import {
  Activity,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import type { AgentInfo } from '../types'
import { mockAgents } from '../mockData'

interface AgentExplorerProps {
  onSelectAgent: (agentId: string) => void
}

export const AgentExplorer: React.FC<AgentExplorerProps> = ({ onSelectAgent }) => {
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  const filteredAgents = mockAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.role.toLowerCase().includes(search.toLowerCase()) ||
      agent.description.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || agent.category === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="agent-explorer-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <div className="section-eyebrow">
            <span className="eyebrow-accent" />
            MULTI-AGENT FLEET INVENTORY
          </div>
          <h1 className="view-title">Agent Explorer</h1>
          <p className="view-subtitle">
            Autonomous agent health, model telemetry, benchmark success rates, and active trace histories.
          </p>
        </div>

        <div className="explorer-search-bar">
          <Search size={15} className="text-muted" />
          <input
            type="text"
            placeholder="Search agents by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="agent-filter-strip">
        <div className="filter-pill-group">
          {['all', 'shopping', 'math', 'converter', 'grades'].map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${selectedFilter === cat ? 'active' : ''}`}
              onClick={() => setSelectedFilter(cat)}
            >
              {cat === 'all'
                ? `All Agents (${mockAgents.length})`
                : cat === 'shopping'
                ? 'Shopping'
                : cat === 'math'
                ? 'Bill Splitter'
                : cat === 'converter'
                ? 'Converter'
                : 'Grades'}
            </button>
          ))}
        </div>
        <div className="fleet-stat-badge">
          <span>Fleet Success Rate: <strong>90.7%</strong></span>
          <span className="badge-divider">·</span>
          <span>Active Agents: <strong>{mockAgents.length} / {mockAgents.length}</strong></span>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="agent-cards-grid">
        {filteredAgents.map((agent) => {
          const isHealthy = agent.status === 'healthy'
          const isDegraded = agent.status === 'degraded'

          return (
            <div
              key={agent.id}
              className={`agent-card ${agent.status}`}
              onClick={() => onSelectAgent(agent.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectAgent(agent.id)}
            >
              <div className="agent-card-top">
                <div className="agent-avatar-col">
                  <div className={`agent-avatar ${agent.avatarColor}`}>
                    {agent.name.charAt(0)}
                  </div>
                  <span className={`status-indicator ${agent.status}`} title={`Status: ${agent.status}`} />
                </div>

                <div className="agent-title-col">
                  <div className="agent-header-row">
                    <h3 className="agent-name">{agent.name}</h3>
                    <span className="agent-model-tag">{agent.model}</span>
                  </div>
                  <span className="agent-role">{agent.role}</span>
                </div>
              </div>

              <p className="agent-description">{agent.description}</p>

              {/* KPI Strip */}
              <div className="agent-stats-strip">
                <div className="agent-stat">
                  <span className="stat-label">TOTAL RUNS</span>
                  <strong className="stat-value">{agent.totalRuns}</strong>
                </div>

                <div className="agent-stat">
                  <span className="stat-label">SUCCESS RATE</span>
                  <strong
                    className={`stat-value ${
                      agent.successRate > 90
                        ? 'text-emerald'
                        : agent.successRate > 84
                        ? 'text-amber'
                        : 'text-red'
                    }`}
                  >
                    {agent.successRate}%
                  </strong>
                </div>

                <div className="agent-stat">
                  <span className="stat-label">AVG DURATION</span>
                  <strong className="stat-value">{agent.avgDuration}</strong>
                </div>

                <div className="agent-stat">
                  <span className="stat-label">FAILURES</span>
                  <strong className={`stat-value ${agent.failureCount > 50 ? 'text-red' : 'text-muted'}`}>
                    {agent.failureCount}
                  </strong>
                </div>
              </div>

              {/* Top failure stage notice */}
              <div className="agent-failure-stage-notice">
                <span className="notice-label">Bottleneck Stage:</span>
                <span className="notice-value">{agent.topFailureStage}</span>
              </div>

              {/* Card Footer */}
              <div className="agent-card-footer">
                <div className="recent-task-preview">
                  <span className="recent-lbl">Latest:</span>
                  <span className="recent-txt">{agent.recentTask}</span>
                </div>

                <button
                  className="inspect-agent-btn button-secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectAgent(agent.id)
                  }}
                >
                  <span>Inspect Runs</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
