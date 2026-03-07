import type { StatusDefinition } from './types'

interface Props {
  status: StatusDefinition
}

export function StatusBadge({ status }: Props) {
  return (
    <span
      className="rounded-md px-2 py-0.5 text-xs font-medium text-gray-900"
      style={{ backgroundColor: status.headerColor }}
    >
      {status.label}
    </span>
  )
}
