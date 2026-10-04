import React from 'react'
import { Activity, Bot, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { mockAgents } from '../mockData'

interface AgentExplorerProps {
  onSelectAgent: (agentId: string) => void
}

export function AgentExplorer({ onSelectAgent }: AgentExplorerProps) {
  return (
    <div className="agent-explorer-container">
      <div className="view-header">
        <div>
          <div className="section-eyebrow">
            <span className="eyebrow-accent" />
            REGISTERED AGENTS
          </div>
          <h1 className="view-title">Agent Fleet Directory</h1>
          <p className="view-subtitle">
            Inspect operational health, success rates, and active models across all deployed agents.
          </p>
        </div>
      </div>

      <div className="agents-grid">
        {mockAgents.map((agent) => (
          <div key={agent.id} className="panel agent-card">
            <div className="agent-card-header">
              <div className="agent-avatar">
                <Bot size={20} />
              </div>
              <div className="agent-card-title-wrap">
                <h3 className="agent-card-title">{agent.name}</h3>
                <span className="agent-role">{agent.role}</span>
              </div>
              <span className={`status-pill micro ${agent.status}`}>
                {agent.status}
              </span>
            </div>

            <p className="agent-desc">{agent.description}</p>

            <div className="agent-metrics-row">
              <div className="agent-metric">
                <span className="lbl">Model</span>
                <strong className="val">{agent.model}</strong>
              </div>
              <div className="agent-metric">
                <span className="lbl">Runs</span>
                <strong className="val">{agent.totalRuns}</strong>
              </div>
              <div className="agent-metric">
                <span className="lbl">Success Rate</span>
                <strong className="val text-emerald">{agent.successRate}%</strong>
              </div>
            </div>

            <div className="agent-recent-task">
              <span className="lbl">Latest Task:</span>
              <p className="task-text">{agent.recentTask}</p>
            </div>

            <button
              className="button-secondary w-full mt-4"
              onClick={() => onSelectAgent(agent.id)}
            >
              <span>Inspect Agent Traces</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
