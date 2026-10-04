import React from 'react'
import {
  Search,
  Bell,
  Sparkles,
  ChevronRight,
  CircleHelp,
  Radio,
  SlidersHorizontal,
} from 'lucide-react'
import type { View, Run } from '../types'

interface NavbarProps {
  currentView: View
  selectedRun?: Run
  isDemoActive: boolean
  onToggleDemo: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onShowToast: (msg: string) => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  selectedRun,
  isDemoActive,
  onToggleDemo,
  searchQuery,
  onSearchChange,
  onShowToast,
}) => {
  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Overview'
      case 'agents':
        return 'Agent Explorer'
      case 'runs':
        return 'Agent Runs'
      case 'analytics':
        return 'Failure Heatmap'
      case 'comparison':
        return 'Trace Comparison'
      default:
        return 'Overview'
    }
  }

  return (
    <header className="topbar-container">
      {/* Left: Breadcrumbs */}
      <div className="breadcrumb-nav">
        <span className="crumb-root">Black Box</span>
        <ChevronRight size={13} className="crumb-arrow" />
        <strong className="crumb-current">{getViewTitle()}</strong>
        {currentView === 'runs' && selectedRun && (
          <>
            <ChevronRight size={13} className="crumb-arrow" />
            <span className="crumb-id">{selectedRun.id}</span>
          </>
        )}
      </div>

      {/* Center: Search input */}
      <div className="topbar-search-box">
        <Search size={14} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Filter runs by ID, agent name, task..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <kbd className="search-kbd">⌘ K</kbd>
      </div>

      {/* Right: Actions & Demo Mode trigger */}
      <div className="topbar-actions-group">
        {/* Demo Mode Toggle */}
        <button
          className={`demo-launcher-btn ${isDemoActive ? 'active' : ''}`}
          onClick={onToggleDemo}
          title="Toggle interactive guided tour"
        >
          <Sparkles size={13} className="sparkle-icon" />
          <span>{isDemoActive ? 'Exit Demo' : 'Launch Demo Flow'}</span>
        </button>

        {/* Environment Pill */}
        <div className="env-status-pill">
          <span className="live-ping-dot" />
          <span>PRODUCTION</span>
        </div>

        {/* Notifications */}
        <button
          className="icon-btn-top"
          onClick={() => onShowToast('All 6 agent pipelines operating normally.')}
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="unread-dot" />
        </button>

        {/* Help */}
        <button
          className="icon-btn-top"
          onClick={() => onShowToast('Documentation & Tracing SDK guide opened.')}
          aria-label="Help Documentation"
        >
          <CircleHelp size={16} />
        </button>
      </div>
    </header>
  )
}
