export const statusColors = {
  ready: { headerColor: '#4a90a4', opacity: 0.6 },
  running: { headerColor: '#4a90a4', opacity: 1 },
  yielding: { headerColor: '#9b59b6', opacity: 1 },
  suspended: { headerColor: '#c65f46', opacity: 0.5 },
  complete: { headerColor: 'seagreen', opacity: 1 },
  exhausted: { headerColor: '#7f8c8d', opacity: 0.7 },
  buffered: { headerColor: '#e67e22', opacity: 0.8 },
} as const
