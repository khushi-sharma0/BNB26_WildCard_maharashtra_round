import React from 'react'
import { Activity, Radio, Search, Sparkles } from 'lucide-react'
import type { View, Run } from '../types'

interface NavbarProps {
  currentView: View
  selectedRun?: Run
  isDemoActive: boolean
  onToggleDemo: () => void
  searchQuery: string
  onSearchChange: (search: string) => void
  onShowToast: (msg: string) => void
}

export function Navbar({
  currentView,
  selectedRun,
  isDemoActive,
  onToggleDemo,
  searchQuery,
  onSearchChange,
  onShowToast,
}: NavbarProps) {
  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <div className="brand-logo">
          <Activity className="brand-icon text-cyan" size={22} />
          <span className="brand-name">BLACKBOX</span>
          <span className="brand-badge">TELEMETRY</span>
        </div>
      </div>

      <div className="navbar-center">
        <div className="search-bar-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search traces, agent IDs, tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="navbar-right">
        <button
          className={`demo-btn ${isDemoActive ? 'active' : ''}`}
          onClick={onToggleDemo}
        >
          <Sparkles size={14} />
          <span>{isDemoActive ? 'Exit Demo' : 'Interactive Demo'}</span>
        </button>

        <div className="live-indicator">
          <span className="live-dot pulse" />
          <span>Cluster Live</span>
        </div>
      </div>
    </header>
  )
}
