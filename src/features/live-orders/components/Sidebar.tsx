import { Sidebar as FlockSidebar } from '@tcmms/flock-ds'

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
  activeItem?: string
  onNavigate?: (id: string) => void
  storeLogo?: string
  storeName?: string
  merchantEmail?: string
  variant?: 'dark' | 'light'
  onBrandClick?: () => void
}

export function Sidebar({
  isCollapsed,
  onToggle,
  activeItem = 'live-orders',
  onNavigate,
  storeLogo,
  storeName = 'Carrefour',
  merchantEmail = 'shopperadmin@snoonu.com',
  variant,
  onBrandClick,
}: SidebarProps) {
  return (
    <FlockSidebar
      isCollapsed={isCollapsed}
      onToggle={onToggle}
      activeItem={activeItem}
      onItemClick={onNavigate}
      storeLogo={storeLogo}
      storeName={storeName}
      merchantEmail={merchantEmail}
      variant={variant}
      onBrandClick={onBrandClick}
    />
  )
}
