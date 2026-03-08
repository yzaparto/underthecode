const API = import.meta.env.VITE_API_URL || '/api'

export interface VoteSummary {
  up: number
  down: number
  user_vote: 'up' | 'down' | null
}

const fetchOpts: RequestInit = { credentials: 'include' }

export async function vote(
  animationId: string,
  voteType: 'up' | 'down' | 'none'
): Promise<{ ok: boolean }> {
  const res = await fetch(`${API}/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ animation_id: animationId, vote_type: voteType }),
  })
  if (!res.ok) throw new Error('Failed to vote')
  return res.json()
}

export async function getVotes(
  animationIds: string[]
): Promise<Record<string, VoteSummary>> {
  if (animationIds.length === 0) return {}
  const ids = animationIds.join(',')
  try {
    const res = await fetch(`${API}/votes?animation_ids=${encodeURIComponent(ids)}`, fetchOpts)
    if (!res.ok) return {}
    return res.json()
  } catch {
    return {}
  }
}
