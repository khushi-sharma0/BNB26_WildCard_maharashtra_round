import React from 'react'
import { AlertTriangle, Flame, Layers } from 'lucide-react'
import { mockHeatmapMatrix, mockHeatmapStages } from '../mockData'

export function FailureHeatmap() {
  return (
    <div className="analytics-view-container">
      <div className="view-header">
        <div>
          <div className="section-eyebrow">
            <span className="eyebrow-accent" />
            TELEMETRY ANALYTICS
          </div>
          <h1 className="view-title">Failure Stage Heatmap</h1>
          <p className="view-subtitle">
            Aggregate failure frequencies and anomaly scores mapped across agent execution pipeline stages.
          </p>
        </div>
      </div>

      <div className="panel heatmap-stage-cards-grid mb-6">
        <div className="panel-top">
          <h3 className="panel-title">Pipeline Stage Breakdown</h3>
        </div>
        <div className="stage-cards-container">
          {mockHeatmapStages.map((stage) => (
            <div key={stage.stageId} className="stage-card">
              <div className="stage-card-top">
                <span className="stage-name">{stage.stageName}</span>
                <span className={`trend-badge ${stage.trend}`}>
                  {stage.trendChange}
                </span>
              </div>
              <div className="stage-metrics">
                <strong className="stage-count">{stage.failureCount} failures</strong>
                <span className="stage-pct">({stage.percentage}%)</span>
              </div>
              <div className="stage-bar-track">
                <div
                  className="stage-bar-fill"
                  style={{ width: `${Math.min(100, stage.percentage * 1.5)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel heatmap-matrix-panel">
        <div className="panel-top">
          <h3 className="panel-title">Agent vs Stage Failure Matrix</h3>
        </div>
        <div className="table-responsive">
          <table className="blackbox-table heatmap-table">
            <thead>
              <tr>
                <th>AGENT NAME</th>
                <th>PARSE</th>
                <th>SUBTOTAL</th>
                <th>DISCOUNT / TIP</th>
                <th>DELIVERY / SPLIT</th>
                <th>RECEIPT</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {mockHeatmapMatrix.map((row, idx) => (
                <tr key={idx}>
                  <td className="font-medium">{row.agentName}</td>
                  <td><span className="heatmap-cell low">{row.parse}</span></td>
                  <td><span className="heatmap-cell low">{row.subtotal}</span></td>
                  <td><span className="heatmap-cell high">{row.discount}</span></td>
                  <td><span className="heatmap-cell med">{row.delivery}</span></td>
                  <td><span className="heatmap-cell low">{row.receipt}</span></td>
                  <td><strong>{row.total}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
