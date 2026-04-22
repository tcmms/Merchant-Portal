import { Notification } from '@tcmms/flock-ds'

// Dark toast that slides in from the bottom-right corner.
// Wraps antd notification with flock-ds design tokens and dark styling.

type Variant = 'info' | 'success' | 'warning' | 'error'

let configured = false
function ensureConfigured() {
  if (configured) return
  Notification.config({ placement: 'bottomRight', bottom: 24, duration: 4 })
  configured = true
}

const toastStyle: React.CSSProperties = {
  background: 'rgba(0, 0, 0, 0.88)',
  color: '#fff',
  borderRadius: 8,
  boxShadow:
    '0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)',
}

const messageStyle: React.CSSProperties = {
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '22px',
  marginBottom: 0,
}

const descriptionStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.65)',
  fontSize: 13,
  lineHeight: '20px',
}

interface ToastArgs {
  message: React.ReactNode
  description?: React.ReactNode
  duration?: number
}

function show(variant: Variant, args: string | ToastArgs) {
  ensureConfigured()
  const payload: ToastArgs = typeof args === 'string' ? { message: args } : args
  Notification[variant]({
    message: <span style={messageStyle}>{payload.message}</span>,
    description: payload.description
      ? <span style={descriptionStyle}>{payload.description}</span>
      : undefined,
    duration: payload.duration ?? 4,
    placement: 'bottomRight',
    style: toastStyle,
    closeIcon: null,
  })
}

export const toast = {
  info: (args: string | ToastArgs) => show('info', args),
  success: (args: string | ToastArgs) => show('success', args),
  warning: (args: string | ToastArgs) => show('warning', args),
  error: (args: string | ToastArgs) => show('error', args),
}
