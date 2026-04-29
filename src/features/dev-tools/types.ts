export type ForcedState = 'default' | 'loading' | 'error'

export interface PageDevHandle {}

export interface LiveOrdersDevHandle extends PageDevHandle {
  selectFirstOrder: () => void
  triggerActionLoading: () => void
  showEmptyState: () => void
  forceFirstScheduledDue: () => void
  forceFirstScheduledOverdue: () => void
  spawnDueScheduled: () => void
  spawnScheduledIncoming: () => void
  triggerUrgentPrepBanner: () => void
  enterSingleOrderDemo: () => void
  enterOwnDeliveryDemo: () => void
  enterPremiumPriorityDemo: () => void
  spawnPremiumPriorityOrder: () => void
  spawnCustomerCancelledOrder: () => void
  resetScheduledOverrides: () => void
}

export interface CatalogDevHandle extends PageDevHandle {
  openProductDrawer: () => void
  openBulkUpdateModal: () => void
  triggerSpotlight: () => void
  selectAllItems: () => void
  switchToRejectedView: () => void
}
