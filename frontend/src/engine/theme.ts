import type { ThemeMode } from '../contexts/ThemeContext'

const shared = {
  card: {
    slideOffset: -80,
    animationDuration: 0.3,
    animationEase: 'easeOut' as const,
  },
}

export const themes = {
  dark: {
    ...shared,
    card: {
      ...shared.card,
      fallbackHeaderColor: '#555',
      glowShadow: '0 0 8px 4px rgba(200, 200, 200, 0.3)',
    },
    codeHighlight: {
      default: 'px-1 text-muted' as string,
      active: 'px-1 rounded bg-surface text-brand shadow-[inset_3px_0_0_0_var(--theme-brand)]' as string,
      inactive: 'px-1 rounded bg-surface-2/80 text-muted' as string,
    },
    inlineCode: 'rounded bg-surface-2 px-1.5 py-0.5 text-[0.85em] text-brand',
  },
  light: {
    ...shared,
    card: {
      ...shared.card,
      fallbackHeaderColor: '#64748b',
      glowShadow: '0 0 8px 4px rgba(8, 145, 178, 0.15)',
    },
    codeHighlight: {
      default: 'px-1 text-muted' as string,
      active: 'px-1 rounded bg-surface text-brand shadow-[inset_3px_0_0_0_var(--theme-brand)]' as string,
      inactive: 'px-1 rounded bg-surface-2/80 text-muted' as string,
    },
    inlineCode: 'rounded bg-surface-2 px-1.5 py-0.5 text-[0.85em] text-brand',
  },
} as const

export function getTheme(mode: ThemeMode) {
  return themes[mode]
}

export const theme = themes.dark
