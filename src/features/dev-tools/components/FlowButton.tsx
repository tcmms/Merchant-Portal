interface FlowButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export function FlowButton({ label, onClick, disabled }: FlowButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '8px 12px',
        background: disabled ? '#f5f5f5' : 'white',
        border: '1px solid #e8e8e8',
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 13,
        fontWeight: 500,
        color: disabled ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.88)',
        textAlign: 'left',
        transition: 'background 150ms, color 150ms',
      }}
    >
      {label}
    </button>
  )
}
