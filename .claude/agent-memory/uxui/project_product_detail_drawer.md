---
name: ProductDetailDrawer — full redesign (April 2026)
description: Architecture decisions, layout spec, and all constraints for ProductDetailDrawer in menu-management after full spec-driven redesign
type: project
---

Redesigned April 2026 to match detailed written spec (no Figma node this time).

- File: `src/features/menu-management/components/ProductDetailDrawer.tsx`
- Call site: `CatalogTable.tsx` — passes `item` and `onClose`; `onEdit` optional

**Props interface (exported, consumed by CatalogTable):**
`{ item: CatalogItem | null, onClose: () => void, onEdit?: (item: CatalogItem) => void }`

**Layout spec:**

- Drawer width: 400px, `destroyOnClose`, `closable={false}`
- Header (DrawerHeader sub-component):
  - `styles.header={{ padding: 0, borderBottom: 'none' }}` strips AntD's own header border
  - DrawerHeader div: `margin: '-16px -24px 0'` bleeds edge-to-edge past AntD padding
  - Single `1px solid rgba(0,0,0,0.06)` border lives on the DrawerHeader div
  - X button: lucide `X` 16px, strokeWidth 1.5, 20×20 container, `rgba(0,0,0,0.45)`, `hover:bg-black/5`
  - Breadcrumb: `items={[{ title: 'Catalog' }, { title: <truncated name> }]}`

- Body (24px default Drawer padding):
  - ProductImage: 200px h, object-cover, borderRadius 8px, ImageOff fallback on error/missing
  - Name: 20px/700/lh-28px/`rgba(0,0,0,0.88)`, mt-4
  - StatusBadge: mt-6 (6px)
  - SKU label: 12px/`rgba(0,0,0,0.45)`, mt-4 (4px)
  - Rejection banner: custom JSX (not DS Alert), mt-16, only when status === 'rejected'
    - Container: `flex items-start gap-[12px] px-[24px] py-[20px] bg-[rgba(255,85,88,0.1)] border border-[rgba(255,85,88,0.1)] rounded-[12px]`
    - Icon: 24×24 `#FF5558` solid circle (`rounded-full`), white lucide `X` size=14 strokeWidth=2.5 inside; `aria-hidden`
    - Title: 16px / weight 400 / lh 24px / `rgba(0,0,0,0.88)` — "Product rejected"
    - Description: 14px / weight 400 / lh 22px / `rgba(0,0,0,0.88)` — `item.rejectionReason ?? 'Contact support for details.'`
    - Text wrapper: `flex-col gap-[8px]`, `flex-1 min-w-0`
    - Container has `role="alert" aria-label="Product rejection reason"`
    - Figma node: 508:37317 in file bdJEiNY9sv5YVuuBVJcNQt
  - Section label "PRODUCT DETAILS": 11px/600/ls-0.08em/`rgba(0,0,0,0.35)`, mt-20 mb-8, uppercase
  - DetailRow: minHeight 48px, label `text-xs rgba(0,0,0,0.45)`, value `text-sm font-semibold rgba(0,0,0,0.88)`
  - Rows: SKU, Barcode, Price, Stock (`${n} units`), Prep. time (`${n} min`), Category (`??  '—'`)
  - Row separator: `1px solid rgba(0,0,0,0.06)` except isLast (Category row)

- Footer (`styles.footer={{ padding: '12px 24px', borderTop: '1px solid rgba(0,0,0,0.06)', background: 'white' }}`):
  - Two buttons in `flex gap-3`
  - "View in Snoonu": `type="default"`, `icon=<ExternalLink size={14}>` `iconPosition="end"`, opens `https://snoonu.com/product/${item.id}`
  - "Edit product": `type="primary"`, `style={{ flex: 1, backgroundColor: '#E31D1C', borderColor: '#E31D1C' }}`, `icon=<ArrowRight size={14}>` `iconPosition="end"`, calls `onEdit?.(item)`

**Skeleton wiring:**
- `isLoading = false` (hardcoded — no loading prop in interface yet)
- `SkeletonRows` sub-component renders 6x DS `<Skeleton active title={false} paragraph={{ rows: 1 }}>` 
- Conditional `{isLoading ? <SkeletonRows /> : <detail rows />}` is in place for future use

**Architectural decisions:**

1. `closable={false}` + DrawerHeader owns the X — left-anchored per spec
2. Negative margin `'-16px -24px 0'` bleeds header past AntD's header padding
3. `styles.header={{ padding: 0, borderBottom: 'none' }}` prevents double border
4. `ProductImage` is a sub-component with `useState(hasError)` — ImageOff fallback on load error
5. `isLoading` wire-point exists as `const isLoading = false` — flip to prop when API is wired
6. `DetailRow` uses `minHeight: 48px` + conditional `borderBottom` (not padding-only) — enables correct height even for short values
7. Footer uses two-button layout (secondary + primary) — spec requires both "View in Snoonu" and "Edit product"
8. `destroyOnClose` kept — resets `useState(hasError)` in ProductImage between products

**Why:** Full spec-driven redesign. Previous version lacked hero image, two-button footer, correct section label spec, and skeleton wiring.

**How to apply:** When edit route is built, pass `onEdit={(item) => navigate(\`/products/\${item.id}/edit\`)}`. When loading state exists, add `isLoading` to `ProductDetailDrawerProps` and remove the hardcoded `false`.
