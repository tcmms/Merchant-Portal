export type ForcedState = 'default' | 'loading' | 'error'

export interface PageDevHandle {}

export interface LiveOrdersDevHandle extends PageDevHandle {
  selectFirstOrder: () => void
  triggerActionLoading: () => void
  showEmptyState: () => void
}

export interface CatalogDevHandle extends PageDevHandle {
  openProductDrawer: () => void
  openBulkUpdateModal: () => void
  triggerSpotlight: () => void
  selectAllItems: () => void
  switchToRejectedView: () => void
}
