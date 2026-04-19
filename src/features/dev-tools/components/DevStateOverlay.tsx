import { Skeleton } from 'antd'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@tcmms/flock-ds'
import type { ForcedState } from '../types'

interface DevStateOverlayProps {
  state: ForcedState
}

export function DevStateOverlay({ state }: DevStateOverlayProps) {
  if (state === 'default') return null

  if (state === 'loading') {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'white', padding: 32 }}>
        <Skeleton active paragraph={{ rows: 8 }} />
        <div style={{ marginTop: 24 }}>
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 8,
      background: 'white',
    }}>
      <AlertTriangle size={40} style={{ color: '#ff4d4f' }} />
      <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.88)', marginTop: 4 }}>
        Something went wrong
      </div>
      <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', marginBottom: 12 }}>
        Simulated error state for demo purposes.
      </div>
      <Button type="default">Retry</Button>
    </div>
  )
}
