import { useState, useCallback, useEffect } from 'react'
import { SPOTLIGHT_STEPS } from './spotlightConfig'
import type { ChecklistItemId } from './checklistConfig'

const KEY_SPOTLIGHT_COMPLETED = 'spotlight_completed'
const KEY_ONBOARDING_SKIPPED = 'onboarding_skipped'

function shouldAutoStart(): boolean {
  // DEV: always start fresh on page load
  localStorage.removeItem(KEY_SPOTLIGHT_COMPLETED)
  localStorage.removeItem(KEY_ONBOARDING_SKIPPED)
  return true
}

function queryTarget(target: string): DOMRect | null {
  const el = document.querySelector<HTMLElement>(`[data-onboarding="${target}"]`)
  return el ? el.getBoundingClientRect() : null
}

export function useSpotlightFlow(markComplete: (id: ChecklistItemId) => void) {
  const [isActive, setIsActive] = useState(shouldAutoStart)
  const [stepIndex, setStepIndex] = useState(0)
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  const step = SPOTLIGHT_STEPS[stepIndex]

  // ── Track target element position ──
  useEffect(() => {
    if (!isActive) {
      setTargetRect(null)
      return
    }

    const target = step?.target
    if (!target) return

    const update = () => {
      setTargetRect(queryTarget(target))
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    const id = setInterval(update, 300)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      clearInterval(id)
    }
  }, [isActive, step?.target])

  // ── Auto-skip if target not found ──
  useEffect(() => {
    if (!isActive || targetRect || !step?.target) return

    const timer = setTimeout(() => {
      // Find next step with a valid target
      for (let s = stepIndex + 1; s < SPOTLIGHT_STEPS.length; s++) {
        const rect = queryTarget(SPOTLIGHT_STEPS[s].target)
        if (rect) {
          setStepIndex(s)
          setTargetRect(rect)
          return
        }
      }
      // No valid steps remaining
      localStorage.setItem(KEY_SPOTLIGHT_COMPLETED, 'true')
      setIsActive(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [isActive, targetRect, stepIndex, step?.target])

  // ── Navigation ──
  const next = useCallback(() => {
    if (step?.checklistItem) {
      markComplete(step.checklistItem)
    }

    const nextIndex = stepIndex + 1
    if (nextIndex >= SPOTLIGHT_STEPS.length) {
      localStorage.setItem(KEY_SPOTLIGHT_COMPLETED, 'true')
      setIsActive(false)
      return
    }

    // Pre-calculate rect for smooth transition
    const rect = queryTarget(SPOTLIGHT_STEPS[nextIndex].target)
    if (rect) setTargetRect(rect)
    setStepIndex(nextIndex)
  }, [stepIndex, step, markComplete])

  const back = useCallback(() => {
    if (stepIndex <= 0) return
    const prevIndex = stepIndex - 1
    const rect = queryTarget(SPOTLIGHT_STEPS[prevIndex].target)
    if (rect) setTargetRect(rect)
    setStepIndex(prevIndex)
  }, [stepIndex])

  // ── Skip flow ──
  const requestSkip = useCallback(() => setShowSkipConfirm(true), [])

  const confirmSkip = useCallback(() => {
    localStorage.setItem(KEY_ONBOARDING_SKIPPED, 'true')
    setShowSkipConfirm(false)
    setIsActive(false)
  }, [])

  const cancelSkip = useCallback(() => setShowSkipConfirm(false), [])

  // ── Jump to specific step ──
  const jumpToStep = useCallback((index: number) => {
    if (index < 0 || index >= SPOTLIGHT_STEPS.length) return
    const rect = queryTarget(SPOTLIGHT_STEPS[index].target)
    if (rect) setTargetRect(rect)
    setStepIndex(index)
    setShowSkipConfirm(false)
    setIsActive(true)
  }, [])

  // ── Replay ──
  const replay = useCallback(() => {
    localStorage.removeItem(KEY_SPOTLIGHT_COMPLETED)
    localStorage.removeItem(KEY_ONBOARDING_SKIPPED)
    setStepIndex(0)
    setShowSkipConfirm(false)
    setIsActive(true)
  }, [])

  return {
    isActive,
    stepIndex,
    totalSteps: SPOTLIGHT_STEPS.length,
    step,
    targetRect,
    showSkipConfirm,
    next,
    back,
    requestSkip,
    confirmSkip,
    cancelSkip,
    jumpToStep,
    replay,
  }
}
