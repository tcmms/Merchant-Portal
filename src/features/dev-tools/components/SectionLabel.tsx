import type { ReactNode } from 'react'

interface SectionLabelProps {
  children: ReactNode
  hint?: string
}

export function SectionLabel({ children, hint }: SectionLabelProps) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'rgba(0,0,0,0.35)',
      }}>
        {children}
      </div>
      {hint && (
        <div style={{
          marginTop: 4,
          fontSize: 11,
          lineHeight: '15px',
          color: 'rgba(0,0,0,0.45)',
        }}>
          {hint}
        </div>
      )}
    </div>
  )
}
