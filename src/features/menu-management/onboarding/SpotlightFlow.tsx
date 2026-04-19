import { Component, type ReactNode } from 'react'
import { Button } from '@tcmms/flock-ds'
import { SpotlightOverlay } from './SpotlightOverlay'
import { SpotlightTooltip } from './SpotlightTooltip'
import type { SpotlightStep } from './spotlightConfig'

// ─── Error Boundary ───────────────────────────────────────────────────────────

interface BoundaryProps {
  onError: () => void
  children: ReactNode
}

interface BoundaryState {
  crashed: boolean
}

class SpotlightErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { crashed: false }

  static getDerivedStateFromError(): BoundaryState {
    return { crashed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.crashed ? null : this.props.children
  }
}

// ─── Skip Confirmation Dialog ─────────────────────────────────────────────────

interface SkipDialogProps {
  onCancel: () => void
  onConfirm: () => void
}

function SkipConfirmDialog({ onCancel, onConfirm }: SkipDialogProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9002 }}
    >
      <div
        className="bg-white flex flex-col"
        style={{
          width: 340,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
          padding: 24,
        }}
        role="alertdialog"
        aria-labelledby="skip-title"
        aria-describedby="skip-body"
      >
        <h3
          id="skip-title"
          style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: 0 }}
        >
          Skip onboarding?
        </h3>
        <p
          id="skip-body"
          style={{ fontSize: 14, color: '#555555', lineHeight: 1.5, margin: '8px 0 20px' }}
        >
          You can restart it anytime using the Replay guide button in the header.
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button type="default" size="middle" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="primary"
            size="middle"
            danger
            onClick={onConfirm}
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── SpotlightFlow ────────────────────────────────────────────────────────────

export interface SpotlightFlowProps {
  isActive: boolean
  step: SpotlightStep | undefined
  targetRect: DOMRect | null
  stepIndex: number
  totalSteps: number
  showSkipConfirm: boolean
  next: () => void
  back: () => void
  requestSkip: () => void
  confirmSkip: () => void
  cancelSkip: () => void
}

function SpotlightFlowInner({
  isActive,
  step,
  targetRect,
  stepIndex,
  totalSteps,
  showSkipConfirm,
  next,
  back,
  requestSkip,
  confirmSkip,
  cancelSkip,
}: SpotlightFlowProps) {
  if (!isActive || !step || !targetRect) return null

  return (
    <>
      <SpotlightOverlay targetRect={targetRect} />
      {!showSkipConfirm && (
        <SpotlightTooltip
          step={step}
          targetRect={targetRect}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          onNext={next}
          onBack={back}
          onSkip={requestSkip}
        />
      )}
      {showSkipConfirm && (
        <SkipConfirmDialog onCancel={cancelSkip} onConfirm={confirmSkip} />
      )}
    </>
  )
}

export function SpotlightFlow(props: SpotlightFlowProps) {
  return (
    <SpotlightErrorBoundary onError={() => console.error('[SpotlightFlow] Crashed — overlay dismissed')}>
      <SpotlightFlowInner {...props} />
    </SpotlightErrorBoundary>
  )
}
