import type { ColumnDefinition, StatusDefinition } from '../../engine/types'
import { statusColors } from './colors'

export const asyncioColumns: ColumnDefinition[] = [
  { id: 'code', title: 'Python Thread', hasCodePanel: true, hasOutputPanel: true },
  { id: 'loop', title: 'Event Loop' },
  { id: 'io', title: 'Background I/O' },
]

export const asyncioStatuses: StatusDefinition[] = [
  { id: 'ready', label: 'Ready', ...statusColors.ready },
  { id: 'running', label: 'Running', ...statusColors.running },
  { id: 'suspended', label: 'Suspended', ...statusColors.suspended },
  { id: 'complete', label: 'Complete', ...statusColors.complete },
  { id: 'io', label: 'IO', ...statusColors.io },
]
