import React from 'react'
import {
  Activity,
  BarChart3,
  Bot,
  Flame,
  GitCompare,
  Layers,
  LayoutDashboard,
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

export function Sidebar({
  currentView,
  onSelectView,
  onSelectAgentFilter,
  activeAgentFilter,
  totalRunsCount,
}: SidebarProps) {
  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { view: 'runs', label: 'Trace Inspector', icon: <Activity size={16} /> },
    { view: 'agents', label: 'Agent Directory', icon: <Bot size={16} /> },
    { view: 'analytics', label: 'Failure Heatmap', icon: <Flame size={16} /> },
    { view: 'comparison', label: 'Trace Diff', icon: <GitCompare size={16} /> },
  ]

  return (
    <aside className="sidebar-container">
      <nav className="sidebar-nav">
        <div className="nav-section-title">NAVIGATION</div>
        {navItems.map((item) => (
          <button
            key={item.view}
            className={`sidebar-link ${currentView === item.view ? 'active' : ''}`}
            onClick={() => onSelectView(item.view)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

        <div className="nav-section-title mt-4">AGENTS</div>
        <div className="agent-quick-list">
          <button
            className={`sidebar-link sub ${activeAgentFilter === 'all' ? 'active' : ''}`}
            onClick={() => onSelectAgentFilter('all')}
          >
            <Layers size={14} />
            <span>All Agents</span>
          </button>
          {mockAgents.map((agent) => (
            <button
              key={agent.id}
              className={`sidebar-link sub ${activeAgentFilter === agent.id ? 'active' : ''}`}
              onClick={() => onSelectAgentFilter(agent.id)}
            >
              <span className={`agent-dot ${agent.id.replace('agent-', '')}`} />
              <span>{agent.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </aside>
  )
}
