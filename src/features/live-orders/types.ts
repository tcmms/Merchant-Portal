export type OrderStatus =
  | 'needs_action'
  | 'looking_for_driver'
  | 'preparing'
  | 'ready_for_pickup'
  | 'cancelled'

export type TabId = 'needs_action' | 'preparing' | 'ready_for_pickup'

export type PaymentMethod = 'cash' | 'card' | 'online'

export type CustomerTier = 'splus' | 'platinum' | 'gold' | 'standard'

export type DriverStatus = 'on_route' | 'arrived' | 'picking_up'

export interface Driver {
  name: string
  phone: string
  status: DriverStatus
}

export interface OrderItem {
  id: string
  quantity: number
  name: string
  barcode: string
  unitPrice: number
  totalPrice: number
  image?: string
}

export interface Customer {
  name: string
  phone: string
  address: string
  tier: CustomerTier
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  customer: Customer
  branch: string
  pickerEmail: string
  items: OrderItem[]
  subtotal: number
  discount: number
  deliveryFee: number
  total: number
  paymentMethod: PaymentMethod
  createdAt: Date
  tags: string[]
  isDelivery: boolean
  isFirstOrder?: boolean
  customerNote?: string
  prepareByTime?: Date
  driver?: Driver
}
