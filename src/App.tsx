import { useRef, useState } from 'react'
import { LiveOrdersPage } from './features/live-orders'
import { CatalogPage } from './features/menu-management'
import { DevToolsPanel, DevToolsFAB } from './features/dev-tools'
import type { ForcedState, LiveOrdersDevHandle, CatalogDevHandle } from './features/dev-tools/types'

type Page = 'live-orders' | 'menu-management'

const STORE_LOGO = 'https://placehold.co/64x64/cc0000/ffffff?text=KFC'
const STORE_NAME = 'KFC'

export default function App() {
  const [activePage, setActivePage] = useState<Page>('live-orders')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [forcedState, setForcedState] = useState<ForcedState>('default')

  const liveOrdersRef = useRef<LiveOrdersDevHandle>(null)
  const catalogRef = useRef<CatalogDevHandle>(null)

  const handleNavigate = (id: string) => {
    setForcedState('default')
    if (id === 'live-orders') setActivePage('live-orders')
    else if (id === 'menu') setActivePage('menu-management')
  }

  const handleDevNavigate = (page: Page) => {
    setForcedState('default')
    setActivePage(page)
  }

  const activeRef = activePage === 'live-orders' ? liveOrdersRef : catalogRef

  const sharedSidebarProps = {
    sidebarCollapsed,
    onSidebarToggle: () => setSidebarCollapsed(c => !c),
    storeLogo: STORE_LOGO,
    storeName: STORE_NAME,
    onNavigate: handleNavigate,
  }

  return (
    <>
      {activePage === 'menu-management' && (
        <CatalogPage ref={catalogRef} forcedState={forcedState} {...sharedSidebarProps} />
      )}
      {activePage === 'live-orders' && (
        <LiveOrdersPage ref={liveOrdersRef} forcedState={forcedState} {...sharedSidebarProps} />
      )}

      {import.meta.env.DEV && (
        <>
          <DevToolsFAB />
          <DevToolsPanel
            activePage={activePage}
            forcedState={forcedState}
            onForcedStateChange={setForcedState}
            activeRef={activeRef}
            onNavigate={handleDevNavigate}
          />
        </>
      )}
    </>
  )
}
