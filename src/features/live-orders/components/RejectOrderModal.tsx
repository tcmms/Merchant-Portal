import { useEffect, useState } from 'react'
import { Button, Modal, Radio, RadioGroup } from '@tcmms/flock-ds'

interface RejectOrderModalProps {
  open: boolean
  orderNumber?: string
  onClose: () => void
  onConfirm: (reasonKey: string, reasonLabel: string) => void
}

interface RejectReason {
  key: string
  label: string
  description: string
}

const REASONS: RejectReason[] = [
  { key: 'item_unavailable', label: 'Item Unavailability', description: 'Some menu items are unavailable' },
  { key: 'staff_shortage', label: 'Staff Shortage', description: 'Not enough staff to fulfill the order' },
  { key: 'kitchen_overload', label: 'Kitchen Overload', description: "Kitchen can't handle more orders now" },
  { key: 'restaurant_closed', label: 'Restaurant Closed', description: 'Restaurant will be closed at that time' },
  { key: 'delivery_issues', label: 'Delivery Issues', description: "Delivery can't be arranged for the time" },
  { key: 'event_conflict', label: 'Special Event Conflict', description: 'Unavailable due to a private event' },
  { key: 'insufficient_prep_time', label: 'Insufficient Preparation Time', description: 'Order scheduled too close to prep time' },
  { key: 'technical_error', label: 'Technical Error', description: 'A technical issue occurred' },
]

const MODAL_WIDTH = 520

export function RejectOrderModal({ open, orderNumber, onClose, onConfirm }: RejectOrderModalProps) {
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (!open) setSelected(null)
  }, [open])

  const handleConfirm = () => {
    if (!selected) return
    const reason = REASONS.find((r) => r.key === selected)
    if (!reason) return
    onConfirm(reason.key, reason.label)
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div
          style={{
            fontSize: 20,
            lineHeight: '28px',
            fontWeight: 600,
            color: 'var(--flock-color-text)',
          }}
        >
          Please provide a reason of rejection
          {orderNumber && (
            <span
              style={{
                marginLeft: 8,
                fontSize: 14,
                fontWeight: 400,
                color: 'var(--flock-color-text-tertiary)',
              }}
            >
              · #{orderNumber}
            </span>
          )}
        </div>
      }
      width={MODAL_WIDTH}
      destroyOnHidden
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button size="large" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            danger
            disabled={selected == null}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </div>
      }
    >
      <RadioGroup
        value={selected ?? undefined}
        onChange={(e) => setSelected(e.target.value as string)}
        style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
      >
        {REASONS.map((reason, idx) => (
          <label
            key={reason.key}
            className="flex items-center gap-4 cursor-pointer"
            style={{
              paddingTop: 12,
              paddingBottom: 12,
              borderBottom: idx === REASONS.length - 1
                ? 'none'
                : '1px solid var(--flock-color-split)',
            }}
          >
            <Radio value={reason.key} />
            <div className="flex flex-col min-w-0">
              <span
                style={{
                  fontSize: 16,
                  lineHeight: '24px',
                  fontWeight: 600,
                  color: 'var(--flock-color-text)',
                }}
              >
                {reason.label}
              </span>
              <span
                style={{
                  fontSize: 14,
                  lineHeight: '22px',
                  color: 'var(--flock-color-text-tertiary)',
                }}
              >
                {reason.description}
              </span>
            </div>
          </label>
        ))}
      </RadioGroup>
    </Modal>
  )
}
