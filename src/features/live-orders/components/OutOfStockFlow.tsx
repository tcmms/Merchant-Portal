import { useMemo, useState } from 'react'
import { Alert, Button, Modal, Radio, RadioGroup } from '@tcmms/flock-ds'
import { toast } from '../utils/toast'
import { Minus, Package, Plus, Trash2 } from 'lucide-react'
import type { OrderItem } from '../types'

type Step = 'items' | 'duration'

type DurationOption = 'two_hours' | 'until_tomorrow' | 'indefinitely'

interface OutOfStockFlowProps {
  open: boolean
  onClose: () => void
  items: OrderItem[]
  orderNumber: string
  onSubmit?: (itemIds: string[]) => void
}

const STOCKOUT_WARNING =
  'Stockouts can only be reported once, so please ensure you have selected all the unavailable items before reporting a stockout.'

const MODAL_WIDTH = 577

export function OutOfStockFlow({ open, onClose, items, orderNumber, onSubmit }: OutOfStockFlowProps) {
  const [step, setStep] = useState<Step>('items')
  const [unavailableById, setUnavailableById] = useState<Record<string, number>>({})
  const [duration, setDuration] = useState<DurationOption | null>(null)

  const totalUnavailable = useMemo(
    () => Object.values(unavailableById).reduce((sum, n) => sum + n, 0),
    [unavailableById]
  )

  const resetAndClose = () => {
    onClose()
    setTimeout(() => {
      setStep('items')
      setUnavailableById({})
      setDuration(null)
    }, 200)
  }

  const handleChangeUnavailable = (itemId: string, delta: 1 | -1, max: number) => {
    setUnavailableById((prev) => {
      const current = prev[itemId] ?? 0
      const next = Math.max(0, Math.min(max, current + delta))
      return { ...prev, [itemId]: next }
    })
  }

  const handleNext = () => {
    if (totalUnavailable === 0) return
    setStep('duration')
  }

  const handleConfirm = () => {
    if (duration == null) return
    const affected = items.filter((item) => (unavailableById[item.id] ?? 0) > 0)
    onSubmit?.(affected.map((item) => item.id))
    toast.success(`Marked out of stock for order #${orderNumber}: ${affected.map(i => i.name).join(', ')}`)
    resetAndClose()
  }

  if (step === 'items') {
    return (
      <Modal
        open={open}
        onCancel={resetAndClose}
        title={
          <ModalHeader
            title="Select out of stock item"
            subtitle="This item will no longer be available for order"
          />
        }
        width={MODAL_WIDTH}
        destroyOnHidden
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button size="large" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              disabled={totalUnavailable === 0}
              onClick={handleNext}
            >
              Next
            </Button>
          </div>
        }
      >
        <Alert
          type="warning"
          showIcon
          message={STOCKOUT_WARNING}
          style={{ marginBottom: 16 }}
        />
        <ItemSelectionTable
          items={items}
          unavailableById={unavailableById}
          onChangeUnavailable={handleChangeUnavailable}
        />
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onCancel={resetAndClose}
      title={
        <ModalHeader
          title="Select out of stock time duration"
          subtitle="Select the time duration after which the product will be available again"
        />
      }
      width={MODAL_WIDTH}
      destroyOnHidden
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button size="large" onClick={() => setStep('items')}>
            Back
          </Button>
          <Button
            type="primary"
            size="large"
            disabled={duration == null}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </div>
      }
    >
      <Alert
        type="warning"
        showIcon
        title={STOCKOUT_WARNING}
        style={{ marginBottom: 16 }}
      />
      <DurationSelector value={duration} onChange={setDuration} />
    </Modal>
  )
}

/* ─── Sub-components ──────────────────────────────────────── */

function ModalHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ paddingRight: 24 }}>
      <div
        style={{
          fontSize: 20,
          lineHeight: '28px',
          fontWeight: 600,
          color: 'var(--flock-color-text)',
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 14,
          lineHeight: '22px',
          fontWeight: 400,
          color: 'var(--flock-color-text-tertiary)',
        }}
      >
        {subtitle}
      </div>
    </div>
  )
}

interface ItemSelectionTableProps {
  items: OrderItem[]
  unavailableById: Record<string, number>
  onChangeUnavailable: (itemId: string, delta: 1 | -1, max: number) => void
}

function ItemSelectionTable({ items, unavailableById, onChangeUnavailable }: ItemSelectionTableProps) {
  return (
    <div
      style={{
        background: 'var(--flock-color-bg-layout)',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div
        className="grid items-center"
        style={{
          gridTemplateColumns: '1fr 96px 96px',
          gap: 16,
          paddingBottom: 10,
          fontSize: 14,
          lineHeight: '22px',
          color: 'var(--flock-color-text-tertiary)',
        }}
      >
        <span>Item</span>
        <span style={{ textAlign: 'center' }}>Available</span>
        <span style={{ textAlign: 'center' }}>Unavailable</span>
      </div>

      {items.map((item) => {
        const unavailable = unavailableById[item.id] ?? 0
        const available = item.quantity - unavailable
        const canMarkUnavailable = available > 0
        const canRestore = unavailable > 0
        const isLastAvailable = available === 1
        return (
          <div
            key={item.id}
            className="grid items-center"
            style={{
              gridTemplateColumns: '1fr 96px 96px',
              gap: 16,
              paddingTop: 12,
              paddingBottom: 4,
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="rounded-lg object-cover shrink-0"
                  style={{ width: 32, height: 32 }}
                />
              ) : (
                <div
                  className="rounded-lg flex items-center justify-center shrink-0"
                  style={{ width: 32, height: 32, background: 'var(--flock-color-border-secondary)' }}
                >
                  <Package size={14} style={{ color: 'var(--flock-color-text-quaternary)' }} />
                </div>
              )}
              <span
                className="truncate"
                style={{
                  fontSize: 14,
                  lineHeight: '22px',
                  fontWeight: 600,
                  color: 'var(--flock-color-text)',
                }}
              >
                {item.name}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <CountButton
                ariaLabel={`Mark one ${item.name} as unavailable`}
                disabled={!canMarkUnavailable}
                onClick={() => onChangeUnavailable(item.id, 1, item.quantity)}
                icon={isLastAvailable ? <Trash2 size={12} /> : <Minus size={12} />}
              />
              <span
                style={{
                  minWidth: 10,
                  textAlign: 'center',
                  fontSize: 14,
                  lineHeight: '22px',
                  fontWeight: 600,
                  color: 'var(--flock-color-text)',
                }}
              >
                {available}
              </span>
              <CountButton
                ariaLabel={`Restore one ${item.name} to available`}
                disabled={!canRestore}
                onClick={() => onChangeUnavailable(item.id, -1, item.quantity)}
                icon={<Plus size={12} />}
              />
            </div>

            <span
              style={{
                textAlign: 'center',
                fontSize: 14,
                lineHeight: '22px',
                fontWeight: 600,
                color: unavailable > 0 ? 'var(--flock-color-text)' : 'var(--flock-color-text-quaternary)',
              }}
            >
              {unavailable}
            </span>
          </div>
        )
      })}
    </div>
  )
}

interface CountButtonProps {
  ariaLabel: string
  disabled?: boolean
  onClick: () => void
  icon: React.ReactNode
}

function CountButton({ ariaLabel, disabled, onClick, icon }: CountButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center justify-center transition-opacity"
      style={{
        width: 20,
        height: 20,
        borderRadius: 4,
        background: 'var(--flock-color-primary)',
        color: '#fff',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        flexShrink: 0,
      }}
    >
      {icon}
    </button>
  )
}

interface DurationSelectorProps {
  value: DurationOption | null
  onChange: (value: DurationOption) => void
}

interface DurationMeta {
  key: DurationOption
  label: string
  meaning: string
}

function buildDurationOptions(): DurationMeta[] {
  const now = new Date()
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  const tomorrow9am = new Date(now)
  tomorrow9am.setDate(tomorrow9am.getDate() + 1)
  tomorrow9am.setHours(9, 0, 0, 0)

  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  return [
    { key: 'two_hours', label: 'For the next 2 hours', meaning: `Until ${fmt(twoHoursLater)}` },
    { key: 'until_tomorrow', label: 'Until Tomorrow', meaning: `Until ${fmt(tomorrow9am)}` },
    { key: 'indefinitely', label: 'Indefinitely', meaning: 'Until manually reactivated' },
  ]
}

function DurationSelector({ value, onChange }: DurationSelectorProps) {
  const options = useMemo(buildDurationOptions, [])

  return (
    <div
      style={{
        background: 'var(--flock-color-bg-layout)',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <RadioGroup
        value={value ?? undefined}
        onChange={(e) => onChange(e.target.value as DurationOption)}
        style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}
      >
        {options.map((option, idx) => (
          <label
            key={option.key}
            className="flex items-start gap-3 cursor-pointer"
            style={{
              paddingTop: idx === 0 ? 0 : 12,
              paddingBottom: idx === options.length - 1 ? 0 : 12,
              borderBottom:
                idx === options.length - 1 ? 'none' : '1px solid var(--flock-color-split)',
            }}
          >
            <Radio value={option.key} style={{ marginTop: 3 }} />
            <div className="flex flex-col">
              <span
                style={{
                  fontSize: 16,
                  lineHeight: '24px',
                  fontWeight: 600,
                  color: 'var(--flock-color-text)',
                }}
              >
                {option.label}
              </span>
              <span
                style={{
                  fontSize: 14,
                  lineHeight: '22px',
                  color: 'var(--flock-color-text-tertiary)',
                }}
              >
                {option.meaning}
              </span>
            </div>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}
