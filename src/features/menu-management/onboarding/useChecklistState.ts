import { useState, useCallback, useMemo } from 'react'
import { CHECKLIST_ITEMS, DEFAULT_ITEM_STATES, type ChecklistItemId } from './checklistConfig'

const KEY_ITEMS = 'checklist_items'
const KEY_COMPLETED = 'checklist_completed'
const KEY_TOUR_CLOSED = 'tour_closed'

function readItems(): Record<ChecklistItemId, boolean> {
  // DEV: always start fresh on page load
  localStorage.removeItem(KEY_ITEMS)
  localStorage.removeItem(KEY_COMPLETED)
  return { ...DEFAULT_ITEM_STATES }
}

export function useChecklistState() {
  const [itemStates, setItemStates] = useState(readItems)
  const [isExpanded, setExpanded] = useState(true)
  const [isCompleted, setIsCompleted] = useState(
    () => localStorage.getItem(KEY_COMPLETED) === 'true',
  )
  const [isHidden, setIsHidden] = useState(false)

  const isVisible = !isCompleted && !isHidden

  const hideChecklist = useCallback(() => setIsHidden(true), [])

  const completedCount = useMemo(
    () => CHECKLIST_ITEMS.filter(item => itemStates[item.id]).length,
    [itemStates],
  )

  const totalCount = CHECKLIST_ITEMS.length

  const markComplete = useCallback((id: ChecklistItemId) => {
    setItemStates(prev => {
      if (prev[id]) return prev
      const next = { ...prev, [id]: true }
      localStorage.setItem(KEY_ITEMS, JSON.stringify(next))

      const allDone = CHECKLIST_ITEMS.every(item => next[item.id])
      if (allDone) {
        localStorage.setItem(KEY_COMPLETED, 'true')
        setIsCompleted(true)
      }
      return next
    })
  }, [])

  const resetChecklist = useCallback(() => {
    const fresh = { ...DEFAULT_ITEM_STATES }
    localStorage.setItem(KEY_ITEMS, JSON.stringify(fresh))
    localStorage.removeItem(KEY_COMPLETED)
    setItemStates(fresh)
    setIsCompleted(false)
    setExpanded(true)
  }, [])

  return {
    itemStates,
    completedCount,
    totalCount,
    isExpanded,
    setExpanded,
    isCompleted,
    isVisible,
    markComplete,
    resetChecklist,
    hideChecklist,
  }
}
