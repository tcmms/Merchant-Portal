import { useState, useMemo } from 'react'
import { Modal, Button } from '@tcmms/flock-ds'
import { FileSpreadsheet, CheckCircle2, XCircle, X, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface BulkUpdateModalProps {
  open: boolean
  onClose: () => void
}

interface BulkRow {
  sku: string
  current: string
  newValue: string
  reason: string
  valid: boolean
}

const REASONS_VALID = ['Stock adjustment', 'Restock', 'Price update', 'Markdown', 'No change']
const REASONS_ERROR = ['Negative quantity', 'Invalid format', 'Empty value', 'Duplicate SKU', 'Out of range']

function generateMockRows(): BulkRow[] {
  const rows: BulkRow[] = []
  for (let i = 0; i < 500; i++) {
    const isError = i % 6 === 0 // ~83 errors out of 500
    const sku = `SKU-${(1000 + i).toString()}`
    const current = String(Math.floor(Math.random() * 200))
    rows.push({
      sku,
      current,
      newValue: isError
        ? ['invalid', '-5', '', 'N/A', 'abc'][i % 5]
        : String(Math.floor(Math.random() * 200)),
      reason: isError
        ? REASONS_ERROR[i % REASONS_ERROR.length]
        : REASONS_VALID[i % REASONS_VALID.length],
      valid: !isError,
    })
  }
  return rows
}

const MOCK_ROWS = generateMockRows()
const PAGE_SIZE = 20

type SortField = 'sku' | 'current' | 'newValue' | 'reason' | 'result'
type SortDir = 'asc' | 'desc'

function sortRows(rows: BulkRow[], field: SortField, dir: SortDir): BulkRow[] {
  return [...rows].sort((a, b) => {
    let cmp = 0
    switch (field) {
      case 'result':
        cmp = (a.valid === b.valid) ? 0 : a.valid ? 1 : -1
        break
      case 'sku':
        cmp = a.sku.localeCompare(b.sku)
        break
      case 'current':
        cmp = parseFloat(a.current) - parseFloat(b.current)
        if (isNaN(cmp)) cmp = a.current.localeCompare(b.current)
        break
      case 'newValue':
        cmp = a.newValue.localeCompare(b.newValue)
        break
      case 'reason':
        cmp = a.reason.localeCompare(b.reason)
        break
    }
    return dir === 'asc' ? cmp : -cmp
  })
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)
  const pages: (number | 'ellipsis')[] = [0]
  if (current > 2) pages.push('ellipsis')
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 3) pages.push('ellipsis')
  pages.push(total - 1)
  return pages
}

export function BulkUpdateModal({ open, onClose }: BulkUpdateModalProps) {
  const [page, setPage] = useState(0)
  const [sortField, setSortField] = useState<SortField>('result')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const errorCount = useMemo(() => MOCK_ROWS.filter(r => !r.valid).length, [])
  const validCount = MOCK_ROWS.length - errorCount

  const sorted = useMemo(() => sortRows(MOCK_ROWS, sortField, sortDir), [sortField, sortDir])
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const showFrom = page * PAGE_SIZE + 1
  const showTo = Math.min((page + 1) * PAGE_SIZE, sorted.length)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setPage(0)
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={820}
      closeIcon={<X size={16} style={{ color: 'rgba(0,0,0,0.45)' }} />}
      centered
      destroyOnClose
      styles={{ body: { maxHeight: 'calc(80vh - 40px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 } }}
      style={{ maxHeight: '80vh' }}
    >
      <div className="flex flex-col" style={{ maxHeight: 'calc(80vh - 40px)', overflow: 'hidden', padding: '20px 16px 0' }}>
        {/* ── Fixed top section ── */}
        <div className="flex flex-col gap-5 shrink-0">
          {/* Title */}
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
            Bulk update via Excel
          </h2>

          {/* File bar */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-lg"
            style={{ border: '1px solid #E5E5E5', backgroundColor: '#FAFAFA' }}
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={20} style={{ color: 'rgba(0,0,0,0.45)' }} />
              <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                Order History-2026-02-24.xlsx
              </span>
            </div>
            <button
              className="text-sm font-medium"
              style={{ color: 'rgba(0,0,0,0.45)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Change file
            </button>
          </div>

          {/* Stats cards — 3 columns */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Total Rows" value={MOCK_ROWS.length} />
            <StatCard label="Valid Rows" value={validCount} color="#08AF3B" />
            <StatCard label="Errors" value={errorCount} color="#E31D1C" bgColor="#FEF2F2" />
          </div>
        </div>

        {/* ── Scrollable table ── */}
        <div
          className="flex-1 min-h-0 rounded-lg mt-5"
          style={{ border: '1px solid #E5E5E5', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          {/* Sticky header */}
          <div
            className="grid text-xs font-medium shrink-0"
            style={{
              gridTemplateColumns: '100px 80px 100px 1fr 80px',
              color: 'rgba(0,0,0,0.45)',
              padding: '10px 16px',
              borderBottom: '1px solid #E5E5E5',
              backgroundColor: '#FAFAFA',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}
          >
            <SortHeader label="SKU" field="sku" activeField={sortField} dir={sortDir} onSort={handleSort} />
            <SortHeader label="Current" field="current" activeField={sortField} dir={sortDir} onSort={handleSort} />
            <SortHeader label="New Value" field="newValue" activeField={sortField} dir={sortDir} onSort={handleSort} />
            <SortHeader label="Reason" field="reason" activeField={sortField} dir={sortDir} onSort={handleSort} />
            <SortHeader label="Result" field="result" activeField={sortField} dir={sortDir} onSort={handleSort} align="right" />
          </div>

          {/* Scrollable rows */}
          <div className="flex-1 overflow-y-auto">
            {pageRows.map(row => (
              <div
                key={row.sku}
                className="grid text-sm"
                style={{
                  gridTemplateColumns: '100px 80px 100px 1fr 80px',
                  padding: '10px 16px',
                  borderBottom: '1px solid #F0F0F0',
                  backgroundColor: row.valid ? 'white' : '#FFF5F5',
                  color: '#1A1A1A',
                }}
              >
                <span className="font-medium">{row.sku}</span>
                <span style={{ color: 'rgba(0,0,0,0.45)' }}>{row.current}</span>
                <span className="font-semibold">{row.newValue}</span>
                <span style={{ color: 'rgba(0,0,0,0.45)' }}>{row.reason}</span>
                <span className="flex items-center justify-end gap-1">
                  {row.valid ? (
                    <>
                      <CheckCircle2 size={14} style={{ color: '#08AF3B' }} />
                      <span style={{ color: '#08AF3B', fontWeight: 500 }}>Valid</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={14} style={{ color: '#E31D1C' }} />
                      <span style={{ color: '#E31D1C', fontWeight: 500 }}>Error</span>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-4 py-2 shrink-0"
              style={{ backgroundColor: '#FAFAFA', borderTop: '1px solid #E5E5E5' }}
            >
              <span className="text-xs" style={{ color: 'rgba(0,0,0,0.45)' }}>
                Showing {showFrom}–{showTo} of {sorted.length} rows
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center justify-center w-7 h-7 rounded transition-colors hover:bg-black/5 disabled:opacity-30"
                  style={{ background: 'none', border: 'none', cursor: page === 0 ? 'default' : 'pointer' }}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} style={{ color: 'rgba(0,0,0,0.65)' }} />
                </button>
                {getPageNumbers(page, totalPages).map((p, idx) =>
                  p === 'ellipsis' ? (
                    <span key={`e${idx}`} className="w-7 h-7 flex items-center justify-center text-xs" style={{ color: 'rgba(0,0,0,0.35)' }}>
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="flex items-center justify-center w-7 h-7 rounded text-xs font-medium transition-colors"
                      style={{
                        background: p === page ? '#E31D1C' : 'none',
                        color: p === page ? 'white' : 'rgba(0,0,0,0.65)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {p + 1}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="flex items-center justify-center w-7 h-7 rounded transition-colors hover:bg-black/5 disabled:opacity-30"
                  style={{ background: 'none', border: 'none', cursor: page === totalPages - 1 ? 'default' : 'pointer' }}
                  aria-label="Next page"
                >
                  <ChevronRight size={14} style={{ color: 'rgba(0,0,0,0.65)' }} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Fixed footer ── */}
        <div className="flex flex-col gap-3 shrink-0 pt-5 pb-5">
          <div className="flex gap-3">
            <Button type="default" size="large" block onClick={onClose}>
              Download errors ({errorCount} rows)
            </Button>
            <Button
              type="primary"
              size="large"
              block
              style={{ backgroundColor: '#E31D1C', borderColor: '#E31D1C' }}
            >
              Apply valid rows only
            </Button>
          </div>
          <p className="text-center text-xs" style={{ color: 'rgba(0,0,0,0.45)', margin: 0 }}>
            {validCount} products will be updated. {errorCount} rows with errors will be skipped.
          </p>
        </div>
      </div>
    </Modal>
  )
}

// ── Sort header ──

interface SortHeaderProps {
  label: string
  field: SortField
  activeField: SortField
  dir: SortDir
  onSort: (field: SortField) => void
  align?: 'left' | 'right'
}

function SortHeader({ label, field, activeField, dir, onSort, align }: SortHeaderProps) {
  const isActive = field === activeField
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-70"
      style={{
        color: isActive ? '#1A1A1A' : 'rgba(0,0,0,0.45)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      {label}
      <ChevronsUpDown
        size={12}
        style={{
          color: isActive ? '#1A1A1A' : 'rgba(0,0,0,0.25)',
          transform: isActive ? (dir === 'desc' ? 'rotate(180deg)' : 'none') : 'none',
        }}
      />
    </button>
  )
}

// ── Stat card ──

interface StatCardProps {
  label: string
  value: number
  color?: string
  bgColor?: string
}

function StatCard({ label, value, color, bgColor }: StatCardProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-3 rounded-lg"
      style={{
        border: '1px solid #E5E5E5',
        backgroundColor: bgColor ?? 'white',
      }}
    >
      <span style={{ fontSize: 24, fontWeight: 700, color: color ?? '#1A1A1A' }}>
        {value}
      </span>
      <span className="text-xs" style={{ color: color ?? 'rgba(0,0,0,0.45)' }}>
        {label}
      </span>
    </div>
  )
}
