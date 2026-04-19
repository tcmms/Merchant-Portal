interface SpotlightOverlayProps {
  targetRect: DOMRect
}

const PADDING = 6
const RADIUS = 8

export function SpotlightOverlay({ targetRect }: SpotlightOverlayProps) {
  return (
    <>
      {/* Click blocker — captures all pointer events */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9000 }}
        aria-hidden="true"
      />

      {/* Visual overlay with cutout hole via box-shadow */}
      <div
        style={{
          position: 'fixed',
          top: targetRect.top - PADDING,
          left: targetRect.left - PADDING,
          width: targetRect.width + PADDING * 2,
          height: targetRect.height + PADDING * 2,
          borderRadius: RADIUS,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
          zIndex: 9000,
          pointerEvents: 'none',
          transition: 'top 400ms ease, left 400ms ease, width 400ms ease, height 400ms ease',
        }}
        aria-hidden="true"
      />
    </>
  )
}
