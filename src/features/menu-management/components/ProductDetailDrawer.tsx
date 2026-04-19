import React, { useState } from 'react'
import { Drawer, Button, Breadcrumb, Skeleton } from '@tcmms/flock-ds'
import { ArrowRight, ExternalLink, ImageOff, X } from 'lucide-react'
import type { CatalogItem } from '../types/catalog'
import { StatusBadge } from './StatusBadge'

export interface ProductDetailDrawerProps {
  item: CatalogItem | null
  onClose: () => void
  onEdit?: (item: CatalogItem) => void
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(price)
  } catch {
    return `${price.toFixed(2)} ${currency}`
  }
}

// ─── Product thumbnail ─────────────────────────────────────────────────────────

interface ProductImageProps {
  src: string
  alt: string
}

function ProductImage({ src, alt }: ProductImageProps) {
  const [hasError, setHasError] = useState(false)
  const showFallback = !src || hasError

  if (showFallback) {
    return (
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 64,
          height: 64,
          borderRadius: 8,
          backgroundColor: 'rgba(0,0,0,0.04)',
        }}
        aria-label="No product image"
      >
        <ImageOff size={20} style={{ color: 'rgba(0,0,0,0.2)' }} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="shrink-0 object-cover"
      style={{ width: 64, height: 64, borderRadius: 8, display: 'block' }}
      onError={() => setHasError(true)}
    />
  )
}

// ─── Skeleton rows ─────────────────────────────────────────────────────────────
// Placeholder for the detail section while data loads.
// isLoading is always false today — structure is wired for future use.

function SkeletonRows() {
  return (
    <div className="flex flex-col gap-3 mt-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton
          key={i}
          active
          title={false}
          paragraph={{ rows: 1, width: '100%' }}
        />
      ))}
    </div>
  )
}

// ─── Detail row ────────────────────────────────────────────────────────────────
// Label and value side-by-side, each flex-1. No separator.

interface DetailRowProps {
  label: string
  value: React.ReactNode
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="flex-1 text-sm leading-[22px]" style={{ color: 'rgba(0,0,0,0.45)' }}>
        {label}
      </span>
      <span className="flex-1 text-sm leading-[22px]" style={{ color: 'rgba(0,0,0,0.88)' }}>
        {value}
      </span>
    </div>
  )
}

// ─── Custom drawer header ──────────────────────────────────────────────────────
// Owns the full header row: X (left) + Breadcrumb "Catalog / [name]".
// closable={false} on the Drawer so AntD doesn't render its own X.
// Negative margin bleeds the div edge-to-edge past Drawer's header padding,
// preventing a double border. The single border lives here.

interface DrawerHeaderProps {
  item: CatalogItem
  onClose: () => void
}

function DrawerHeader({ item, onClose }: DrawerHeaderProps) {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 12,
        padding: '12px 20px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        backgroundColor: '#ffffff',
        fontWeight: 'normal',
      }}
    >
      {/* Close — 20×20, X left-anchored per spec */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex items-center justify-center shrink-0 rounded-[4px] hover:bg-black/5 transition-colors"
        style={{ width: 20, height: 20, color: 'rgba(0,0,0,0.45)' }}
      >
        <X size={16} strokeWidth={1.5} />
      </button>

      {/* Breadcrumb: "Catalog / [product name]" */}
      <div className="min-w-0 flex-1 overflow-hidden">
        <Breadcrumb
          items={[
            { title: 'Catalog' },
            {
              title: (
                <span className="truncate block max-w-[260px]" title={item.name}>
                  {item.name}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}

// ─── Drawer ────────────────────────────────────────────────────────────────────

export function ProductDetailDrawer({ item, onClose, onEdit }: ProductDetailDrawerProps) {
  // isLoading is always false today; wire-point for future data-fetching state.
  const isLoading = false
  const isRejected = item?.status === 'rejected'

  return (
    <Drawer
      open={!!item}
      onClose={onClose}
      width={400}
      destroyOnClose
      // We own the full header layout — AntD's close button is suppressed.
      closable={false}
      title={item ? <DrawerHeader item={item} onClose={onClose} /> : null}
      styles={{
        header: {
          // Remove AntD's built-in header border so DrawerHeader's single
          // border doesn't produce a double line.
          padding: 0,
          borderBottom: 'none',
        },
        footer: {
          padding: '12px 24px',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          background: 'white',
        },
      }}
      footer={
        item ? (
          <div className="flex gap-3">
            {/* Secondary CTA — opens product on consumer site */}
            <Button
              type="default"
              icon={<ExternalLink size={14} />}
              iconPosition="end"
              onClick={() => window.open(`https://snoonu.com/product/${item.id}`, '_blank')}
            >
              View in Snoonu
            </Button>

            {/* Primary CTA — triggers edit flow, flex-1 to fill remaining width */}
            <Button
              type="primary"
              icon={<ArrowRight size={14} />}
              iconPosition="end"
              style={{
                flex: 1,
                backgroundColor: '#E31D1C',
                borderColor: '#E31D1C',
              }}
              onClick={() => onEdit?.(item)}
            >
              Edit product
            </Button>
          </div>
        ) : null
      }
    >
      {item && (
        <div className="flex flex-col">
          {/* ── Section 1: Product hero ─────────────────────────────────── */}
          <div className="flex items-start gap-4">
            <ProductImage src={item.imageUrl} alt={item.name} />
            <div className="flex flex-col min-w-0 flex-1">
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  lineHeight: '26px',
                  color: 'rgba(0,0,0,0.88)',
                }}
              >
                {item.name}
              </p>
              <div style={{ marginTop: 6 }}>
                <StatusBadge status={item.status} />
              </div>
              <p
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  lineHeight: '20px',
                  color: 'rgba(0,0,0,0.45)',
                }}
              >
                {item.sku}
              </p>
            </div>
          </div>

          {/* ── Section 2: Rejection alert (conditional) ────────────────── */}
          {isRejected && (
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                padding: '20px 16px',
                backgroundColor: '#ffeeee',
                border: '1px solid rgba(255, 85, 88, 0.1)',
                borderRadius: 12,
              }}
              role="alert"
              aria-label="Product rejection reason"
            >
              {/* Text block */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 500, lineHeight: '16px', color: 'rgba(0,0,0,0.45)' }}>
                  PRODUCT REJECTED
                </p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: '24px', color: 'rgba(0,0,0,0.88)' }}>
                  {item.rejectionShortReason ?? 'Product violation'}
                </p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 400, lineHeight: '22px', color: 'rgba(0,0,0,0.88)' }}>
                  {item.rejectionReason ?? 'Contact support for details.'}
                </p>
              </div>

              {/* Actions row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className="flex items-center gap-1"
                  style={{ fontSize: 14, fontWeight: 500, color: '#E31D1C', background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: '22px' }}
                  onClick={() => window.open('https://tcmms.github.io/mp-documentation-web/', '_blank', 'noopener,noreferrer')}
                >
                  How to fix this <ExternalLink size={14} />
                </button>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => onEdit?.(item)}
                  icon={<ArrowRight size={14} />}
                  iconPlacement="end"
                  style={{ backgroundColor: '#E31D1C', borderColor: '#E31D1C', borderRadius: 8 }}
                >
                  Edit Item
                </Button>
              </div>
            </div>
          )}

          {/* ── Section 3: Product info ─────────────────────────────────── */}
          <p
            style={{
              marginTop: 20,
              marginBottom: 12,
              fontSize: 16,
              fontWeight: 600,
              lineHeight: '24px',
              color: 'rgba(0,0,0,0.88)',
            }}
          >
            Product Info
          </p>

          {/* Detail rows — isLoading always false; SkeletonRows wired for future */}
          {isLoading ? (
            <SkeletonRows />
          ) : (
            <div className="flex flex-col gap-3">
              <DetailRow label="SKU" value={item.sku} />
              <DetailRow label="Barcode" value={item.barcode} />
              <DetailRow label="Price" value={formatPrice(item.price, item.currency)} />
              <DetailRow label="Stock" value={`${item.stock} units`} />
              <DetailRow label="Prep. time" value={`${item.prepTime} min`} />
              {item.category && <DetailRow label="Category" value={item.category} />}
            </div>
          )}
        </div>
      )}
    </Drawer>
  )
}
