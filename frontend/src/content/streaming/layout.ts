import type { ColumnDefinition, StatusDefinition } from '../../engine/types'
import { statusColors } from './colors'

export const streamingColumns: ColumnDefinition[] = [
  { id: 'code', title: 'Python Execution', hasCodePanel: true, hasOutputPanel: true },
  { id: 'generator', title: 'Generator State' },
  { id: 'memory', title: 'Memory / Buffer' },
]

export const streamingStatuses: StatusDefinition[] = [
  { id: 'ready', label: 'Ready', ...statusColors.ready },
  { id: 'running', label: 'Running', ...statusColors.running },
  { id: 'yielding', label: 'Yielding', ...statusColors.yielding },
  { id: 'suspended', label: 'Suspended', ...statusColors.suspended },
  { id: 'complete', label: 'Complete', ...statusColors.complete },
  { id: 'exhausted', label: 'Exhausted', ...statusColors.exhausted },
  { id: 'buffered', label: 'Buffered', ...statusColors.buffered },
]
