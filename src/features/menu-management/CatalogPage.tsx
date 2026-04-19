import { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import type { ForcedState, CatalogDevHandle } from '../dev-tools/types'
import { DevStateOverlay } from '../dev-tools/components/DevStateOverlay'
import { Button, Dropdown, Tabs, Tooltip } from '@tcmms/flock-ds'
import { StatusSegmented } from './components/StatusSegmented'
import {
  Download,
  Plus,
  ChevronDown,
  LayoutGrid,
  List,
  ArrowUpDown,
  Pencil,
  Search,
  Info,
  RotateCcw,
  X,
} from 'lucide-react'
import { Sidebar } from '../live-orders/components/Sidebar'
import { CatalogTable, type CatalogTableHandle } from './components/CatalogTable'
import { BulkUpdateModal } from './components/BulkUpdateModal'
import { MOCK_CATALOG, getStatusCounts } from './data/mockCatalog'
import type { StatusFilter } from './types/catalog'
import { OnboardingChecklist, useChecklistState } from './onboarding'
import { CHECKLIST_TO_STEP, STEP_TO_CHECKLIST } from './onboarding/checklistConfig'
import { SpotlightFlow } from './onboarding/SpotlightFlow'
import { useSpotlightFlow } from './onboarding/useSpotlightFlow'

interface CatalogPageProps {
  onNavigate?: (id: string) => void
  sidebarCollapsed?: boolean
  onSidebarToggle?: () => void
  storeLogo?: string
  storeName?: string
  forcedState?: ForcedState
}

const ADD_NEW_ITEMS = [
  { key: 'item', label: 'Add Item' },
  { key: 'category', label: 'Add Category' },
  { key: 'subcategory', label: 'Add Subcategory' },
]

const BULK_KEYS = ['status', 'price', 'stock'] as const
const BULK_LABELS: Record<string, string> = {
  status: 'Update Status',
  price: 'Update Price',
  stock: 'Update Stock',
}

// boxShadowSecondary token — used for status-filter segmented active tab
const STATUS_SEGMENTED_SHADOW =
  '0px 6px 16px 0px rgba(0,0,0,0.08), 0px 3px 6px -4px rgba(0,0,0,0.12), 0px 9px 28px 8px rgba(0,0,0,0.05)'

export const CatalogPage = forwardRef<CatalogDevHandle, CatalogPageProps>(function CatalogPage({ onNavigate, sidebarCollapsed, onSidebarToggle, storeLogo, storeName, forcedState = 'default' }, ref) {
  const tableRef = useRef<CatalogTableHandle>(null)
  const [activeMainTab, setActiveMainTab] = useState('overview')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [branchView, setBranchView] = useState('Brand')
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [isBannerVisible, setIsBannerVisible] = useState(true)

  const counts = getStatusCounts(MOCK_CATALOG)
  const checklist = useChecklistState()
  const spotlight = useSpotlightFlow(checklist.markComplete)

  const handleReplay = () => {
    checklist.resetChecklist()
    spotlight.replay()
  }

  const handleStatusChange = (val: StatusFilter) => {
    setStatusFilter(val)
    checklist.markComplete('statuses')
    if (val === 'rejected') checklist.markComplete('rejection')
  }

  const handleBranchChange = (val: string) => {
    setBranchView(val)
    if (val === 'Branch') checklist.markComplete('branch')
  }

  const handleBulkClick = () => {
    checklist.markComplete('bulk')
  }

  const handleStockClick = () => {
    checklist.markComplete('stock')
  }

  const handleIssuesClick = () => {
    checklist.markComplete('issues')
  }

  useImperativeHandle(ref, () => ({
    openProductDrawer: () => tableRef.current?.openFirstProductDrawer(),
    openBulkUpdateModal: () => setBulkModalOpen(true),
    triggerSpotlight: () => { checklist.resetChecklist(); spotlight.replay() },
    selectAllItems: () => tableRef.current?.selectAll(),
    switchToRejectedView: () => setStatusFilter('rejected'),
  }))

  const mainTabItems = [
    { key: 'overview', label: 'Overview' },
    { key: 'choice-groups', label: 'Choice Groups' },
  ]

  const statusOptions = [
    {
      label: 'All',
      value: 'all',
      tooltip: 'Your full product catalog in one view.',
    },
    {
      label: 'Active',
      value: 'active',
      tooltip: 'Products visible to customers right now. Must be in stock to appear in the app.',
    },
    {
      label: 'Inactive',
      value: 'inactive',
      badge: counts.inactive > 0 ? counts.inactive : undefined,
      badgeColor: '#E31D1C',
      tooltip: 'Products hidden from customers. Hidden manually by you or automatically when stock runs out.',
    },
    {
      label: 'Rejected',
      value: 'rejected',
      badge: counts.rejected > 0 ? counts.rejected : undefined,
      badgeColor: '#E31D1C',
      tooltip: "Products that didn't pass our review. Open any product to see what needs fixing.",
    },
    {
      label: 'Archived',
      value: 'archived',
      tooltip: "Products removed from your catalog. They won't appear anywhere in the app.",
    },
    {
      label: 'Awaiting approval',
      value: 'awaiting_approval',
      tooltip: 'Products waiting to be reviewed by our team. Usually takes a few hours.',
    },
    {
      label: 'Drafts',
      value: 'draft',
      tooltip: "Products you've started but haven't submitted for review yet.",
    },
  ]

  const filteredCatalog =
    statusFilter === 'all'
      ? MOCK_CATALOG
      : MOCK_CATALOG.map(cat => ({
          ...cat,
          subCategories: cat.subCategories.map(sub => ({
            ...sub,
            items: sub.items.filter(item => item.status === statusFilter),
          })),
        })).filter(cat => cat.subCategories.some(sub => sub.items.length > 0))

  const searchedCatalog =
    searchQuery.trim() === ''
      ? filteredCatalog
      : filteredCatalog
          .map(cat => ({
            ...cat,
            subCategories: cat.subCategories.map(sub => ({
              ...sub,
              items: sub.items.filter(item =>
                [item.name, item.sku, item.barcode].some(field =>
                  field.toLowerCase().includes(searchQuery.toLowerCase()),
                ),
              ),
            })),
          }))
          .filter(cat => cat.subCategories.some(sub => sub.items.length > 0))

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={onSidebarToggle}
        activeItem="menu"
        onNavigate={onNavigate}
        storeLogo={storeLogo}
        storeName={storeName}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Page header ── */}
        <header
          className="bg-white shrink-0 px-10 pt-6 pb-4 flex flex-col gap-5 z-20"
          style={{
            boxShadow:
              '0px 1px 2px rgba(0,0,0,0.03), 0px 1px 6px rgba(0,0,0,0.02), 0px 2px 4px rgba(0,0,0,0.02)',
          }}
        >
          {/* ── Row 1: Title + Brand/Branch ── */}
          <div className="flex items-center justify-between h-[38px]">
            <div className="flex items-center gap-3">
              <h1
                className="text-[30px] font-extrabold leading-[38px] tracking-[-0.5px] whitespace-nowrap"
                style={{ color: 'rgba(0,0,0,0.88)' }}
              >
                Catalog
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Replay guide */}
              {!spotlight.isActive && (
                <Button
                  type="default"
                  size="middle"
                  icon={<RotateCcw size={14} />}
                  onClick={handleReplay}
                >
                  Replay guide
                </Button>
              )}

              {/* Brand/Branch — fancyShadow (default) */}
              <StatusSegmented
                options={[
                  { label: 'Brand', value: 'Brand' },
                  { label: 'Branch', value: 'Branch' },
                ]}
                value={branchView}
                onChange={handleBranchChange}
                dataTourMap={{ Branch: 'branch-switcher' }}
                dataOnboardingMap={{ Branch: 'branch-switcher' }}
              />

              {/* All branches — disabled input */}
              <div
                className="flex items-center h-[36px] rounded-lg px-3 w-[200px] gap-2"
                style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
              >
                <span
                  className="flex-1 text-sm font-normal truncate"
                  style={{ color: 'rgba(0,0,0,0.35)' }}
                >
                  All branches
                </span>
                <Info size={16} style={{ color: 'rgba(0,0,0,0.25)' }} className="shrink-0" />
              </div>
            </div>
          </div>

          {/* ── Tab section ── */}
          <div className="flex flex-col gap-3">
            {/* Row 2: Overview / Choice Groups */}
            <Tabs
              activeKey={activeMainTab}
              onChange={setActiveMainTab}
              items={mainTabItems}
              tabBarStyle={{ marginBottom: 0 }}
            />

            {/* Row 3: Status segmented + action buttons */}
            <div className="flex items-center justify-between">
              {/* Status filter — boxShadowSecondary */}
              <span data-tour="status-tabs" data-onboarding="tab-bar">
                <StatusSegmented
                  options={statusOptions}
                  value={statusFilter}
                  onChange={val => handleStatusChange(val as StatusFilter)}
                  activeShadow={STATUS_SEGMENTED_SHADOW}
                  dataTourMap={{ inactive: 'inactive-tab', rejected: 'rejected-tab' }}
                  dataOnboardingMap={{ rejected: 'tab-rejected' }}
                />
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:brightness-95"
                  style={{ backgroundColor: '#f6f6f6', border: '1px solid #f6f6f6' }}
                  aria-label="Download"
                >
                  <Download size={16} style={{ color: 'rgba(0,0,0,0.65)' }} />
                </button>

                <span data-tour="bulk-update-btn" data-onboarding="bulk-update-btn" onClick={handleBulkClick}>
                  <Dropdown
                    menu={{
                      items: BULK_KEYS.map(key => ({
                        key,
                        label: BULK_LABELS[key],
                        onClick: () => setBulkModalOpen(true),
                      })),
                    }}
                    trigger={['click']}
                  >
                    <Button type="default" size="middle" icon={<Pencil size={16} />}>
                      <span className="flex items-center gap-2">
                        Bulk Update <ChevronDown size={16} />
                      </span>
                    </Button>
                  </Dropdown>
                </span>

                <Dropdown menu={{ items: ADD_NEW_ITEMS }} trigger={['click']}>
                  <Button
                    type="primary"
                    size="middle"
                    icon={<Plus size={16} />}
                    style={{ backgroundColor: '#d90217', borderColor: '#d90217' }}
                  >
                    <span className="flex items-center gap-2">
                      Add New <ChevronDown size={16} />
                    </span>
                  </Button>
                </Dropdown>
              </div>
            </div>

            {/* Row 4: Search + filters | right controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Dynamic Search */}
                <div
                  className="flex items-stretch h-8 rounded-lg overflow-hidden"
                  style={{ backgroundColor: '#f6f6f6', width: 379 }}
                >
                  {/* Smart tab — left radius 12px per Figma borderradiuslg */}
                  <button
                    className="flex items-center shrink-0 text-sm font-normal border-r py-2 transition-colors hover:bg-black/5"
                    style={{
                      paddingLeft: 16,
                      paddingRight: 16,
                      gap: 8,
                      borderColor: 'rgba(0,0,0,0.06)',
                      color: 'rgba(0,0,0,0.88)',
                      background: 'transparent',
                      borderRadius: '12px 0 0 12px',
                    }}
                  >
                    Smart <ChevronDown size={12} />
                  </button>

                  <div className="flex items-center gap-2 px-3 flex-1">
                    <Search size={16} style={{ color: 'rgba(0,0,0,0.45)' }} className="shrink-0" />
                    <input
                      placeholder="Search SKU, barcode, name..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="bg-transparent outline-none text-sm flex-1"
                      style={{ border: 'none', color: 'rgba(0,0,0,0.88)' }}
                    />
                  </div>
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-2">
                  <FilterChip>Out of stock</FilterChip>
                  <FilterChip>Low stock</FilterChip>
                  <FilterChip>Best Selling</FilterChip>
                  <FilterChip>In promo</FilterChip>

                  <Tooltip
                    title="Filter your catalog by stock status, performance, or promotions to find products faster."
                    placement="bottom"
                  >
                    <button
                      className="flex items-center h-8 rounded-lg border text-sm font-normal transition-colors hover:brightness-95"
                      style={{
                        backgroundColor: '#f6f6f6',
                        borderColor: '#d9d9d9',
                        color: 'rgba(0,0,0,0.88)',
                        paddingLeft: 12,
                        paddingRight: 8,
                        gap: 4,
                      }}
                    >
                      All Filters <ChevronDown size={16} />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:brightness-95"
                  style={{ backgroundColor: '#f6f6f6', border: '1px solid #f6f6f6' }}
                  aria-label="Sort"
                >
                  <ArrowUpDown size={16} style={{ color: 'rgba(0,0,0,0.65)' }} />
                </button>

                <div
                  className="flex items-center p-[3px] rounded-xl"
                  style={{ backgroundColor: '#f6f6f6', gap: 4 }}
                >
                  <button
                    className="flex items-center justify-center px-2 py-1 rounded-lg bg-white"
                    style={{ boxShadow: '0px 1px 4px rgba(0,0,0,0.08), 0px 1px 2px rgba(0,0,0,0.04)' }}
                    aria-label="Grid view"
                  >
                    <LayoutGrid size={16} style={{ color: 'rgba(0,0,0,0.65)' }} />
                  </button>
                  <button
                    className="flex items-center justify-center px-2 py-1 rounded-lg"
                    aria-label="List view"
                  >
                    <List size={16} style={{ color: 'rgba(0,0,0,0.35)' }} />
                  </button>
                </div>

                <Button
                  type="default"
                  size="middle"
                  onClick={() => tableRef.current?.collapseAll()}
                >
                  <span className="flex items-center gap-2">
                    Collapse All <ChevronDown size={16} />
                  </span>
                </Button>
              </div>
            </div>
          </div>

        </header>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">
        <div className="px-10 pt-6 pb-6 flex flex-col gap-6" style={{ position: 'relative' }}>
          <DevStateOverlay state={forcedState} />

          {/* ── Announcement banner ── */}
          {!spotlight.isActive && isBannerVisible && (
            <div
              className="flex items-center justify-between rounded-2xl px-6 py-5 overflow-hidden shrink-0"
              style={{
                backgroundColor: '#dafffc',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center shrink-0 rounded-full"
                  style={{ width: 48, height: 48, backgroundColor: 'rgba(33,209,194,0.2)' }}
                >
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{ width: 36, height: 36, backgroundColor: 'rgba(33,209,194,0.44)' }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full overflow-hidden"
                      style={{ width: 24, height: 24, backgroundColor: '#21d1c2', padding: 6 }}
                    >
                      <div className="rounded-full" style={{ width: 12, height: 12, backgroundColor: 'white' }} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 max-w-[536px]">
                  <span className="text-base font-semibold leading-6" style={{ color: 'rgba(0,0,0,0.88)' }}>
                    Catalog 2.0 launch
                  </span>
                  <span className="text-sm font-normal leading-[22px]" style={{ color: 'rgba(0,0,0,0.88)' }}>
                    Your catalog just got an upgrade — new filters, bulk updates, and issues flagging
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleReplay}
                  style={{ backgroundColor: '#13c2c2', borderColor: '#13c2c2', borderRadius: 12, minWidth: 80 }}
                >
                  Take a tour
                </Button>

                <button
                  onClick={() => setIsBannerVisible(false)}
                  aria-label="Закрыть баннер"
                  className="flex items-center justify-center shrink-0 rounded-[12px] transition-colors hover:brightness-95"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: 'rgba(0,0,0,0.06)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <X size={18} style={{ color: 'rgba(0,0,0,0.45)' }} />
                </button>
              </div>
            </div>
          )}

          <CatalogTable
            ref={tableRef}
            categories={searchedCatalog}
            onStockClick={handleStockClick}
            onIssuesClick={handleIssuesClick}
            isRejectedView={statusFilter === 'rejected'}
            isBrandView={branchView === 'Brand'}
          />
        </div>
        </div>
      </div>

      {/* ── Spotlight flow ── */}
      <SpotlightFlow
        isActive={spotlight.isActive}
        step={spotlight.step}
        targetRect={spotlight.targetRect}
        stepIndex={spotlight.stepIndex}
        totalSteps={spotlight.totalSteps}
        showSkipConfirm={spotlight.showSkipConfirm}
        next={spotlight.next}
        back={spotlight.back}
        requestSkip={spotlight.requestSkip}
        confirmSkip={() => { spotlight.confirmSkip(); checklist.hideChecklist() }}
        cancelSkip={spotlight.cancelSkip}
      />

      {/* ── Onboarding checklist ── */}
      {checklist.isVisible && (
        <OnboardingChecklist
          itemStates={checklist.itemStates}
          completedCount={checklist.completedCount}
          totalCount={checklist.totalCount}
          isCompleted={checklist.isCompleted}
          isExpanded={checklist.isExpanded}
          onToggleExpanded={() => checklist.setExpanded(!checklist.isExpanded)}
          onItemClick={id => { checklist.markComplete(id); spotlight.jumpToStep(CHECKLIST_TO_STEP[id]) }}
          activeItemId={spotlight.isActive ? STEP_TO_CHECKLIST[spotlight.stepIndex] ?? null : null}
          spotlightActive={spotlight.isActive}
        />
      )}

      {/* ── Bulk Update modal ── */}
      <BulkUpdateModal open={bulkModalOpen} onClose={() => setBulkModalOpen(false)} />
    </div>
  )
})

// FilterChip: Select-like with trailing chevron per Figma
function FilterChip({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip
      title="Filter your catalog by stock status, performance, or promotions to find products faster."
      placement="bottom"
    >
      <button
        className="flex items-center gap-3 h-8 text-sm font-normal transition-colors hover:bg-gray-50 rounded-lg border"
        style={{
          backgroundColor: 'white',
          borderColor: '#d9d9d9',
          color: 'rgba(0,0,0,0.88)',
          paddingLeft: 12,
          paddingRight: 8,
        }}
      >
        {children}
        <ChevronDown size={16} style={{ color: 'rgba(0,0,0,0.45)' }} />
      </button>
    </Tooltip>
  )
}
