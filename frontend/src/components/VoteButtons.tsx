import { useState, useEffect, useRef } from 'react'
import { vote as apiVote, getVotes, type VoteSummary } from '../api/votes'

interface VoteButtonsProps {
  animationId: string
  compact?: boolean
}

function ThumbUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    </svg>
  )
}

function ThumbDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
    </svg>
  )
}

export function VoteButtons({ animationId, compact = false }: VoteButtonsProps) {
  const [data, setData] = useState<VoteSummary>({ up: 0, down: 0, user_vote: null })
  const votingRef = useRef(false)

  async function load() {
    try {
      const res = await getVotes([animationId])
      if (res[animationId]) setData(res[animationId])
    } catch { /* ignore */ }
  }

  useEffect(() => { load() }, [animationId])

  async function handleVote(type: 'up' | 'down') {
    if (votingRef.current) return
    votingRef.current = true
    try {
      const apiType = data.user_vote === type ? 'none' : type
      await apiVote(animationId, apiType)
      await load()
    } catch { /* ignore */ }
    votingRef.current = false
  }

  const upActive = data.user_vote === 'up'
  const downActive = data.user_vote === 'down'

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-sm">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote('up') }}
          className={`cursor-pointer select-none rounded px-1.5 py-1 transition-opacity ${
            upActive ? 'opacity-100' : 'opacity-50 hover:opacity-80'
          }`}
          title="Upvote"
          aria-label="Upvote"
        >
          <ThumbUp className="h-4 w-4 text-green" />
        </button>
        <span className="min-w-[1.5rem] text-center text-muted">{data.up - data.down}</span>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote('down') }}
          className={`cursor-pointer select-none rounded px-1.5 py-1 transition-opacity ${
            downActive ? 'opacity-100' : 'opacity-50 hover:opacity-80'
          }`}
          title="Downvote"
          aria-label="Downvote"
        >
          <ThumbDown className="h-4 w-4 text-red" />
        </button>
      </span>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote('up') }}
        className={`cursor-pointer flex items-center gap-1.5 rounded px-2 py-1 transition-opacity ${
          upActive ? 'opacity-100' : 'opacity-50 hover:opacity-80'
        }`}
        title="Upvote"
        aria-label="Upvote"
      >
        <ThumbUp className="h-4 w-4 text-green" />
        <span className="text-sm font-medium text-green">{data.up}</span>
      </button>
      <span className="h-4 w-px bg-border" />
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote('down') }}
        className={`cursor-pointer flex items-center gap-1.5 rounded px-2 py-1 transition-opacity ${
          downActive ? 'opacity-100' : 'opacity-50 hover:opacity-80'
        }`}
        title="Downvote"
        aria-label="Downvote"
      >
        <ThumbDown className="h-4 w-4 text-red" />
        <span className="text-sm font-medium text-red">{data.down}</span>
      </button>
    </div>
  )
}
