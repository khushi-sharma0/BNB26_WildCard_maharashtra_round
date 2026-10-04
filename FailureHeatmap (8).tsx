import React, { useState } from 'react'
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  BarChart2,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  CheckCircle2,
  Filter,
} from 'lucide-react'
import { mockHeatmapStages, mockHeatmapMatrix } from '../mockData'
import type { FailureHeatmapStage } from '../types'

interface FailureHeatmapProps {
  onInspectStage?: (stageName: string) => void
  onInspectAgent?: (agentName: string) => void
}

export const FailureHeatmap: React.FC<FailureHeatmapProps> = ({
  onInspectStage,
  onInspectAgent,
}) => {
  const [hoveredStage, setHoveredStage] = useState<FailureHeatmapStage | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'extraction' | 'retrieval' | 'calculation' | 'tool'>('all')

  const totalFailures = mockHeatmapStages.reduce((sum, s) => sum + s.failureCount, 0)
  const mostCommonStage = [...mockHeatmapStages].sort((a, b) => b.failureCount - a.failureCount)[0]

  const categoryBreakdown = [
    { name: 'Percentage Discount Bug', count: 48, pct: 55.2, color: '#f59e0b', tag: 'High Risk' },
    { name: 'Delivery Fee & Split Deficit', count: 18, pct: 20.7, color: '#ef4444', tag: 'Balance Deficit' },
    { name: 'Final Receipt & Rounding', count: 9, pct: 10.3, color: '#ec4899', tag: 'Guardrail' },
    { name: 'Subtotal Calculation', count: 8, pct: 9.2, color: '#8b5cf6', tag: 'Item Sum' },
    { name: 'Parse Input & Quantities', count: 4, pct: 4.6, color: '#06b6d4', tag: 'Order Format' },
  ]

  return (
    <div className="analytics-view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <div className="section-eyebrow">
            <span className="eyebrow-accent" />
            ROOT CAUSE ANALYTICS & PATTERNS
          </div>
          <h1 className="view-title">Failure Heatmap & Distribution</h1>
          <p className="view-subtitle">
            Systematic breakdown of agent pipeline drop-offs, bottleneck stages, and calculation anomaly patterns.
          </p>
        </div>

        <div className="analytics-quick-stats">
          <div className="quick-stat-box">
            <span className="stat-label">Analyzed Failures</span>
            <strong className="stat-num">{totalFailures}</strong>
            <span className="stat-sub">Across 4 active agents</span>
          </div>
          <div className="quick-stat-box highlight-amber">
            <span className="stat-label">Top Vulnerability</span>
            <strong className="stat-num">Stage 3</strong>
            <span className="stat-sub">55.2% of total failures</span>
          </div>
        </div>
      </div>

      {/* Top Banner: Most Common Failing Step */}
      <div className="most-common-banner">
        <div className="banner-icon-col">
          <div className="warning-radar">
            <AlertTriangle size={24} className="radar-icon text-amber" />
            <span className="radar-ping" />
          </div>
        </div>
        <div className="banner-content">
          <div className="banner-tag">MOST FREQUENT ROOT CAUSE STAGE</div>
          <h2 className="banner-title">{mostCommonStage.stageName}</h2>
          <p className="banner-desc">
            Responsible for <strong>{mostCommonStage.percentage}%</strong> ({mostCommonStage.failureCount} failed runs) over the last 7 days.
            Primary failure mechanism: <em>multiplying whole percentage numbers instead of fractions</em> (e.g. 34 * 20 = $680 instead of $6.80) and <em>missing delivery or tip addition</em>.
          </p>
          <div className="banner-chips">
            {mostCommonStage.commonErrors.map((err, i) => (
              <span key={i} className="error-chip">
                {err}
              </span>
            ))}
          </div>
        </div>
        <div className="banner-kpi">
          <div className="kpi-circle">
            <span className="kpi-val">{mostCommonStage.percentage}%</span>
            <span className="kpi-lbl">Total share</span>
          </div>
          <div className="kpi-trend up">
            <ArrowUpRight size={14} />
            <span>{mostCommonStage.trendChange} this week</span>
          </div>
        </div>
      </div>

      {/* Grid: Frequency by Step + Category Distribution */}
      <div className="analytics-grid-two">
        {/* Failure Frequency by Step */}
        <div className="panel frequency-panel">
          <div className="panel-top">
            <div>
              <div className="panel-eyebrow">STAGE BREAKDOWN</div>
              <h3 className="panel-title">Failure Frequency by Execution Step</h3>
            </div>
            <span className="panel-badge">7-Day Aggregation</span>
          </div>

          <div className="stage-bars-list">
            {mockHeatmapStages.map((stage) => {
              const isSelected = hoveredStage?.stageId === stage.stageId
              return (
                <div
                  key={stage.stageId}
                  className={`stage-bar-item ${isSelected ? 'is-selected' : ''}`}
                  onMouseEnter={() => setHoveredStage(stage)}
                  onMouseLeave={() => setHoveredStage(null)}
                >
                  <div className="stage-bar-meta">
                    <span className="stage-name">{stage.stageName}</span>
                    <div className="stage-metrics">
                      <span className="stage-count">{stage.failureCount} runs</span>
                      <span className="stage-pct">({stage.percentage}%)</span>
                      <span className={`trend-tag ${stage.trend}`}>
                        {stage.trend === 'up' ? (
                          <TrendingUp size={12} />
                        ) : stage.trend === 'down' ? (
                          <TrendingDown size={12} />
                        ) : (
                          <Activity size={12} />
                        )}
                        {stage.trendChange}
                      </span>
                    </div>
                  </div>

                  <div className="progress-track">
                    <div
                      className={`progress-fill ${stage.percentage > 35 ? 'fill-amber' : stage.percentage > 20 ? 'fill-red' : 'fill-cyan'}`}
                      style={{ width: `${stage.percentage * 2}%` }}
                    />
                  </div>

                  {isSelected && (
                    <div className="stage-hover-popover">
                      <div className="popover-row">
                        <span>Avg Anomaly Risk Score:</span>
                        <strong>{stage.avgAnomalyScore}/100</strong>
                      </div>
                      <div className="popover-row">
                        <span>Dominant Error:</span>
                        <em>{stage.commonErrors[0]}</em>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="panel category-panel">
          <div className="panel-top">
            <div>
              <div className="panel-eyebrow">CLASSIFICATION</div>
              <h3 className="panel-title">Failure Types Distribution</h3>
            </div>
            <span className="panel-badge">5 Classes</span>
          </div>

          {/* Visual SVG Segmented Bar Chart */}
          <div className="segmented-distribution-bar">
            {categoryBreakdown.map((cat, i) => (
              <div
                key={i}
                className="segment"
                style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                title={`${cat.name}: ${cat.pct}% (${cat.count} runs)`}
              />
            ))}
          </div>

          <div className="category-legend-list">
            {categoryBreakdown.map((cat, i) => (
              <div key={i} className="cat-legend-row">
                <div className="cat-legend-left">
                  <span className="color-swatch" style={{ backgroundColor: cat.color }} />
                  <span className="cat-name">{cat.name}</span>
                </div>
                <div className="cat-legend-right">
                  <span className="cat-count">{cat.count}</span>
                  <span className="cat-pct">{cat.pct}%</span>
                  <span className="cat-tag">{cat.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cross-Agent Heatmap Matrix */}
      <div className="panel matrix-panel">
        <div className="panel-top">
          <div>
            <div className="panel-eyebrow">CROSS-AGENT MATRIX</div>
            <h3 className="panel-title">Pipeline Stage Failure Concentration by Agent</h3>
          </div>
          <div className="matrix-legend">
            <span>Low</span>
            <div className="gradient-sample" />
            <span>High Intensity</span>
          </div>
        </div>

        <div className="matrix-table-wrap">
          <table className="heatmap-matrix-table">
            <thead>
              <tr>
                <th className="th-agent">AGENT</th>
                <th>PARSE INPUT</th>
                <th>SUBTOTAL</th>
                <th className="th-highlight">DISCOUNT / TIP</th>
                <th>DELIVERY / SPLIT</th>
                <th>FINAL RECEIPT</th>
                <th className="th-total">TOTAL FAILURES</th>
              </tr>
            </thead>
            <tbody>
              {mockHeatmapMatrix.map((row: any, i) => (
                <tr key={i}>
                  <td className="td-agent">
                    <strong>{row.agentName}</strong>
                  </td>
                  <td className={getCellClass(row.parse)}>{row.parse}</td>
                  <td className={getCellClass(row.subtotal)}>{row.subtotal}</td>
                  <td className={`${getCellClass(row.discount)} highlight-col`}>
                    <strong>{row.discount}</strong>
                  </td>
                  <td className={getCellClass(row.delivery)}>{row.delivery}</td>
                  <td className={getCellClass(row.receipt)}>{row.receipt}</td>
                  <td className="td-total">
                    <span className="total-pill">{row.total}</span>
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

function getCellClass(val: number): string {
  if (val >= 30) return 'heat-cell cell-crit'
  if (val >= 15) return 'heat-cell cell-high'
  if (val >= 8) return 'heat-cell cell-med'
  if (val >= 3) return 'heat-cell cell-low'
  return 'heat-cell cell-zero'
}
