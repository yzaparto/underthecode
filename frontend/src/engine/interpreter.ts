import type { AnimationState, StepAction } from './types'

export function applyActions(state: AnimationState, actions: StepAction[]): AnimationState {
  return actions.reduce((s, a) => applyAction(s, a), state)
}

function applyAction(state: AnimationState, action: StepAction): AnimationState {
  switch (action.action) {
    case 'highlightLine':
      return { ...state, codeHighlights: [{ lineId: action.lineId, type: 'active' }] }

    case 'highlightLines':
      return { ...state, codeHighlights: action.entries }

    case 'clearHighlights':
      return { ...state, codeHighlights: [] }

    case 'addCard':
      return {
        ...state,
        cards: [
          ...state.cards,
          {
            id: action.id,
            columnId: action.columnId,
            title: action.title,
            statusId: action.statusId,
            hasSpinner: action.hasSpinner ?? false,
            glow: false,
          },
        ],
      }

    case 'removeCard':
      return { ...state, cards: state.cards.filter((c) => c.id !== action.cardId) }

    case 'setStatus':
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.cardId ? { ...c, statusId: action.statusId } : c)),
      }

    case 'setGlow':
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.cardId ? { ...c, glow: action.glow } : c)),
      }

    case 'setSpinner':
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.cardId ? { ...c, hasSpinner: action.hasSpinner } : c,
        ),
      }

    case 'setCardCode': {
      const highlightLine =
        action.highlightLine !== undefined ? String(action.highlightLine) : undefined
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.cardId
            ? { ...c, code: { lines: action.lines, highlightLine } }
            : c,
        ),
      }
    }

    case 'setCardHighlight':
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.cardId && c.code
            ? {
                ...c,
                code: {
                  ...c.code,
                  highlightLine: action.highlightLine !== null ? String(action.highlightLine) : undefined,
                },
              }
            : c,
        ),
      }

    case 'addOutput':
      return {
        ...state,
        outputLines: [...state.outputLines, { id: action.id, text: action.text, time: action.time }],
      }
  }
}
