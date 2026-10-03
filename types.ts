export type View = 'dashboard' | 'runs' | 'agents' | 'analytics' | 'comparison'

export type RunStatus = 'success' | 'failed' | 'suspicious'

export type FailureCategory = 'retrieval' | 'tool' | 'calculation' | 'reasoning' | 'none'

export type StepStatus = 'success' | 'suspicious' | 'failed'

export interface TraceStep {
  id: string
  stepNumber: number
  title: string
  status: StepStatus
  duration: string
  durationMs: number
  tokens: number
  tool: string
  input: string
  output: string
  warning?: string
  errorDetail?: string
  diffChanged?: boolean
  originalOutput?: string
  anomalyScore?: number
}

export interface FailureDiagnosis {
  confidence: number
  suspectedStepNumber: number
  suspectedStepTitle: string
  failureCategory: FailureCategory
  categoryLabel: string
  rootCause: string
  evidence: string[]
  recommendedFix: string
  suggestedPatch: string
  analyzedBy: string
}

export interface Run {
  id: string
  task: string
  agentId: string
  agentName: string
  status: RunStatus
  failureCategory: FailureCategory
  duration: string
  durationMs: number
  tokens: string
  tokenCount: number
  time: string
  date: string
  model: string
  traceId: string
  steps: TraceStep[]
  failureDiagnosis?: FailureDiagnosis
  hasCheckpoint?: boolean
  checkpointStep?: number
  replayOutputPreset?: string
  replayCompleted?: boolean
  replayRunId?: string
}

export interface AgentInfo {
  id: string
  name: string
  role: string
  category: 'shopping' | 'math' | 'converter' | 'grades' | string
  avatarColor: string
  description: string
  model: string
  totalRuns: number
  successRate: number
  avgDuration: string
  failureCount: number
  topFailureStage: string
  status: 'healthy' | 'degraded' | 'warning'
  recentTask: string
}

export interface FailureHeatmapStage {
  stageId: string
  stageName: string
  failureCount: number
  percentage: number
  avgAnomalyScore: number
  trend: 'up' | 'down' | 'stable'
  trendChange: string
  commonErrors: string[]
}

export interface FilterState {
  status: 'all' | RunStatus
  agentId: 'all' | string
  failureCategory: 'all' | FailureCategory
  search: string
  sortBy: 'newest' | 'oldest' | 'duration-desc' | 'tokens-desc'
}
