import { useState, forwardRef, useImperativeHandle, useMemo } from 'react'
import { Checkbox, Dropdown, Tooltip } from '@tcmms/flock-ds'
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Copy,
  Pencil,
  AlertCircle,
  ChevronRight,
  Info,
  ExternalLink,
} from 'lucide-react'
import type { Category, CatalogItem } from '../types/catalog'
import { StatusBadge } from './StatusBadge'
import { BulkActionBar } from './BulkActionBar'
import { ProductDetailDrawer } from './ProductDetailDrawer'

// ─── Grid columns: checkbox | product | SKU | barcode | stock | price | prep | status | issues | actions
// Product=266px fixed; With Issues=1fr fills remaining; total fixed cols = 1036px of 1282px
const GRID = '52px 266px 114px 134px 92px 92px 126px 104px 1fr 56px'

const SortIcon = () => <ChevronsUpDown size={16} className="shrink-0" style={{ color: 'rgba(0,0,0,0.45)' }} />

// ─── TableHeader ─────────────────────────────────────────────────────────────
interface TableHeaderProps {
  allSelected: boolean
  someSelected: boolean
  onSelectAll: () => void
}

function TableHeader({ allSelected, someSelected, onSelectAll }: TableHeaderProps) {
  return (
    <div
      className="grid h-[54px] border-b sticky top-0 z-10"
      style={{ gridTemplateColumns: GRID, backgroundColor: '#fbfbfb', borderColor: '#d9d9d9' }}
    >
      <div className="flex items-center pl-5 pr-4">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={onSelectAll}
        />
      </div>

      {/* Product — pl-72px aligns label with item name (16px cell-pad + 40px img + 16px gap) */}
      <div className="flex items-center pl-[72px] pr-4">
        <span className="flex items-center gap-1 text-sm font-medium" style={{ color: 'rgba(0,0,0,0.88)' }}>
          Product <SortIcon />
        </span>
      </div>

      <div className="flex items-center px-4">
        <span className="text-sm font-medium" style={{ color: 'rgba(0,0,0,0.88)' }}>SKU</span>
      </div>

      <div className="flex items-center px-4">
        <span className="text-sm font-medium" style={{ color: 'rgba(0,0,0,0.88)' }}>Barcode</span>
      </div>

      <div className="flex items-center px-4">
        <span className="flex items-center gap-1 text-sm font-medium" style={{ color: 'rgba(0,0,0,0.88)' }}>
          Stock <SortIcon />
        </span>
      </div>

      <div className="flex items-center px-4">
        <span className="flex items-center gap-1 text-sm font-medium" style={{ color: 'rgba(0,0,0,0.88)' }}>
          Price <SortIcon />
        </span>
      </div>

      <div className="flex items-center px-4">
        <span className="flex items-center gap-1 text-sm font-medium" style={{ color: 'rgba(0,0,0,0.88)' }}>
          Prep. time <SortIcon />
        </span>
      </div>

      <div className="flex items-center px-4">
        <span className="flex items-center gap-1 text-sm font-medium" style={{ color: 'rgba(0,0,0,0.88)' }}>
          Status <SortIcon />
        </span>
      </div>

      <div className="flex items-center px-3" data-tour="with-issues-header" data-onboarding="column-issues">
        <span className="flex items-center gap-1 text-sm font-medium" style={{ color: 'rgba(0,0,0,0.88)' }}>
          With Issues <SortIcon />
          <Tooltip
            title="Shows how many branches have stock or availability problems. Click any cell to see details per branch."
            placement="bottomLeft"
            mouseEnterDelay={0.3}
            mouseLeaveDelay={0.1}
            overlayInnerStyle={{ maxWidth: 240, fontSize: 12, lineHeight: '18px' }}
          >
            <span className="inline-flex cursor-pointer">
              <Info size={14} aria-hidden="true" style={{ color: '#999999' }} />
            </span>
          </Tooltip>
        </span>
      </div>

      <div />
    </div>
  )
}

// ─── CategoryRow ─────────────────────────────────────────────────────────────
interface CategoryRowProps {
  name: string
  subCount: number
  itemCount: number
  isExpanded: boolean
  onToggle: () => void
  allSelected: boolean
  someSelected: boolean
  onSelectAll: () => void
}

function CategoryRow({
  name,
  subCount,
  itemCount,
  isExpanded,
  onToggle,
  allSelected,
  someSelected,
  onSelectAll,
}: CategoryRowProps) {
  return (
    <div
      className="grid h-[54px] border-b cursor-pointer hover:brightness-[0.97] transition-all"
      style={{ gridTemplateColumns: GRID, backgroundColor: '#fbfbfb', borderColor: '#d9d9d9' }}
      onClick={onToggle}
      role="button"
      aria-expanded={isExpanded}
    >
      <div className="flex items-center pl-5 pr-2" onClick={e => e.stopPropagation()}>
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={onSelectAll}
        />
      </div>

      <div
        className="col-span-9 flex items-center gap-[10px] px-4 min-w-0"
        style={{ gridColumn: '2 / -1' }}
      >
        <span className="font-bold text-sm" style={{ color: 'rgba(0,0,0,0.88)' }}>
          {name}
        </span>
        <span className="text-sm" style={{ color: 'rgba(0,0,0,0.45)' }}>
          {subCount} subcategories
        </span>
        <span className="text-sm" style={{ color: 'rgba(0,0,0,0.45)' }}>
          ({itemCount} items)
        </span>
        {isExpanded ? (
          <ChevronUp size={16} className="shrink-0" style={{ color: 'rgba(0,0,0,0.45)' }} />
        ) : (
          <ChevronDown size={16} className="shrink-0" style={{ color: 'rgba(0,0,0,0.45)' }} />
        )}
      </div>
    </div>
  )
}

// ─── SubCategoryRow ───────────────────────────────────────────────────────────
interface SubCategoryRowProps {
  name: string
  itemCount: number
  isExpanded: boolean
  onToggle: () => void
  allSelected: boolean
  someSelected: boolean
  onSelectAll: () => void
}

function SubCategoryRow({
  name,
  itemCount,
  isExpanded,
  onToggle,
  allSelected,
  someSelected,
  onSelectAll,
}: SubCategoryRowProps) {
  return (
    <div
      className="grid h-[40px] border-b cursor-pointer hover:brightness-[0.97] transition-all"
      style={{ gridTemplateColumns: GRID, backgroundColor: '#fbfbfb', borderColor: '#d9d9d9' }}
      onClick={onToggle}
      role="button"
      aria-expanded={isExpanded}
    >
      <div className="flex items-center pl-8 pr-2" onClick={e => e.stopPropagation()}>
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={onSelectAll}
        />
      </div>

      <div
        className="flex items-center gap-[10px] px-4 min-w-0"
        style={{ gridColumn: '2 / -1' }}
      >
        <span className="font-medium text-sm" style={{ color: 'rgba(0,0,0,0.88)' }}>
          {name}
        </span>
        <span className="text-sm" style={{ color: 'rgba(0,0,0,0.45)' }}>
          ({itemCount} items)
        </span>
        {isExpanded ? (
          <ChevronUp size={16} className="shrink-0" style={{ color: 'rgba(0,0,0,0.45)' }} />
        ) : (
          <ChevronDown size={16} className="shrink-0" style={{ color: 'rgba(0,0,0,0.45)' }} />
        )}
      </div>
    </div>
  )
}

// ─── ItemRow ──────────────────────────────────────────────────────────────────
interface ItemRowProps {
  item: CatalogItem
  isSelected: boolean
  onToggle: () => void
  onProductClick: (item: CatalogItem) => void
  onStockClick?: () => void
  onIssuesClick?: () => void
  isRejectedView?: boolean
  isBrandView?: boolean
  isFirstItem?: boolean
}

function ItemRow({ item, isSelected, onToggle, onProductClick, onStockClick, onIssuesClick, isRejectedView, isBrandView, isFirstItem }: ItemRowProps) {
  const showMixedStockIcon = isBrandView && item.hasMixedStock
  return (
    <div
      className="grid h-[64px] border-b transition-colors"
      style={{
        gridTemplateColumns: GRID,
        borderColor: '#d9d9d9',
        backgroundColor: isSelected ? '#f4f0ff' : 'white',
      }}
      onMouseEnter={e => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#f6f6f6'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.backgroundColor = isSelected ? '#f4f0ff' : 'white'
      }}
    >
      {/* Checkbox */}
      <div
        className="flex items-center pl-5 pr-4"
        data-onboarding={isFirstItem ? 'checkbox-first' : undefined}
      >
        <Tooltip
          title="Select multiple products to update stock, status, or price all at once."
          placement="right"
          mouseEnterDelay={0.3}
          mouseLeaveDelay={0.1}
          overlayInnerStyle={{ maxWidth: 220, fontSize: 12, lineHeight: '18px' }}
        >
          <span>
            <Checkbox checked={isSelected} onChange={onToggle} />
          </span>
        </Tooltip>
      </div>

      {/* Product: image + name + choice groups */}
      <div
        className="flex items-center gap-4 px-4 min-w-0"
        data-onboarding={isFirstItem ? 'product-name-first' : undefined}
      >
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-100"
        />
        <div className="flex flex-col min-w-0">
          {isRejectedView ? (
            <Tooltip
              title="Click to see rejection reason and fix it"
              placement="top"
              mouseEnterDelay={0.5}
              overlayInnerStyle={{ width: 200, fontSize: 12, lineHeight: '18px' }}
            >
              <a
                href="#"
                className="flex items-center gap-0.5 text-sm font-medium underline"
                style={{ color: '#E31D1C' }}
                onClick={e => { e.preventDefault(); e.stopPropagation(); onProductClick(item) }}
              >
                <span className="truncate">{item.name}</span>
                <ExternalLink size={14} aria-hidden="true" className="shrink-0" style={{ color: '#E31D1C' }} />
              </a>
            </Tooltip>
          ) : (
            <a
              href="#"
              className="text-sm font-medium truncate underline"
              style={{ color: '#0a84ff' }}
              onClick={e => { e.preventDefault(); e.stopPropagation(); onProductClick(item) }}
            >
              {item.name}
            </a>
          )}
          {item.hasChoiceGroups && (
            <a
              href="#"
              className="flex items-center gap-0.5 mt-0.5 text-xs font-medium"
              style={{ color: '#5c44f0' }}
              onClick={e => e.preventDefault()}
            >
              View choice groups <ChevronRight size={12} />
            </a>
          )}
        </div>
      </div>

      {/* SKU */}
      <div className="flex items-center gap-1 px-4">
        <span className="text-xs truncate" style={{ color: 'rgba(0,0,0,0.45)' }}>
          {item.sku}
        </span>
        <button
          className="shrink-0 transition-colors"
          style={{ color: 'rgba(0,0,0,0.25)' }}
          aria-label="Copy SKU"
          onClick={() => navigator.clipboard.writeText(item.sku)}
        >
          <Copy size={14} />
        </button>
      </div>

      {/* Barcode */}
      <div className="flex items-center gap-1 px-4">
        <span className="text-xs truncate" style={{ color: 'rgba(0,0,0,0.45)' }}>
          {item.barcode}
        </span>
        <button
          className="shrink-0 transition-colors"
          style={{ color: 'rgba(0,0,0,0.25)' }}
          aria-label="Copy barcode"
          onClick={() => navigator.clipboard.writeText(item.barcode)}
        >
          <Copy size={14} />
        </button>
      </div>

      {/* Stock — right-aligned: pl-12px pr-4px per Figma */}
      <div
        className="flex items-center justify-end gap-1 pl-3 pr-1 cursor-pointer"
        onClick={onStockClick}
        data-onboarding={isFirstItem ? 'stock-cell-first' : undefined}
      >
        <span className="text-sm font-semibold" style={{ color: 'rgba(0,0,0,0.88)' }}>
          {showMixedStockIcon ? `~${item.stock}` : item.stock}
        </span>
        {showMixedStockIcon && (
          <Tooltip
            title="~ means branches have mixed stock modes. This total includes only branches with exact quantity."
            placement="top"
            mouseEnterDelay={0.3}
            mouseLeaveDelay={0.1}
            overlayInnerStyle={{ maxWidth: 240, fontSize: 12, lineHeight: '18px' }}
          >
            <span className="inline-flex cursor-pointer" onClick={e => e.stopPropagation()}>
              <Info size={14} style={{ color: '#999999' }} />
            </span>
          </Tooltip>
        )}
      </div>

      {/* Price — right-aligned: pl-12px pr-4px per Figma */}
      <div className="flex items-center justify-end pl-3 pr-1">
        <span className="text-sm font-semibold" style={{ color: 'rgba(0,0,0,0.88)' }}>
          {item.price} {item.currency}
        </span>
      </div>

      {/* Prep time — centered */}
      <div className="flex items-center justify-center px-4">
        <span className="text-sm font-semibold" style={{ color: 'rgba(0,0,0,0.88)' }}>
          {item.prepTime} min
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center px-3">
        <StatusBadge status={item.status} />
      </div>

      {/* With Issues */}
      <div className="flex items-center px-4" onClick={onIssuesClick}>
        {item.branchIssues > 0 ? (
          <Dropdown
            menu={{
              items: [
                { key: 'view', label: 'View branch issues' },
                { key: 'resolve', label: 'Resolve all' },
              ],
            }}
            trigger={['click']}
          >
            <span
              className="flex items-center gap-1 px-2 py-px rounded cursor-pointer select-none text-xs font-medium hover:opacity-80 transition-opacity"
              style={{ backgroundColor: '#fff2f0', color: '#5c44f0' }}
            >
              <AlertCircle size={14} color="#ff4d4f" />
              <span style={{ color: '#5c44f0' }}>{item.branchIssues} branches</span>
              <ChevronDown size={14} color="#5c44f0" />
            </span>
          </Dropdown>
        ) : (
          <span style={{ fontSize: 16, color: '#999' }}>—</span>
        )}
      </div>

      {/* Edit button */}
      <div className="flex items-center justify-center">
        <button
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
          style={{ backgroundColor: '#f2f2f2', color: 'rgba(0,0,0,0.45)' }}
          aria-label="Edit item"
        >
          <Pencil size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Public handle ────────────────────────────────────────────────────────────
export interface CatalogTableHandle {
  collapseAll: () => void
  selectAll: () => void
  openFirstProductDrawer: () => void
}

interface CatalogTableProps {
  categories: Category[]
  onStockClick?: () => void
  onIssuesClick?: () => void
  isRejectedView?: boolean
  isBrandView?: boolean
}

// ─── CatalogTable ─────────────────────────────────────────────────────────────
export const CatalogTable = forwardRef<CatalogTableHandle, CatalogTableProps>(
  ({ categories, onStockClick, onIssuesClick, isRejectedView, isBrandView }, ref) => {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
      () => new Set(categories.map(c => c.id)),
    )
    const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(
      () => new Set(categories.flatMap(c => c.subCategories.map(s => s.id))),
    )
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [selectedProduct, setSelectedProduct] = useState<CatalogItem | null>(null)

    // Flat list of all currently visible item IDs
    const allItemIds = useMemo(
      () => categories.flatMap(c => c.subCategories.flatMap(s => s.items.map(i => i.id))),
      [categories],
    )

    // First visible item (for data-onboarding attributes)
    const firstVisibleItemId = useMemo(() => {
      for (const cat of categories) {
        if (!expandedCategories.has(cat.id)) continue
        for (const sub of cat.subCategories) {
          if (!expandedSubCategories.has(sub.id)) continue
          if (sub.items.length > 0) return sub.items[0].id
        }
      }
      return null
    }, [categories, expandedCategories, expandedSubCategories])

    const collapseAll = () => {
      setExpandedCategories(new Set())
      setExpandedSubCategories(new Set())
    }

    useImperativeHandle(ref, () => ({
      collapseAll,
      selectAll: () => setSelectedItems(new Set(allItemIds)),
      openFirstProductDrawer: () => {
        const firstItem = categories[0]?.subCategories[0]?.items[0]
        if (firstItem) setSelectedProduct(firstItem)
      },
    }))

    const toggleCategory = (id: string) => {
      setExpandedCategories(prev => {
        const next = new Set(prev)
        next.has(id) ? next.delete(id) : next.add(id)
        return next
      })
    }

    const toggleSubCategory = (id: string) => {
      setExpandedSubCategories(prev => {
        const next = new Set(prev)
        next.has(id) ? next.delete(id) : next.add(id)
        return next
      })
    }

    const toggleItem = (id: string) => {
      setSelectedItems(prev => {
        const next = new Set(prev)
        next.has(id) ? next.delete(id) : next.add(id)
        return next
      })
    }

    const selectAllItems = () => setSelectedItems(new Set(allItemIds))
    const clearSelection = () => setSelectedItems(new Set())

    const toggleAllItems = () => {
      if (selectedItems.size === allItemIds.length) {
        clearSelection()
      } else {
        selectAllItems()
      }
    }

    const toggleCategoryItems = (ids: string[]) => {
      setSelectedItems(prev => {
        const next = new Set(prev)
        const allSelected = ids.every(id => next.has(id))
        ids.forEach(id => (allSelected ? next.delete(id) : next.add(id)))
        return next
      })
    }

    return (
      <>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" data-tour="catalog-table">
          <TableHeader
            allSelected={allItemIds.length > 0 && selectedItems.size === allItemIds.length}
            someSelected={selectedItems.size > 0}
            onSelectAll={toggleAllItems}
          />

          {categories.map(category => {
            const isCatExpanded = expandedCategories.has(category.id)
            const catItemIds = category.subCategories.flatMap(s => s.items.map(i => i.id))
            const totalItems = catItemIds.length

            return (
              <div key={category.id}>
                <CategoryRow
                  name={category.name}
                  subCount={category.subCategories.length}
                  itemCount={totalItems}
                  isExpanded={isCatExpanded}
                  onToggle={() => toggleCategory(category.id)}
                  allSelected={catItemIds.length > 0 && catItemIds.every(id => selectedItems.has(id))}
                  someSelected={catItemIds.some(id => selectedItems.has(id))}
                  onSelectAll={() => toggleCategoryItems(catItemIds)}
                />

                {isCatExpanded &&
                  category.subCategories.map(sub => {
                    const isSubExpanded = expandedSubCategories.has(sub.id)
                    const subItemIds = sub.items.map(i => i.id)

                    return (
                      <div key={sub.id}>
                        <SubCategoryRow
                          name={sub.name}
                          itemCount={sub.items.length}
                          isExpanded={isSubExpanded}
                          onToggle={() => toggleSubCategory(sub.id)}
                          allSelected={subItemIds.length > 0 && subItemIds.every(id => selectedItems.has(id))}
                          someSelected={subItemIds.some(id => selectedItems.has(id))}
                          onSelectAll={() => toggleCategoryItems(subItemIds)}
                        />
                        {isSubExpanded &&
                          sub.items.map(item => (
                            <ItemRow
                              key={item.id}
                              item={item}
                              isSelected={selectedItems.has(item.id)}
                              onToggle={() => toggleItem(item.id)}
                              onProductClick={setSelectedProduct}
                              onStockClick={onStockClick}
                              onIssuesClick={onIssuesClick}
                              isRejectedView={isRejectedView}
                              isBrandView={isBrandView}
                              isFirstItem={item.id === firstVisibleItemId}
                            />
                          ))}
                      </div>
                    )
                  })}
              </div>
            )
          })}
        </div>

        {selectedItems.size > 0 && (
          <BulkActionBar
            selectedCount={selectedItems.size}
            onSelectAll={selectAllItems}
            onDelete={clearSelection}
            onUpdateStatuses={() => {}}
            onUpdateStocks={() => {}}
            onUpdatePrices={() => {}}
          />
        )}

        <ProductDetailDrawer
          item={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </>
    )
  },
)
CatalogTable.displayName = 'CatalogTable'
