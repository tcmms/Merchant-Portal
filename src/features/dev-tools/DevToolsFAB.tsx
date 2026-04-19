import { Wrench } from 'lucide-react'
import { useDevTools } from './DevToolsContext'

export function DevToolsFAB() {
  const { isOpen, toggle } = useDevTools()
  return (
    <button
      onClick={toggle}
      aria-label="Toggle DevTools"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: isOpen ? '#161515' : 'rgba(22,21,21,0.8)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        transition: 'background 150ms',
      }}
    >
      <Wrench size={17} style={{ color: 'white' }} />
    </button>
  )
}
