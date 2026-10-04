import React from 'react'
import { AlertCircle, RotateCcw, Search, Sparkles, GitCompare, FilterX } from 'lucide-react'

interface EmptyStateProps {
  type: 'no-runs' | 'no-comparison' | 'no-selection' | 'no-agents'
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'no-runs':
        return <Search className="empty-icon text-muted" size={32} />
      case 'no-comparison':
        return <GitCompare className="empty-icon text-amber" size={32} />
      case 'no-agents':
        return <FilterX className="empty-icon text-muted" size={32} />
      case 'no-selection':
      default:
        return <AlertCircle className="empty-icon text-cyan" size={32} />
    }
  }

  const getDefaultContent = () => {
    switch (type) {
      case 'no-runs':
        return {
          title: 'No matching runs found',
          description: 'Try adjusting your search criteria, clearing active status filters, or selecting a different agent.',
          actionLabel: 'Reset all filters',
        }
      case 'no-comparison':
        return {
          title: 'No comparison available yet',
          description: 'Select a failed or suspicious agent run, trigger an interactive checkpoint replay, and the side-by-side diff will populate here.',
          actionLabel: 'Inspect sample failed run (RUN-101)',
        }
      case 'no-agents':
        return {
          title: 'No agents match your criteria',
          description: 'No autonomous agents matched your current role category filter.',
          actionLabel: 'Show all agents',
        }
      case 'no-selection':
      default:
        return {
          title: 'Select a run to inspect execution trace',
          description: 'Choose any run from the table or agent explorer to visualize the step-by-step trace timeline and root cause diagnostics.',
          actionLabel: 'View latest failure',
        }
    }
  }

  const defaultContent = getDefaultContent()
  const displayTitle = title || defaultContent.title
  const displayDesc = description || defaultContent.description
  const displayAction = actionLabel || defaultContent.actionLabel

  return (
    <div className="empty-state-card">
      <div className="empty-icon-wrapper">
        {getIcon()}
        <span className="empty-glow" />
      </div>
      <h3 className="empty-title">{displayTitle}</h3>
      <p className="empty-description">{displayDesc}</p>
      {onAction && (
        <button className="empty-action-btn button-secondary" onClick={onAction}>
          <RotateCcw size={14} />
          <span>{displayAction}</span>
        </button>
      )}
    </div>
  )
}
