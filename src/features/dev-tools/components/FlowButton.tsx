import { useState } from 'react'

interface FlowButtonProps {
  label: string
  description?: string
  onClick: () => void
  disabled?: boolean
}

export function FlowButton({ label, description, onClick, disabled }: FlowButtonProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
      style={{
        width: '100%',
        padding: description ? '10px 12px' : '8px 12px',
        background: disabled ? '#f5f5f5' : hovered ? '#fafafa' : 'white',
        border: `1px solid ${hovered && !disabled ? '#d9d9d9' : '#e8e8e8'}`,
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        transition: 'background 150ms, border-color 150ms',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: disabled ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.88)',
          lineHeight: '18px',
        }}
      >
        {label}
      </span>
      {description && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 400,
            color: disabled ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.45)',
            lineHeight: '15px',
          }}
        >
          {description}
        </span>
      )}
    </button>
  )
}
