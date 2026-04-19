export type ChecklistItemId =
  | 'statuses'
  | 'rejection'
  | 'issues'
  | 'branch'
  | 'bulk'
  | 'stock'

export interface ChecklistItemConfig {
  id: ChecklistItemId
  label: string
}

export const CHECKLIST_ITEMS: ChecklistItemConfig[] = [
  { id: 'statuses', label: 'Check your product statuses' },
  { id: 'rejection', label: 'See how rejection reasons work' },
  { id: 'issues', label: 'Explore the Issues column' },
  { id: 'branch', label: 'Try switching to Branch view' },
  { id: 'bulk', label: 'Try Bulk Update' },
  { id: 'stock', label: 'Update stock for a product' },
]

export const DEFAULT_ITEM_STATES: Record<ChecklistItemId, boolean> = {
  statuses: false,
  rejection: false,
  issues: false,
  branch: false,
  bulk: false,
  stock: false,
}

/** Maps each checklist item to its spotlight step index (0-based) */
export const CHECKLIST_TO_STEP: Record<ChecklistItemId, number> = {
  statuses: 0,
  rejection: 1,
  issues: 3,
  branch: 4,
  bulk: 5,
  stock: 7,
}

/** Maps spotlight step index back to nearest checklist item */
export const STEP_TO_CHECKLIST: Record<number, ChecklistItemId> = {
  0: 'statuses',
  1: 'rejection',
  2: 'rejection',
  3: 'issues',
  4: 'branch',
  5: 'bulk',
  6: 'bulk',
  7: 'stock',
}
