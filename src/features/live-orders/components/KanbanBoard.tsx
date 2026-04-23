import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from '../utils/toast'
import { KanbanCard } from './KanbanCard'
import { RejectOrderModal } from './RejectOrderModal'
import { Inbox, ChefHat, PackageCheck, Bike, Archive, Clock, ChevronUp, ChevronDown, AlertCircle, AlertTriangle, X } from 'lucide-react'
import type { Order, OrderStatus } from '../types'
import { useClock, getSla } from './kanbanHelpers'

export interface KanbanBoardHandle {
  forceFirstScheduledDue: () => boolean
  forceFirstScheduledOverdue: () => boolean
  spawnDueScheduled: () => void
  enterSingleOrderDemo: () => void
  enterOwnDeliveryDemo: () => void
  enterPremiumPriorityDemo: () => void
  spawnPremiumPriorityOrder: () => void
  spawnCustomerCancelledOrder: () => void
  dismissCancellation: (id: string) => void
  resetOverrides: () => void
  acceptOrder: (id: string) => void
  startPreparation: (id: string) => void
  markReady: (id: string) => void
  markPickedUp: (id: string) => void
  markDelivered: (id: string) => void
  cancelOrder: (id: string) => void
  openRejectModal: (id: string) => void
}

interface KanbanBoardProps {
  orders: Order[]
  onSelectOrder?: (order: Order) => void
  boardRef?: React.MutableRefObject<KanbanBoardHandle | null>
}

type DoneTabId = 'ready' | 'in_delivery'

interface PickupOverride {
  pickupTime: Date
}

const SCHEDULED_THRESHOLD_MIN = 30

export function isScheduledIncoming(o: Order, now: number = Date.now()) {
  if (o.status !== 'needs_action' || !o.pickupTime) return false
  return (o.pickupTime.getTime() - now) / 60000 >= SCHEDULED_THRESHOLD_MIN
}

export function isScheduledDue(o: Order, now: number = Date.now()) {
  if (o.status !== 'scheduled' || !o.pickupTime) return false
  return (o.pickupTime.getTime() - now) / 60000 <= SCHEDULED_THRESHOLD_MIN
}

export function isScheduledOverdue(o: Order, now: number = Date.now()) {
  if (o.status !== 'scheduled' || !o.pickupTime) return false
  return o.pickupTime.getTime() < now
}

export function KanbanBoard({ orders, onSelectOrder, boardRef }: KanbanBoardProps) {
  const [showScheduled, setShowScheduled] = useState(false)
  const [doneTab, setDoneTab] = useState<DoneTabId>('ready')
  const [overrides, setOverrides] = useState<Record<string, OrderStatus>>({})
  const [pickupOverrides, setPickupOverrides] = useState<Record<string, PickupOverride>>({})
  const [extraOrders, setExtraOrders] = useState<Order[]>([])
  const [hideBaseOrders, setHideBaseOrders] = useState(false)
  const [completedIds, setCompletedIds] = useState<string[]>(() => ['rp-1', 'rp-5', 'rp-7', 'rp-9', 'rp-11'])
  const [completedOpen, setCompletedOpen] = useState(false)
  const [dismissedCancellationIds, setDismissedCancellationIds] = useState<string[]>([])
  const [dragZone, setDragZone] = useState<'progress' | 'ready' | 'completed' | null>(null)
  const [movedAt, setMovedAt] = useState<Record<string, number>>({})

  const clockTick = useClock(5000)

  const resolved = useMemo(() => {
    const all = hideBaseOrders ? [...extraOrders] : [...orders, ...extraOrders]
    return all.map((o) => {
      const status = overrides[o.id] ?? o.status
      const pickup = pickupOverrides[o.id]?.pickupTime ?? o.pickupTime
      return { ...o, status, pickupTime: pickup }
    })
  }, [orders, extraOrders, overrides, pickupOverrides, hideBaseOrders])

  // Keep a ref to latest resolved so delayed timers (demo promotion) see current state.
  const resolvedRef = useRef(resolved)
  resolvedRef.current = resolved

  // Promote the next non-due scheduled order into the due window. Returns the order or null.
  const promoteNextScheduled = () => {
    const target = resolvedRef.current
      .filter((o) => o.status === 'scheduled' && !isScheduledDue(o, Date.now()))
      .sort((a, b) =>
        (a.pickupTime?.getTime() ?? 0) - (b.pickupTime?.getTime() ?? 0),
      )[0]
    if (!target) return null
    setPickupOverrides((p) => ({
      ...p,
      [target.id]: { pickupTime: new Date(Date.now() + 20 * 60_000) },
    }))
    return target
  }

  // Push the topmost scheduled order into the overdue window (pickup in the past).
  const makeNextScheduledOverdue = () => {
    const target = resolvedRef.current
      .filter((o) => o.status === 'scheduled')
      .sort((a, b) =>
        (a.pickupTime?.getTime() ?? 0) - (b.pickupTime?.getTime() ?? 0),
      )[0]
    if (!target) return null
    setPickupOverrides((p) => ({
      ...p,
      [target.id]: { pickupTime: new Date(Date.now() - 5 * 60_000) },
    }))
    return target
  }

  const buckets = useMemo(() => {
    const newOrders: Order[] = []
    const scheduled: Order[] = []
    const inProgress: Order[] = []
    const ready: Order[] = []
    const inDelivery: Order[] = []
    const completed: Order[] = []

    const tickNow = clockTick
    for (const o of resolved) {
      if (completedIds.includes(o.id)) { completed.push(o); continue }
      if (o.status === 'cancelled') {
        // Customer-initiated cancellations surface in New until the merchant dismisses
        // them. Merchant-initiated cancellations (via RejectOrderModal) are dropped.
        if (o.cancelledBy === 'customer' && !dismissedCancellationIds.includes(o.id)) {
          newOrders.push(o)
        }
        continue
      }
      if (o.status === 'needs_action') {
        newOrders.push(o)
      } else if (o.status === 'scheduled') {
        // Auto-return to New when pickup time enters the due window.
        if (isScheduledDue(o, tickNow)) newOrders.push(o)
        else scheduled.push(o)
      } else if (o.status === 'preparing' || o.status === 'looking_for_driver') {
        inProgress.push(o)
      } else if (o.status === 'ready_for_pickup') {
        // Ready = kitchen's done, waiting for courier to pick up
        ready.push(o)
      } else if (o.status === 'in_delivery') {
        // Courier has picked up the order (Snoonu or own) — in transit to customer.
        inDelivery.push(o)
      }
    }

    // Newest first: recently moved/created orders sit on top of each column.
    // Sort key = last move timestamp, falling back to createdAt.
    const entryTime = (o: Order) => movedAt[o.id] ?? o.createdAt.getTime()
    const byEntryDesc = (a: Order, b: Order) => entryTime(b) - entryTime(a)
    // New column: overdue first (most urgent), then due-scheduled, then regular by entry.
    newOrders.sort((a, b) => {
      const aOver = isScheduledOverdue(a, tickNow)
      const bOver = isScheduledOverdue(b, tickNow)
      if (aOver && !bOver) return -1
      if (!aOver && bOver) return 1
      const aDue = a.status === 'scheduled'
      const bDue = b.status === 'scheduled'
      if (aDue && !bDue) return -1
      if (!aDue && bDue) return 1
      if (aDue && bDue) {
        return (a.pickupTime?.getTime() ?? 0) - (b.pickupTime?.getTime() ?? 0)
      }
      return byEntryDesc(a, b)
    })
    // Scheduled: nearest pickupTime first (most relevant to the kitchen)
    scheduled.sort((a, b) =>
      (a.pickupTime?.getTime() ?? a.createdAt.getTime()) -
      (b.pickupTime?.getTime() ?? b.createdAt.getTime()))
    inProgress.sort(byEntryDesc)
    ready.sort(byEntryDesc)
    inDelivery.sort(byEntryDesc)
    // Completed: newest on top (recent actions are more relevant to the kitchen)
    completed.sort((a, b) => {
      const ai = completedIds.indexOf(a.id)
      const bi = completedIds.indexOf(b.id)
      return ai - bi
    })

    return { newOrders, scheduled, inProgress, ready, inDelivery, completed }
  }, [resolved, completedIds, movedAt, clockTick, dismissedCancellationIds])

  const overdueOrders = useMemo(
    () => buckets.newOrders.filter((o) => isScheduledOverdue(o, clockTick)),
    [buckets.newOrders, clockTick],
  )

  const [preparingAlert, setPreparingAlert] = useState<{ customerName: string } | null>(null)
  const [scheduledAlert, setScheduledAlert] = useState<{ customerName: string; pickup: Date } | null>(null)
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null)
  const announcedDueIdsRef = useRef<Set<string>>(new Set())

  const stampMove = (id: string) => setMovedAt((p) => ({ ...p, [id]: Date.now() }))
  const handleAccept = (id: string) => {
    stampMove(id)
    const source = resolved.find((r) => r.id === id)
    if (!source) return
    // Scheduled-incoming (pickup in the future) → goes to Scheduled bucket, not Preparing.
    // Column stays on "New" — a banner announces the move so the user knows where it went.
    if (isScheduledIncoming(source) && source.pickupTime) {
      setOverrides((p) => ({ ...p, [id]: 'scheduled' }))
      setScheduledAlert({ customerName: formatShortName(source.customer.name), pickup: source.pickupTime })
      // Demo aid: 5s after accepting a scheduled-incoming, promote another scheduled order
      // into the due window. The due-prompt modal auto-fires via effect on state change.
      window.setTimeout(() => {
        promoteNextScheduled()
      }, 5000)
      return
    }
    setPreparingAlert({ customerName: formatShortName(source.customer.name) })
    setOverrides((p) => ({ ...p, [id]: 'preparing' }))
  }
  const handleStartPrep = (id: string) => {
    stampMove(id)
    const source = resolved.find((r) => r.id === id)
    if (source) setPreparingAlert({ customerName: formatShortName(source.customer.name) })
    setOverrides((p) => ({ ...p, [id]: 'preparing' }))
  }
  const handleReady = (id: string) => { stampMove(id); setOverrides((p) => ({ ...p, [id]: 'ready_for_pickup' })) }
  const handlePickedUp = (id: string) => { stampMove(id); setOverrides((p) => ({ ...p, [id]: 'in_delivery' })) }
  const handleDelivered = (id: string) => {
    stampMove(id)
    setCompletedIds((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 20))
    setCompletedOpen(true)
  }
  const handleCancel = (id: string) => {
    stampMove(id)
    setOverrides((p) => ({ ...p, [id]: 'cancelled' }))
  }

  // Simulate a real-time incoming scheduled order arriving 3 seconds after mount.
  // This gives kitchen staff a clean initial view (just the 2 live new orders),
  // then demonstrates the scheduled-incoming notification flow.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setExtraOrders((prev) => {
        // Skip if a scheduled incoming already exists (e.g. after reset + re-mount)
        const hasScheduledIncoming = [...prev, ...orders].some(
          (o) => o.status === 'needs_action' && o.pickupTime != null &&
                 (o.pickupTime.getTime() - Date.now()) / 60000 >= 30
        )
        if (hasScheduledIncoming) return prev
        const id = `sc-live-${Date.now()}`
        const order: Order = {
          id,
          orderNumber: '10284001',
          status: 'needs_action',
          customer: { name: 'Rami B.', phone: '+97455334466', address: 'The Pearl-Qatar, Tower 7, Apt 14', tier: 'gold' },
          branch: "McDonald's, Al Waab",
          pickerEmail: 'staff@mcdonalds-waab.com',
          items: [
            { id: `${id}-i1`, quantity: 2, name: 'Quarter Pounder', barcode: '44001', unitPrice: 35, totalPrice: 70 },
            { id: `${id}-i2`, quantity: 2, name: 'Medium Fries',    barcode: '44002', unitPrice: 10, totalPrice: 20 },
          ],
          subtotal: 90, discount: 0, deliveryFee: 15, total: 105,
          paymentMethod: 'online', createdAt: new Date(), tags: [],
          isDelivery: true, pickupTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        }
        return [...prev, order]
      })
    }, 3000)
    return () => window.clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-dismiss the "N is preparing" banner after 3s.
  useEffect(() => {
    if (!preparingAlert) return
    const id = window.setTimeout(() => setPreparingAlert(null), 3000)
    return () => window.clearTimeout(id)
  }, [preparingAlert])

  // Auto-dismiss the "moved to Scheduled" banner after 4s (slightly longer — it carries more info).
  useEffect(() => {
    if (!scheduledAlert) return
    const id = window.setTimeout(() => setScheduledAlert(null), 4000)
    return () => window.clearTimeout(id)
  }, [scheduledAlert])

  // Fire a one-shot toast when a scheduled order naturally crosses into the due window.
  // Overdue uses a different channel (persistent column banner), so we skip overdue here.
  useEffect(() => {
    const announced = announcedDueIdsRef.current
    for (const o of buckets.newOrders) {
      if (o.status !== 'scheduled') continue
      if (!isScheduledDue(o, clockTick) || isScheduledOverdue(o, clockTick)) continue
      if (announced.has(o.id)) continue
      announced.add(o.id)
      const minutes = o.pickupTime
        ? Math.max(1, Math.round((o.pickupTime.getTime() - Date.now()) / 60000))
        : null
      const who = formatShortName(o.customer.name)
      toast.warning(
        minutes != null
          ? `${who}'s scheduled order is due — start preparing (pickup in ${minutes} min)`
          : `${who}'s scheduled order is due — start preparing`,
      )
    }
  }, [buckets.newOrders, clockTick])


  // Expose imperative test helpers for DevTools.
  useEffect(() => {
    if (!boardRef) return
    boardRef.current = {
      forceFirstScheduledDue: () => promoteNextScheduled() != null,
      forceFirstScheduledOverdue: () => makeNextScheduledOverdue() != null,
      acceptOrder: (id: string) => handleAccept(id),
      startPreparation: (id: string) => handleStartPrep(id),
      markReady: (id: string) => handleReady(id),
      markPickedUp: (id: string) => handlePickedUp(id),
      markDelivered: (id: string) => handleDelivered(id),
      cancelOrder: (id: string) => handleCancel(id),
      openRejectModal: (id: string) => setRejectingOrderId(id),
      spawnDueScheduled: () => {
        const id = `test-due-${Date.now()}`
        const order: Order = {
          id,
          orderNumber: String(90000000 + Math.floor(Math.random() * 999)),
          status: 'scheduled',
          customer: { name: 'Test Customer', phone: '+97400000000', address: 'Test Address', tier: 'standard' },
          branch: 'Test Branch',
          pickerEmail: 'test@test.com',
          items: [
            { id: `${id}-i1`, quantity: 1, name: 'Test Item', barcode: '99999', unitPrice: 50, totalPrice: 50 },
          ],
          subtotal: 50,
          discount: 0,
          deliveryFee: 10,
          total: 60,
          paymentMethod: 'cash',
          createdAt: new Date(),
          tags: [],
          isDelivery: true,
          pickupTime: new Date(Date.now() + 15 * 60_000),
        }
        setExtraOrders((prev) => [order, ...prev])
      },
      resetOverrides: () => {
        setOverrides({})
        setPickupOverrides({})
        setExtraOrders([])
        setMovedAt({})
        setHideBaseOrders(false)
        setCompletedIds(['rp-1', 'rp-5', 'rp-7', 'rp-9', 'rp-11'])
        setDismissedCancellationIds([])
        announcedDueIdsRef.current = new Set()
      },
      enterSingleOrderDemo: () => {
        // Clear every kind of state so the board shows ONE order only.
        setOverrides({})
        setPickupOverrides({})
        setMovedAt({})
        setCompletedIds([])
        setHideBaseOrders(true)
        announcedDueIdsRef.current = new Set()
        const id = `demo-${Date.now()}`
        const order: Order = {
          id,
          orderNumber: '99999001',
          status: 'needs_action',
          customer: { name: 'Demo Guest', phone: '+97400000001', address: 'Demo Branch, Doha', tier: 'splus' },
          branch: 'Demo Branch',
          pickerEmail: 'demo@demo.com',
          items: [
            { id: `${id}-i1`, quantity: 1, name: 'Wagyu Burger', barcode: '99001', unitPrice: 85, totalPrice: 85 },
            { id: `${id}-i2`, quantity: 1, name: 'Truffle Fries', barcode: '99002', unitPrice: 35, totalPrice: 35 },
          ],
          subtotal: 120,
          discount: 0,
          deliveryFee: 15,
          total: 135,
          paymentMethod: 'online',
          createdAt: new Date(),
          tags: [],
          isDelivery: true,
          isFirstOrder: true,
          prepareByTime: new Date(Date.now() + 15 * 60_000),
          deliveryMode: 'snoonu',
        }
        setExtraOrders([order])
      },
      enterOwnDeliveryDemo: () => {
        // Same pattern as single-order demo, but marked as Own Delivery so the
        // Ready → In Delivery → Completed transitions require explicit clicks.
        setOverrides({})
        setPickupOverrides({})
        setMovedAt({})
        setCompletedIds([])
        setHideBaseOrders(true)
        announcedDueIdsRef.current = new Set()
        const id = `demo-own-${Date.now()}`
        const order: Order = {
          id,
          orderNumber: '99999002',
          status: 'needs_action',
          customer: { name: 'Own Delivery Guest', phone: '+97400000002', address: 'Own Branch, Doha', tier: 'gold' },
          branch: 'Own-Delivery Branch',
          pickerEmail: 'own-demo@demo.com',
          items: [
            { id: `${id}-i1`, quantity: 1, name: 'Margherita Pizza', barcode: '99010', unitPrice: 55, totalPrice: 55 },
            { id: `${id}-i2`, quantity: 2, name: 'Caesar Salad', barcode: '99011', unitPrice: 30, totalPrice: 60 },
          ],
          subtotal: 115,
          discount: 0,
          deliveryFee: 0,
          total: 115,
          paymentMethod: 'cash',
          createdAt: new Date(),
          tags: [],
          isDelivery: true,
          prepareByTime: new Date(Date.now() + 15 * 60_000),
          deliveryMode: 'own',
        }
        setExtraOrders([order])
      },
      enterPremiumPriorityDemo: () => {
        // Solo demo: one premium-priority order with the vertical strip decoration.
        // Platinum tier + First Order + VIP flag — the full "treat this one specially" signal.
        setOverrides({})
        setPickupOverrides({})
        setMovedAt({})
        setCompletedIds([])
        setHideBaseOrders(true)
        announcedDueIdsRef.current = new Set()
        const id = `demo-premium-${Date.now()}`
        const order: Order = {
          id,
          orderNumber: '99999003',
          status: 'needs_action',
          customer: { name: 'Ali M.', phone: '+97400000003', address: 'KFC for Americana UAT, Al Ghanim', tier: 'platinum' },
          branch: 'KFC, Al Ghanim', pickerEmail: 'vip-demo@demo.com',
          items: [
            { id: `${id}-i1`, quantity: 1, name: 'Zinger Stacker', barcode: '77001', unitPrice: 38, totalPrice: 38 },
            { id: `${id}-i2`, quantity: 2, name: 'Hot Wings × 6',  barcode: '77002', unitPrice: 32, totalPrice: 64 },
          ],
          subtotal: 102, discount: 0, deliveryFee: 15, total: 117,
          paymentMethod: 'online', createdAt: new Date(), tags: [],
          isDelivery: true,
          isFirstOrder: true,
          isPremiumPriority: true,
          prepareByTime: new Date(Date.now() + 15 * 60_000),
          deliveryMode: 'snoonu',
        }
        setExtraOrders([order])
      },
      spawnPremiumPriorityOrder: () => {
        // Adds a premium-priority order to the existing board (doesn't reset state).
        // Useful for seeing the vertical strip alongside regular cards.
        const id = `premium-${Date.now()}`
        const order: Order = {
          id,
          orderNumber: String(77000000 + Math.floor(Math.random() * 999)),
          status: 'needs_action',
          customer: { name: 'Aisha K.', phone: '+97455009988', address: 'The Pearl, Tower 3, Apt 2010', tier: 'splus' },
          branch: 'La Cigale, West Bay', pickerEmail: 'staff@lacigale.com',
          items: [
            { id: `${id}-i1`, quantity: 1, name: 'Wagyu Ribeye 300g', barcode: '77101', unitPrice: 220, totalPrice: 220 },
            { id: `${id}-i2`, quantity: 1, name: 'Truffle Risotto',    barcode: '77102', unitPrice: 95,  totalPrice: 95  },
          ],
          subtotal: 315, discount: 0, deliveryFee: 20, total: 335,
          paymentMethod: 'online', createdAt: new Date(), tags: ['Allergy: Dairy'],
          isDelivery: true,
          isFirstOrder: true,
          isPremiumPriority: true,
          prepareByTime: new Date(Date.now() + 20 * 60_000),
          deliveryMode: 'snoonu',
        }
        setExtraOrders((prev) => [order, ...prev])
      },
      spawnCustomerCancelledOrder: () => {
        // Simulates a customer cancelling their order. Card stays in New column with
        // strikethrough + "Cancelled Order" pill until merchant dismisses via drawer overlay.
        const id = `cancelled-${Date.now()}`
        const order: Order = {
          id,
          orderNumber: String(75430000 + Math.floor(Math.random() * 9999)),
          status: 'cancelled',
          cancelledBy: 'customer',
          customer: { name: 'Omar Y.', phone: '+97455443322', address: 'Al Waab, Villa 42', tier: 'platinum' },
          branch: "McDonald's, Al Waab", pickerEmail: 'staff@mcdonalds-waab.com',
          items: [
            { id: `${id}-i1`, quantity: 1, name: 'Double Quarter Pounder', barcode: '88001', unitPrice: 45, totalPrice: 45 },
            { id: `${id}-i2`, quantity: 1, name: 'Large Fries',             barcode: '88002', unitPrice: 12, totalPrice: 12 },
          ],
          subtotal: 57, discount: 0, deliveryFee: 15, total: 72,
          paymentMethod: 'online', createdAt: new Date(), tags: [],
          isDelivery: true,
          isFirstOrder: true,
        }
        setExtraOrders((prev) => [order, ...prev])
      },
      dismissCancellation: (id: string) => {
        setDismissedCancellationIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      },
    }
    return () => {
      if (boardRef) boardRef.current = null
    }
  }, [boardRef, resolved])

  const handleAction = (o: Order) => {
    if (o.status === 'needs_action') handleAccept(o.id)
    else if (o.status === 'scheduled') handleStartPrep(o.id)
    else if (o.status === 'preparing' || o.status === 'looking_for_driver') handleReady(o.id)
    else if (o.status === 'ready_for_pickup' && o.deliveryMode === 'own') handlePickedUp(o.id)
    else if (o.status === 'ready_for_pickup' && !o.isDelivery) handleDelivered(o.id) // takeaway: straight to completed
    else if (o.status === 'in_delivery' && o.deliveryMode === 'own') handleDelivered(o.id)
  }

  // Forward-only state machine:
  //   needs_action  → progress | ready | completed
  //   preparing     →            ready | completed
  //   ready_for_pickup →                 completed
  const handleDrop = (orderId: string, target: 'progress' | 'ready' | 'completed') => {
    const order = resolved.find((o) => o.id === orderId)
    setDragZone(null)
    if (!order) return
    if (completedIds.includes(orderId)) return // completed is terminal

    const isNew = order.status === 'needs_action'
    const isScheduled = order.status === 'scheduled'
    const isProgress = order.status === 'preparing' || order.status === 'looking_for_driver'
    const isReady = order.status === 'ready_for_pickup'

    if (target === 'progress') {
      if (isNew) handleAccept(orderId)
      else if (isScheduled) handleStartPrep(orderId)
      // backward (from ready/progress) — noop
    } else if (target === 'ready') {
      if (isNew || isScheduled || isProgress) {
        handleReady(orderId)
        // After Mark Ready, the order sits in "Ready" with status=ready_for_pickup.
        // It moves to "In Delivery" when status flips to in_delivery (courier picked up).
        setDoneTab('ready')
      }
    } else if (target === 'completed') {
      if (isNew || isScheduled || isProgress || isReady) {
        stampMove(orderId)
        setCompletedIds((prev) => [orderId, ...prev.filter((id) => id !== orderId)].slice(0, 20))
        setCompletedOpen(true)
      }
    }
  }

  const dropHandlers = (zone: 'progress' | 'ready' | 'completed') => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      if (dragZone !== zone) setDragZone(zone)
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
        setDragZone((z) => (z === zone ? null : z))
      }
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      const id = e.dataTransfer.getData('text/plain')
      if (id) handleDrop(id, zone)
    },
  })

  const leftList = showScheduled ? buckets.scheduled : buckets.newOrders
  const rightList = doneTab === 'ready' ? buckets.ready : buckets.inDelivery

  // Urgent prep banner — appears 5s after kanban mounts when any in-progress order runs low on time.
  const [bannerReady, setBannerReady] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const now = useClock(30_000)

  useEffect(() => {
    const id = window.setTimeout(() => setBannerReady(true), 5000)
    return () => window.clearTimeout(id)
  }, [])

  const urgentOrder = useMemo(() => {
    if (!bannerReady || bannerDismissed) return null
    let best: { order: Order; minutes: number } | null = null
    for (const o of buckets.inProgress) {
      const sla = getSla(o, now)
      if (!sla || sla.isLate) continue
      if (sla.minutes <= 0 || sla.minutes > 10) continue
      if (!best || sla.minutes < best.minutes) best = { order: o, minutes: sla.minutes }
    }
    return best
  }, [bannerReady, bannerDismissed, buckets.inProgress, now])

  // When the urgent banner is shown, pin its order to the top of the In Progress column
  // so the kitchen worker can find the card referenced by the banner immediately.
  const displayInProgress = useMemo(() => {
    if (!urgentOrder) return buckets.inProgress
    const pinnedId = urgentOrder.order.id
    const rest = buckets.inProgress.filter((o) => o.id !== pinnedId)
    return [urgentOrder.order, ...rest]
  }, [buckets.inProgress, urgentOrder])

  return (
    <div
      className="flex-1 overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateColumns: '1.3fr 1.3fr 1fr',
        gap: 12,
        padding: 16,
        background: 'var(--flock-color-bg-layout)',
      }}
    >
      {/* Left column: New orders / Scheduled */}
      <Column
        header={
          <div className="flex items-center justify-between w-full">
            <Title
              icon={
                showScheduled
                  ? <Clock size={24} color="var(--flock-color-primary)" />
                  : <AlertCircle size={24} color="var(--flock-color-primary)" />
              }
              label={showScheduled ? 'Scheduled' : 'New orders'}
              count={showScheduled ? buckets.scheduled.length : buckets.newOrders.length}
            />
            <PillButton
              active={showScheduled}
              icon={showScheduled ? <Inbox size={14} /> : <Clock size={14} />}
              onClick={() => setShowScheduled((v) => !v)}
            >
              {showScheduled ? `New (${buckets.newOrders.length})` : `Scheduled (${buckets.scheduled.length})`}
            </PillButton>
          </div>
        }
        banner={
          !showScheduled && overdueOrders.length > 0
            ? <OverdueBanner orders={overdueOrders} now={clockTick} />
            : !showScheduled && scheduledAlert
              ? <ScheduledMovedBanner
                  customerName={scheduledAlert.customerName}
                  pickup={scheduledAlert.pickup}
                  onView={() => { setShowScheduled(true); setScheduledAlert(null) }}
                />
              : null
        }
      >
        {leftList.map((o) => (
          <KanbanCard
            key={o.id}
            order={o}
            onAction={() => handleAction(o)}
            onReject={() => setRejectingOrderId(o.id)}
            onDismiss={() => setDismissedCancellationIds((prev) => (prev.includes(o.id) ? prev : [...prev, o.id]))}
            onClick={() => onSelectOrder?.(o)}
          />
        ))}
      </Column>

      {/* Middle column: In Progress */}
      <Column
        header={
          <Title
            icon={<ChefHat size={24} color="var(--flock-color-info)" />}
            label="In Progress"
            count={buckets.inProgress.length}
          />
        }
        banner={
          preparingAlert
            ? <PreparingBanner customerName={preparingAlert.customerName} />
            : urgentOrder
              ? <UrgentPrepBanner
                  customerName={formatShortName(urgentOrder.order.customer.name)}
                  minutes={urgentOrder.minutes}
                  onDismiss={() => setBannerDismissed(true)}
                />
              : null
        }
        dropZone={dropHandlers('progress')}
        isDragOver={dragZone === 'progress'}
      >
        {displayInProgress.map((o) => (
          <KanbanCard
            key={o.id}
            order={o}
            urgent={urgentOrder?.order.id === o.id}
            onAction={() => handleAction(o)}
            onClick={() => onSelectOrder?.(o)}
          />
        ))}
      </Column>

      {/* Right column: Ready/In Delivery + Completed (two islands that share height) */}
      <div className="flex flex-col overflow-hidden min-h-0" style={{ gap: 12 }}>
        <div
          className="flex flex-col overflow-hidden min-h-0 rounded-xl"
          style={{
            flex: completedOpen ? '1 1 0' : '1 1 auto',
            minHeight: 0,
            background: dragZone === 'ready' ? 'rgba(217,2,23,0.06)' : 'var(--flock-color-bg-container)',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
            transition: 'flex-grow 220ms ease, background 150ms ease',
          }}
        >
          <div
            className="shrink-0 flex items-center gap-5"
            style={{
              height: 62,
              padding: '12px 16px',
              borderBottom: '1px solid var(--flock-color-border-secondary)',
            }}
          >
            <ToggleTitle
              icon={<PackageCheck size={22} />}
              label="Ready"
              count={buckets.ready.length}
              active={doneTab === 'ready'}
              activeColor="var(--flock-color-success)"
              onClick={() => setDoneTab('ready')}
            />
            <ToggleTitle
              icon={<Bike size={22} />}
              label="In Delivery"
              count={buckets.inDelivery.length}
              active={doneTab === 'in_delivery'}
              activeColor="var(--flock-color-success)"
              onClick={() => setDoneTab('in_delivery')}
            />
          </div>
          <div
            className="flex-1 overflow-y-auto"
            style={{
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: 'transparent',
              transition: 'background 150ms ease',
            }}
            {...dropHandlers('ready')}
          >
            {rightList.map((o) => (
              <KanbanCard key={o.id} order={o} compact onAction={() => handleAction(o)} onClick={() => onSelectOrder?.(o)} />
            ))}
            {rightList.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const toComplete = rightList.map((o) => o.id)
                  setCompletedIds((prev) => [...toComplete, ...prev].slice(0, 20))
                }}
                style={{
                  marginTop: 4,
                  padding: '8px 12px',
                  borderRadius: 'var(--flock-radius-md)',
                  border: '1px dashed var(--flock-color-border-secondary)',
                  background: 'transparent',
                  color: 'var(--flock-color-text-tertiary)',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Mark all as completed
              </button>
            )}
          </div>
        </div>

        {/* Completed — separate island, grows on open, collapses to header on close */}
        <div
          className="flex flex-col overflow-hidden rounded-xl"
          style={{
            flex: completedOpen ? '0 0 42%' : '0 0 56px',
            background: dragZone === 'completed' ? 'rgba(217,2,23,0.06)' : 'var(--flock-color-bg-container)',
            border: '1px solid var(--flock-color-border-secondary)',
            boxShadow: completedOpen
              ? '0 4px 16px rgba(0,0,0,0.06)'
              : '0 1px 2px rgba(0,0,0,0.04)',
            transition: 'flex-basis 220ms ease, box-shadow 220ms ease, border-color 150ms ease',
          }}
          {...dropHandlers('completed')}
        >
          <button
            type="button"
            onClick={() => setCompletedOpen((v) => !v)}
            className="shrink-0 relative flex items-center justify-between focus-visible:outline-none focus-visible:ring-2"
            style={{
              height: 56,
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderBottom: completedOpen ? '1px solid var(--flock-color-border-secondary)' : 'none',
              outlineColor: 'var(--flock-color-primary)',
            }}
            aria-expanded={completedOpen}
          >
            <span
              aria-hidden
              style={{
                position: 'absolute',
                top: 6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 40,
                height: 4,
                borderRadius: 999,
                background: 'var(--flock-color-fill)',
              }}
            />
            <Title icon={<Archive size={20} />} label="Completed today" count={buckets.completed.length} size="small" />
            {completedOpen
              ? <ChevronDown size={20} style={{ color: 'var(--flock-color-text-tertiary)' }} />
              : <ChevronUp size={20} style={{ color: 'var(--flock-color-text-tertiary)' }} />
            }
          </button>
          {completedOpen && (
            <div
              className="flex-1 overflow-y-auto"
              style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              {buckets.completed.length === 0 ? (
                <div
                  className="flex items-center justify-center h-full"
                  style={{
                    color: 'var(--flock-color-text-tertiary)',
                    fontSize: 14,
                  }}
                >
                  No completed orders yet
                </div>
              ) : (
                buckets.completed.map((o) => <CompletedRow key={o.id} order={o} onClick={() => onSelectOrder?.(o)} />)
              )}
            </div>
          )}
        </div>
      </div>

      <RejectOrderModal
        open={rejectingOrderId != null}
        orderNumber={resolved.find((o) => o.id === rejectingOrderId)?.orderNumber}
        onClose={() => setRejectingOrderId(null)}
        onConfirm={(_key, label) => {
          if (rejectingOrderId) {
            const source = resolved.find((r) => r.id === rejectingOrderId)
            handleCancel(rejectingOrderId)
            if (source) {
              toast.success(`Order #${source.orderNumber} rejected — ${label}`)
            }
          }
          setRejectingOrderId(null)
        }}
      />
    </div>
  )
}

function OverdueBanner({ orders, now }: { orders: Order[]; now: number }) {
  if (orders.length === 0) return null
  const [first] = orders
  const customerName = formatShortName(first.customer.name)
  const minutesLate = first.pickupTime
    ? Math.max(1, Math.floor((now - first.pickupTime.getTime()) / 60000))
    : 0
  const text =
    orders.length === 1
      ? `${customerName}'s pickup is overdue by ${minutesLate} min — start now or cancel`
      : `${orders.length} overdue orders · start ${customerName}'s first (${minutesLate} min late)`
  return (
    <div
      role="alert"
      className="flex items-center shrink-0"
      style={{
        padding: '8px 16px',
        gap: 10,
        background: 'var(--flock-color-error)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <AlertTriangle size={16} color="white" />
      <span
        className="truncate"
        style={{
          color: 'white',
          fontSize: 14,
          fontWeight: 'var(--flock-font-weight-semibold, 600)',
          lineHeight: '22px',
        }}
      >
        {text}
      </span>
    </div>
  )
}

function ScheduledMovedBanner({
  customerName,
  pickup,
  onView,
}: {
  customerName: string
  pickup: Date
  onView: () => void
}) {
  const pickupLabel = pickup.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  return (
    <div
      role="status"
      className="flex items-center justify-between shrink-0"
      style={{
        padding: '8px 16px',
        gap: 12,
        background: 'var(--flock-color-info)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Clock size={16} color="white" />
        <span
          className="truncate"
          style={{
            color: 'white',
            fontSize: 14,
            fontWeight: 'var(--flock-font-weight-semibold, 600)',
            lineHeight: '22px',
          }}
        >
          {customerName}'s order moved to Scheduled · pickup {pickupLabel}
        </span>
      </div>
      <button
        type="button"
        onClick={onView}
        className="inline-flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2"
        style={{
          height: 26,
          padding: '0 10px',
          borderRadius: 6,
          background: 'rgba(255,255,255,0.18)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          outlineColor: 'white',
        }}
      >
        View
      </button>
    </div>
  )
}

function PreparingBanner({ customerName }: { customerName: string }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center shrink-0"
      style={{
        padding: '8px 24px',
        gap: 8,
        background: 'var(--flock-color-cyan, #13c2c2)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <ChefHat size={16} color="white" />
      <span
        className="truncate"
        style={{
          color: 'white',
          fontSize: 14,
          fontWeight: 'var(--flock-font-weight-semibold, 600)',
          lineHeight: '22px',
        }}
      >
        {customerName}'s order is preparing
      </span>
    </div>
  )
}

function formatShortName(full: string): string {
  const [first, ...rest] = full.trim().split(/\s+/)
  if (!rest.length) return first
  const initial = rest[rest.length - 1][0]?.toUpperCase() ?? ''
  return initial ? `${first} ${initial}.` : first
}

function UrgentPrepBanner({
  customerName,
  minutes,
  onDismiss,
}: {
  customerName: string
  minutes: number
  onDismiss: () => void
}) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between shrink-0"
      style={{
        padding: '8px 24px',
        gap: 16,
        background: 'var(--flock-color-volcano, #fa541c)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle size={16} color="white" />
        <span
          className="truncate"
          style={{
            color: 'white',
            fontSize: 14,
            fontWeight: 'var(--flock-font-weight-semibold, 600)',
            lineHeight: '22px',
          }}
        >
          {minutes} {minutes === 1 ? 'minute' : 'minutes'} left for preparing {customerName}'s order
        </span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss urgent prep alert"
        className="flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2"
        style={{
          width: 24,
          height: 24,
          background: 'transparent',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          outlineColor: 'white',
          flexShrink: 0,
        }}
      >
        <X size={16} />
      </button>
    </div>
  )
}

function Column({
  header,
  banner,
  children,
  dropZone,
  isDragOver = false,
}: {
  header: React.ReactNode
  banner?: React.ReactNode
  children: React.ReactNode
  dropZone?: {
    onDragOver: (e: React.DragEvent) => void
    onDragLeave: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent) => void
  }
  isDragOver?: boolean
}) {
  return (
    <div
      className="flex flex-col overflow-hidden min-h-0 rounded-xl"
      style={{
        background: isDragOver ? 'rgba(217,2,23,0.06)' : 'var(--flock-color-bg-container)',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
        transition: 'background 150ms ease',
      }}
    >
      <div
        className="shrink-0 flex items-center"
        style={{
          height: 62,
          padding: '12px 16px',
          borderBottom: '1px solid var(--flock-color-border-secondary)',
        }}
      >
        {header}
      </div>
      {banner}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'transparent',
          transition: 'background 150ms ease',
        }}
        {...(dropZone ?? {})}
      >
        {children}
      </div>
    </div>
  )
}

function Title({
  icon,
  label,
  count,
  size = 'default',
}: {
  icon: React.ReactNode
  label: string
  count: number
  size?: 'default' | 'small'
}) {
  return (
    <div className="flex items-center" style={{ gap: 10, color: 'var(--flock-color-text)' }}>
      {icon}
      <h2
        style={{
          margin: 0,
          fontSize: size === 'small' ? 18 : 22,
          lineHeight: size === 'small' ? '24px' : '28px',
          fontWeight: 'var(--flock-font-weight-extrabold)',
          letterSpacing: '-0.01em',
        }}
      >
        {label}{' '}
        <span style={{ color: 'var(--flock-color-text-tertiary)', fontWeight: 'var(--flock-font-weight-medium)' }}>
          {count}
        </span>
      </h2>
    </div>
  )
}

function ToggleTitle({
  icon,
  label,
  count,
  active,
  activeColor,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  count: number
  active: boolean
  activeColor?: string
  onClick: () => void
}) {
  const iconColor = active
    ? (activeColor ?? 'var(--flock-color-text)')
    : 'var(--flock-color-text-tertiary)'
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center focus-visible:outline-none focus-visible:ring-2"
      style={{
        gap: 8,
        padding: 0,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: active ? 'var(--flock-color-text)' : 'var(--flock-color-text-tertiary)',
        outlineColor: 'var(--flock-color-primary)',
      }}
      aria-pressed={active}
    >
      <span style={{ color: iconColor, display: 'inline-flex' }}>{icon}</span>
      <span
        style={{
          fontSize: 20,
          lineHeight: '26px',
          fontWeight: active
            ? 'var(--flock-font-weight-extrabold)'
            : 'var(--flock-font-weight-semibold)',
          letterSpacing: '-0.01em',
        }}
      >
        {label}{' '}
        <span style={{ color: 'var(--flock-color-text-tertiary)', fontWeight: 'var(--flock-font-weight-medium)' }}>
          {count}
        </span>
      </span>
    </button>
  )
}

function PillButton({
  active,
  icon,
  onClick,
  children,
}: {
  active: boolean
  icon: React.ReactNode
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2"
      style={{
        gap: 6,
        height: 34,
        padding: '0 12px',
        background: active ? 'var(--flock-color-primary)' : 'var(--flock-color-bg-container)',
        color: active ? 'white' : 'var(--flock-color-text)',
        border: active ? 'none' : '1px solid var(--flock-color-border-secondary)',
        borderRadius: 999,
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 'var(--flock-font-weight-medium)',
        outlineColor: 'var(--flock-color-primary)',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {children}
    </button>
  )
}

function CompletedRow({ order, onClick }: { order: Order; onClick?: () => void }) {
  const [first, ...rest] = order.customer.name.trim().split(/\s+/)
  const initial = rest.length ? rest[rest.length - 1][0]?.toUpperCase() : ''
  const displayName = initial ? `${first} ${initial}.` : first
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() } }}
      className="flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2"
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--flock-radius-md)',
        background: 'var(--flock-color-bg-layout)',
        outlineColor: 'var(--flock-color-primary)',
        gap: 12,
      }}
    >
      <div className="flex flex-col" style={{ minWidth: 0, gap: 2 }}>
        <span
          style={{
            fontWeight: 'var(--flock-font-weight-semibold)',
            color: 'var(--flock-color-text)',
            fontSize: 15,
            lineHeight: '20px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayName}
        </span>
        <span
          style={{
            color: 'var(--flock-color-text-secondary)',
            fontSize: 12,
            lineHeight: '16px',
            letterSpacing: '0.02em',
          }}
        >
          #{order.orderNumber}
        </span>
      </div>
      <span
        style={{
          color: 'var(--flock-color-text-tertiary)',
          fontSize: 13,
          lineHeight: '18px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {order.isDelivery ? 'Delivered' : 'Picked up'}
      </span>
    </div>
  )
}
