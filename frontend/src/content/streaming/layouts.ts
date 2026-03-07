import type { ColumnDefinition, StatusDefinition } from '../../engine/types'

export const statusColors = {
  created: { headerColor: '#6b7280', opacity: 0.7 },
  running: { headerColor: '#3b82f6', opacity: 1 },
  paused: { headerColor: '#f59e0b', opacity: 1 },
  done: { headerColor: '#10b981', opacity: 1 },
  waiting: { headerColor: '#8b5cf6', opacity: 0.8 },
  receiving: { headerColor: '#06b6d4', opacity: 1 },
  value: { headerColor: '#ec4899', opacity: 1 },
} as const

export const basicsStatuses: StatusDefinition[] = [
  { id: 'created', label: '🆕 Created', ...statusColors.created },
  { id: 'running', label: '🟢 Running', ...statusColors.running },
  { id: 'paused', label: '⏸️ Paused', ...statusColors.paused },
  { id: 'done', label: '✅ Done', ...statusColors.done },
  { id: 'waiting', label: '⏳ Waiting', ...statusColors.waiting },
  { id: 'receiving', label: '📥 Receiving', ...statusColors.receiving },
  { id: 'value', label: 'Value', ...statusColors.value },
]

export const basicsColumns: ColumnDefinition[] = [
  { id: 'code', title: 'Code', hasCodePanel: true, hasOutputPanel: true },
  { id: 'viz', title: "What's Happening" },
]

export const mechanicsColumns: ColumnDefinition[] = [
  { id: 'code', title: 'Code', hasCodePanel: true, hasOutputPanel: true },
  { id: 'state', title: 'Generator State' },
  { id: 'output', title: 'Values Received' },
]

export const toolsColumns: ColumnDefinition[] = [
  { id: 'code', title: 'Code', hasCodePanel: true, hasOutputPanel: true },
  { id: 'generator', title: 'Generator' },
  { id: 'flow', title: 'Data Flow' },
]

export const pipelineColumns: ColumnDefinition[] = [
  { id: 'code', title: 'Code', hasCodePanel: true, hasOutputPanel: true },
  { id: 'pipeline', title: 'Pipeline' },
]

export const expertColumns: ColumnDefinition[] = [
  { id: 'code', title: 'Code', hasCodePanel: true, hasOutputPanel: true },
  { id: 'context', title: 'Execution Context' },
  { id: 'result', title: 'Result' },
]
