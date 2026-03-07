export interface ColumnDefinition {
  id: string
  title: string
  hasCodePanel?: boolean
  hasOutputPanel?: boolean
}

export interface StatusDefinition {
  id: string
  label: string
  headerColor: string
  opacity: number
}

export interface CardState {
  id: string
  columnId: string
  title: string
  statusId: string
  code?: { lines: string[]; highlightLine?: string }
  hasSpinner: boolean
  glow: boolean
}

export interface OutputLine {
  id: string
  text: string
  time?: string
}

export interface AnimationState {
  codeHighlights: { lineId: string; type: 'active' | 'inactive' }[]
  outputLines: OutputLine[]
  cards: CardState[]
}

export interface Phase {
  title: string
  explanation: string
  startStep: number
  endStep: number
}

// --- Declarative step actions (JSON-serializable) ---

export type StepAction =
  | { action: 'highlightLine'; lineId: string }
  | { action: 'highlightLines'; entries: { lineId: string; type: 'active' | 'inactive' }[] }
  | { action: 'clearHighlights' }
  | { action: 'addCard'; columnId: string; id: string; title: string; statusId: string; hasSpinner?: boolean }
  | { action: 'removeCard'; cardId: string }
  | { action: 'setStatus'; cardId: string; statusId: string }
  | { action: 'setGlow'; cardId: string; glow: boolean }
  | { action: 'setSpinner'; cardId: string; hasSpinner: boolean }
  | { action: 'addOutput'; id: string; text: string; time?: string }

export interface AnimationDefinition {
  id: string
  title: string
  columns: ColumnDefinition[]
  statuses: StatusDefinition[]
  sourceCode?: string
  initialState: AnimationState
  phases: Phase[]
  steps: StepAction[][]
}

export const EMPTY_STATE: AnimationState = {
  codeHighlights: [],
  outputLines: [],
  cards: [],
}
