import { useEffect, useMemo, useState } from 'react'
import { Button, Drawer, Checkbox, InputSearch } from '@tcmms/flock-ds'
import { Pause, Play, X } from 'lucide-react'

interface BranchStatusDrawerProps {
  open: boolean
  onClose: () => void
}

type BranchStatus =
  | { kind: 'accepting' }
  | { kind: 'paused'; resumesAt: number } // epoch ms
  | { kind: 'closed' }

interface Branch {
  id: string
  name: string
  status: BranchStatus
}

const INITIAL_BRANCHES: Branch[] = [
  { id: 'b1', name: 'KFC Americana China Town', status: { kind: 'accepting' } },
  { id: 'b2', name: 'KFC Americana Boston', status: { kind: 'paused', resumesAt: Date.now() + 29 * 60_000 + 44_000 } },
  { id: 'b3', name: 'KFC Americana Brooklyn', status: { kind: 'accepting' } },
  { id: 'b4', name: 'KFC Americana Harlem', status: { kind: 'accepting' } },
  { id: 'b5', name: 'KFC Americana Manhattan', status: { kind: 'closed' } },
]

function useSecondTicker(enabled: boolean): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!enabled) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [enabled])
  return now
}

function formatRemaining(resumesAt: number, now: number): string {
  const diff = Math.max(0, resumesAt - now)
  const totalSeconds = Math.floor(diff / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s left`
}

export function BranchStatusDrawer({ open, onClose }: BranchStatusDrawerProps) {
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const now = useSecondTicker(open)

  // Auto-resume paused branches when the timer elapses so the UI stays truthful.
  useEffect(() => {
    setBranches((prev) =>
      prev.map((b) => {
        if (b.status.kind === 'paused' && b.status.resumesAt <= now) {
          return { ...b, status: { kind: 'accepting' as const } }
        }
        return b
      }),
    )
  }, [now])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return branches
    return branches.filter((b) => b.name.toLowerCase().includes(q))
  }, [branches, search])

  const selectableIds = useMemo(
    () => filtered.filter((b) => b.status.kind !== 'closed').map((b) => b.id),
    [filtered],
  )
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id))
  const someSelected = selectableIds.some((id) => selectedIds.has(id)) && !allSelected

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(selectableIds))
    }
  }

  const pauseBranch = (id: string) => {
    setBranches((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: { kind: 'paused' as const, resumesAt: Date.now() + 30 * 60_000 } }
          : b,
      ),
    )
  }
  const resumeBranch = (id: string) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: { kind: 'accepting' as const } } : b)),
    )
  }

  const handleBulkMarkBusy = () => {
    const ids = Array.from(selectedIds)
    setBranches((prev) =>
      prev.map((b) =>
        ids.includes(b.id) && b.status.kind !== 'closed'
          ? { ...b, status: { kind: 'paused' as const, resumesAt: Date.now() + 30 * 60_000 } }
          : b,
      ),
    )
    setSelectedIds(new Set())
  }

  const handleClose = () => {
    setSearch('')
    setSelectedIds(new Set())
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      placement="right"
      width={480}
      closable={false}
      title={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2"
            style={{
              width: 32,
              height: 32,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--flock-color-text)',
              outlineColor: 'var(--flock-color-primary)',
            }}
            aria-label="Close branch status"
          >
            <X size={18} />
          </button>
          <span
            style={{
              fontSize: 18,
              fontWeight: 'var(--flock-font-weight-semibold, 600)',
              color: 'var(--flock-color-text)',
            }}
          >
            Branch Status
          </span>
        </div>
      }
      styles={{
        header: {
          padding: '12px 16px',
          borderBottom: '1px solid var(--flock-color-border-secondary)',
        },
        body: { padding: 0, display: 'flex', flexDirection: 'column' },
        footer: {
          padding: '16px 24px',
          borderTop: '1px solid var(--flock-color-border-secondary)',
          background: 'white',
        },
      }}
      footer={
        <Button
          type="primary"
          size="large"
          block
          disabled={selectedIds.size === 0}
          onClick={handleBulkMarkBusy}
        >
          Mark Branches Busy
        </Button>
      }
    >
      <div style={{ padding: '16px 24px' }}>
        <InputSearch
          placeholder="Search Branch"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="large"
        />
      </div>

      <div
        className="flex items-center"
        style={{
          padding: '8px 24px',
          borderBottom: '1px solid var(--flock-color-border-secondary)',
          gap: 12,
        }}
      >
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={toggleAll}
        >
          <span style={{ fontSize: 15, fontWeight: 'var(--flock-font-weight-medium, 500)' }}>
            Select all
          </span>
        </Checkbox>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div
            className="flex items-center justify-center"
            style={{ padding: 32, color: 'var(--flock-color-text-tertiary)', fontSize: 14 }}
          >
            No branches match your search
          </div>
        ) : (
          filtered.map((branch) => (
            <BranchRow
              key={branch.id}
              branch={branch}
              now={now}
              checked={selectedIds.has(branch.id)}
              onToggle={() => toggle(branch.id)}
              onPause={() => pauseBranch(branch.id)}
              onResume={() => resumeBranch(branch.id)}
            />
          ))
        )}
      </div>
    </Drawer>
  )
}

function BranchRow({
  branch,
  now,
  checked,
  onToggle,
  onPause,
  onResume,
}: {
  branch: Branch
  now: number
  checked: boolean
  onToggle: () => void
  onPause: () => void
  onResume: () => void
}) {
  const isClosed = branch.status.kind === 'closed'
  const isPaused = branch.status.kind === 'paused'

  const statusText =
    branch.status.kind === 'accepting'
      ? 'Accepting Orders'
      : branch.status.kind === 'paused'
        ? `Orders Paused, ${formatRemaining(branch.status.resumesAt, now)}`
        : 'Closed'

  const statusColor =
    branch.status.kind === 'accepting'
      ? 'var(--flock-color-success, #08af3b)'
      : branch.status.kind === 'paused'
        ? 'var(--flock-color-error, #d90217)'
        : 'var(--flock-color-text-tertiary)'

  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--flock-color-border-secondary)',
        gap: 16,
        opacity: isClosed ? 0.6 : 1,
      }}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <span style={{ marginTop: 2, display: 'inline-flex' }}>
          <Checkbox
            checked={checked}
            onChange={onToggle}
            disabled={isClosed}
          />
        </span>
        <div className="min-w-0">
          <div
            className="truncate"
            style={{
              fontSize: 16,
              lineHeight: '24px',
              fontWeight: 'var(--flock-font-weight-semibold, 600)',
              color: 'var(--flock-color-text)',
            }}
          >
            {branch.name}
          </div>
          <div
            style={{
              fontSize: 14,
              lineHeight: '22px',
              color: statusColor,
              fontWeight: 'var(--flock-font-weight-medium, 500)',
            }}
          >
            {statusText}
          </div>
        </div>
      </div>

      {!isClosed && (
        isPaused ? (
          <Button
            size="middle"
            icon={<Play size={14} />}
            onClick={onResume}
          >
            Resume Orders
          </Button>
        ) : (
          <Button
            size="middle"
            icon={<Pause size={14} />}
            onClick={onPause}
          >
            Pause
          </Button>
        )
      )}
    </div>
  )
}
