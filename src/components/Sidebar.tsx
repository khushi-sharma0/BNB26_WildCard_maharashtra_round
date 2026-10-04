import React from 'react'
import {
  BarChart3,
  Activity,
  Layers,
  GitCompare,
  TrendingDown,
  ChevronDown,
  Sparkles,
  MoreHorizontal,
  Bot,
  Flame,
  Plus,
} from 'lucide-react'
import type { View } from '../types'
import { mockAgents } from '../mockData'

interface SidebarProps {
  currentView: View
  onSelectView: (view: View) => void
  onSelectAgentFilter: (agentId: string) => void
  activeAgentFilter: string
  totalRunsCount: number
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onSelectAgentFilter,
  activeAgentFilter,
  totalRunsCount,
}) => {
  return (
    <aside className="sidebar-container" aria-label="Main Navigation">
      {/* Brand Lockup */}
      <div className="sidebar-brand-lockup" onClick={() => onSelectView('dashboard')}>
        <div className="brand-logo-cube">
          <div className="cube-facet facet-front" />
          <div className="cube-facet facet-top" />
          <div className="cube-facet facet-side" />
        </div>
        <div className="brand-text">
          <span className="brand-title">blackbox</span>
          <span className="brand-suffix">.ai</span>
        </div>
      </div>

      {/* Workspace Switcher */}
      <div className="workspace-selector-card">
        <div className="ws-avatar">N</div>
        <div className="ws-meta">
          <span className="ws-eyebrow">WORKSPACE</span>
          <strong className="ws-name">Northstar Labs</strong>
        </div>
        <ChevronDown size={14} className="text-muted ml-auto" />
      </div>

      {/* Observability Navigation */}
      <div className="nav-group-section">
        <span className="nav-group-label">OBSERVABILITY</span>
        <nav className="nav-items-list">
          <button
            className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectView('dashboard')}
          >
            <BarChart3 size={16} />
            <span>Overview</span>
            <kbd className="nav-shortcut">⌘ 1</kbd>
          </button>

          <button
            className={`nav-button ${currentView === 'agents' ? 'active' : ''}`}
            onClick={() => onSelectView('agents')}
          >
            <Bot size={16} />
            <span>Agent Explorer</span>
            <span className="nav-badge">6</span>
          </button>

          <button
            className={`nav-button ${currentView === 'runs' ? 'active' : ''}`}
            onClick={() => onSelectView('runs')}
          >
            <Activity size={16} />
            <span>Agent Runs</span>
            <span className="nav-badge count">{totalRunsCount}</span>
          </button>

          <button
            className={`nav-button ${currentView === 'analytics' ? 'active' : ''}`}
            onClick={() => onSelectView('analytics')}
          >
            <Flame size={16} />
            <span>Failure Heatmap</span>
            <span className="nav-pill-alert">HOT</span>
          </button>

          <button
            className={`nav-button ${currentView === 'comparison' ? 'active' : ''}`}
            onClick={() => onSelectView('comparison')}
          >
            <GitCompare size={16} />
            <span>Trace Diff</span>
          </button>
        </nav>
      </div>

      {/* Monitored Agents section */}
      <div className="nav-group-section">
        <div className="nav-group-header">
          <span className="nav-group-label">MONITORED AGENTS</span>
          <button
            className="icon-btn-micro"
            onClick={() => onSelectAgentFilter('all')}
            title="Reset agent filter"
          >
            All
          </button>
        </div>

        <div className="agent-quick-list">
          {mockAgents.map((ag) => {
            const isSelected = activeAgentFilter === ag.id
            return (
              <button
                key={ag.id}
                className={`agent-quick-item ${isSelected ? 'is-selected' : ''}`}
                onClick={() => onSelectAgentFilter(ag.id)}
              >
                <span className={`agent-dot ${ag.avatarColor}`} />
                <span className="agent-quick-name">{ag.name}</span>
                <span className="agent-quick-runs">{ag.totalRuns}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer / Usage Meter */}
      <div className="sidebar-footer">
        <div className="plan-usage-box">
          <div className="usage-header">
            <span>Trace Quota</span>
            <strong>64%</strong>
          </div>
          <div className="usage-progress-bar">
            <div className="bar-fill" style={{ width: '64%' }} />
          </div>
          <div className="usage-caption">6,420 of 10,000 monthly traces</div>
        </div>

        <div className="user-profile-row">
          <div className="user-avatar">MK</div>
          <div className="user-meta">
            <strong className="user-name">Makarand K.</strong>
            <span className="user-tier">Pro Workspace</span>
          </div>
          <button className="icon-btn-subtle ml-auto" aria-label="User settings">
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
