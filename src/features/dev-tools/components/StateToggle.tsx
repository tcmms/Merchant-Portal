import type { ForcedState } from '../types'

interface StateToggleProps {
  value: ForcedState
  onChange: (state: ForcedState) => void
}

const OPTIONS: { value: ForcedState; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'loading', label: 'Loading' },
  { value: 'error', label: 'Error' },
]

export function StateToggle({ value, onChange }: StateToggleProps) {
  return (
    <div style={{ display: 'flex', gap: 3, background: '#f0f0f0', padding: 3, borderRadius: 8 }}>
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1,
            padding: '5px 4px',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: value === opt.value ? 600 : 400,
            background: value === opt.value ? 'white' : 'transparent',
            color: value === opt.value ? 'rgba(0,0,0,0.88)' : 'rgba(0,0,0,0.45)',
            boxShadow: value === opt.value ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 150ms',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
