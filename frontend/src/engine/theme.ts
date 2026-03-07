export const theme = {
  card: {
    slideOffset: -80,
    animationDuration: 0.3,
    animationEase: 'easeOut' as const,
    fallbackHeaderColor: '#555',
    glowShadow: '0 0 8px 4px rgba(200, 200, 200, 0.3)',
  },

  codeHighlight: {
    default: 'px-1 text-gray-400' as string,
    active: 'px-1 rounded bg-[#37474f] text-blue-200 shadow-[inset_3px_0_0_0_#81d4fa]' as string,
    inactive: 'px-1 rounded bg-gray-900 text-gray-600' as string,
  },

  inlineCode: 'rounded bg-gray-800 px-1.5 py-0.5 text-[0.85em] text-blue-300',
}
