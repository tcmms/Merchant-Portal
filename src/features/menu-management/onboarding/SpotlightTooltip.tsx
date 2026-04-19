import { useRef, useLayoutEffect, useState } from 'react'
import { Button } from '@tcmms/flock-ds'
import type { SpotlightStep, TooltipPosition } from './spotlightConfig'

interface SpotlightTooltipProps {
  step: SpotlightStep
  targetRect: DOMRect
  stepIndex: number
  totalSteps: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

const TOOLTIP_WIDTH = 420
const GAP = 12
const CUTOUT_PADDING = 6
const VIEWPORT_MARGIN = 16

function calculatePosition(
  targetRect: DOMRect,
  position: TooltipPosition,
  tooltipHeight: number,
): { top: number; left: number } {
  const cutoutTop = targetRect.top - CUTOUT_PADDING
  const cutoutBottom = targetRect.bottom + CUTOUT_PADDING
  const cutoutLeft = targetRect.left - CUTOUT_PADDING
  const cutoutRight = targetRect.right + CUTOUT_PADDING

  let top: number
  let left: number

  switch (position) {
    case 'below':
      top = cutoutBottom + GAP
      left = cutoutLeft
      break
    case 'above':
      top = cutoutTop - GAP - tooltipHeight
      left = cutoutLeft
      break
    case 'left':
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
      left = cutoutLeft - GAP - TOOLTIP_WIDTH
      break
    case 'right':
      top = targetRect.top
      left = cutoutRight + GAP
      break
  }

  const vw = window.innerWidth
  const vh = window.innerHeight

  // Flip vertical if overflows
  if (position === 'below' && top + tooltipHeight > vh - VIEWPORT_MARGIN) {
    top = cutoutTop - GAP - tooltipHeight
  }
  if (position === 'above' && top < VIEWPORT_MARGIN) {
    top = cutoutBottom + GAP
  }

  // Clamp horizontal
  if (left + TOOLTIP_WIDTH > vw - VIEWPORT_MARGIN) {
    left = vw - VIEWPORT_MARGIN - TOOLTIP_WIDTH
  }
  if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN

  // Clamp vertical
  if (top < VIEWPORT_MARGIN) top = VIEWPORT_MARGIN
  if (top + tooltipHeight > vh - VIEWPORT_MARGIN) {
    top = vh - VIEWPORT_MARGIN - tooltipHeight
  }

  return { top, left }
}

export function SpotlightTooltip({
  step,
  targetRect,
  stepIndex,
  totalSteps,
  onNext,
  onBack,
  onSkip,
}: SpotlightTooltipProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    if (!ref.current) return
    const h = ref.current.offsetHeight
    setPos(calculatePosition(targetRect, step.tooltipPosition, h))
    setReady(true)
  }, [targetRect, step])

  const isFirst = stepIndex === 0
  const isLast = stepIndex === totalSteps - 1

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: TOOLTIP_WIDTH,
        zIndex: 9001,
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        padding: 16,
        opacity: ready ? 1 : 0,
        transition: 'top 400ms ease, left 400ms ease, opacity 150ms ease',
      }}
      role="dialog"
      aria-label={step.title}
    >
      {/* Header: title + progress */}
      <div className="flex items-center justify-between">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
          {step.title}
        </h3>
        <span style={{ fontSize: 12, color: '#999999' }}>
          {stepIndex + 1} / {totalSteps}
        </span>
      </div>

      {/* Copy */}
      <p style={{ fontSize: 13, color: '#555555', lineHeight: 1.5, margin: '8px 0 16px' }}>
        {step.copy}
      </p>

      {/* Footer: skip left, back + next right */}
      <div className="flex items-center justify-between">
        <Button type="text" size="middle" onClick={onSkip} style={{ color: '#999999' }}>
          Skip onboarding
        </Button>

        <div className="flex items-center gap-2">
          {!isFirst && (
            <Button type="default" size="middle" onClick={onBack}>
              ← Back
            </Button>
          )}
          <Button
            type="primary"
            size="middle"
            onClick={onNext}
            style={{ backgroundColor: '#E31D1C', borderColor: '#E31D1C' }}
          >
            {isLast ? 'Finish Onboarding' : 'Next →'}
          </Button>
        </div>
      </div>
    </div>
  )
}
