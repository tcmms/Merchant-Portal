import type { ChecklistItemId } from './checklistConfig'

export type TooltipPosition = 'below' | 'above' | 'left' | 'right'

export interface SpotlightStep {
  target: string
  title: string
  copy: string
  tooltipPosition: TooltipPosition
  checklistItem?: ChecklistItemId
}

export const SPOTLIGHT_STEPS: SpotlightStep[] = [
  {
    target: 'tab-bar',
    title: 'Product statuses',
    copy: 'Use tabs to filter your catalog by status. Each tab shows products in that state.',
    tooltipPosition: 'below',
    checklistItem: 'statuses',
  },
  {
    target: 'tab-rejected',
    title: 'Rejected products',
    copy: "Products that didn't pass review appear here. They need your attention.",
    tooltipPosition: 'below',
  },
  {
    target: 'product-name-first',
    title: 'See rejection reason',
    copy: "Click any product name to open its details. For rejected products, you'll see the exact reason and how to fix it.",
    tooltipPosition: 'below',
    checklistItem: 'rejection',
  },
  {
    target: 'column-issues',
    title: 'Issues column',
    copy: 'Shows how many branches have stock or availability problems. Click any cell to see details per branch.',
    tooltipPosition: 'left',
    checklistItem: 'issues',
  },
  {
    target: 'branch-switcher',
    title: 'Branch view',
    copy: 'Switch to Branch to see exact stock and issues for one specific location. Use Brand for an overview.',
    tooltipPosition: 'below',
    checklistItem: 'branch',
  },
  {
    target: 'bulk-update-btn',
    title: 'Bulk Update via Excel',
    copy: 'Download a template, edit products in Excel, and upload it back. Update hundreds of products at once.',
    tooltipPosition: 'below',
  },
  {
    target: 'checkbox-first',
    title: 'Bulk Update via checkboxes',
    copy: 'Select products using checkboxes. An action bar appears at the bottom to update status, stock, or price at once.',
    tooltipPosition: 'right',
    checklistItem: 'bulk',
  },
  {
    target: 'stock-cell-first',
    title: 'Update stock',
    copy: 'Click any stock value to edit it directly. Changes save instantly.',
    tooltipPosition: 'below',
    checklistItem: 'stock',
  },
]
