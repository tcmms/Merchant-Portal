import type { Order } from '../types'

const now = Date.now()
const mins  = (m: number) => new Date(now - m * 60000)
const eta   = (m: number) => new Date(now + m * 60000)
const hours = (h: number) => new Date(now + h * 60 * 60000)

// ─── Driver roster ────────────────────────────────────────────────────────────
const d = {
  salman:   { name: 'Salman OG.',  phone: '+97421349023', status: 'on_route'        as const },
  ahmed:    { name: 'Ahmed D.',    phone: '+97433112233', status: 'nearby'           as const },
  hassan:   { name: 'Hassan R.',   phone: '+97455667788', status: 'arrived'          as const },
  khalid:   { name: 'Khalid S.',   phone: '+97466778899', status: 'waiting'          as const },
  fahad:    { name: 'Fahad M.',    phone: '+97444321567', status: 'picking_up'       as const },
  noora:    { name: 'Noora Al.',   phone: '+97455112233', status: 'customer_near'    as const },
  jamal:    { name: 'Jamal R.',    phone: '+97430998877', status: 'customer_arrived' as const },
  tariq:    { name: 'Tariq B.',    phone: '+97455988776', status: 'on_route'         as const },
  zeina:    { name: 'Zeina A.',    phone: '+97444556677', status: 'arrived'          as const },
  basim:    { name: 'Basim K.',    phone: '+97430112233', status: 'waiting'          as const },
  looking:  { name: '',            phone: '',             status: 'looking'          as const },
}

const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=160&h=160&fit=crop&auto=format&q=80`
const img = {
  burger:     u('1568901346375-23c9450c58cd'),
  fries:      u('1573080496219-bb080dd4f877'),
  pizza:      u('1565299624946-b28f40a0ae38'),
  chicken:    u('1598515214211-89d3c73ae83b'),
  wings:      u('1567620832903-9fc36fc7f15b'),
  shawarma:   u('1529042410759-befb1204b468'),
  salad:      u('1512621776951-a57141f2eefd'),
  pasta:      u('1555949258-eb67b1ef0ceb'),
  sushi:      u('1579871494447-9811cf80d66c'),
  biryani:    u('1563379926898-05f4575a45d8'),
  steak:      u('1546069901-ba9599a7e63c'),
  sandwich:   u('1528736235302-52922df5c122'),
  ramen:      u('1569050467447-ce54b3bbc37d'),
  icecream:   u('1563805042-7684c019e1cb'),
  cheesecake: u('1533134242753-703a4f5c7bb2'),
  pancakes:   u('1528207776546-365bb710ee93'),
  waffles:    u('1562376552-0d160a2f238d'),
  coffee:     u('1509042239860-f550ce710b93'),
  milkshake:  u('1568901346375-23c9450c58cd'),
  soup:       u('1547592180-85f173990554'),
  shrimp:     u('1559847844-5315695dadae'),
  croissant:  u('1555507036-ab1f4038808a'),
  nachos:     u('1513456852971-30c0b8199d4d'),
  wrap:       u('1626700051175-6818013e1d4f'),
}

export const MOCK_ORDERS: Order[] = [

  // ─── NEEDS ACTION — New column (2 cards) ─────────────────────────────────

  {
    id: 'na-1', orderNumber: '10281001', status: 'needs_action',
    customer: { name: 'Davit A.', phone: '+97421343337', address: 'The Pearl-Qatar, Tower 12, Porto Arabia', tier: 'splus' },
    branch: "McDonald's, Al Waab", pickerEmail: 'staff@mcdonalds-waab.com',
    items: [
      { id: 'na1-i1', quantity: 2, name: 'Big Mac',      barcode: '11001', unitPrice: 28, totalPrice: 56, image: img.burger },
      { id: 'na1-i2', quantity: 2, name: 'Large Fries',  barcode: '11002', unitPrice: 12, totalPrice: 24, image: img.fries  },
    ],
    subtotal: 80, discount: 0, deliveryFee: 15, total: 95,
    paymentMethod: 'cash', createdAt: mins(38), tags: ['Spicy Request'],
    isDelivery: true, isFirstOrder: true, prepareByTime: eta(14),
    customerNote: 'Please use less oil in the food. Make it extra spicy.',
    driver: d.looking,
  },
  {
    id: 'na-2', orderNumber: '10281002', status: 'needs_action',
    customer: { name: 'Sophie R.', phone: '+97421349023', address: 'West Bay, Diplomatic Area, Tower 5', tier: 'splus' },
    branch: 'Pizza Hut, The Pearl', pickerEmail: 'staff@pizzahut-pearl.com',
    items: [
      { id: 'na2-i1', quantity: 1, name: 'Pepperoni Pizza L', barcode: '11003', unitPrice: 65, totalPrice: 65, image: img.pizza    },
      { id: 'na2-i2', quantity: 2, name: 'Garlic Bread',      barcode: '11004', unitPrice: 15, totalPrice: 30, image: img.sandwich },
    ],
    subtotal: 95, discount: 0, deliveryFee: 15, total: 110,
    paymentMethod: 'card', createdAt: mins(32), tags: ['Extra Cheese'],
    isDelivery: true, isFirstOrder: true, prepareByTime: eta(8),
    driver: d.looking,
  },

  // ─── SCHEDULED — accepted, waiting for prep time ──────────────────────────
  // NOTE: Scheduled incoming orders (status: needs_action + future pickupTime) are NOT in this
  // file. They are auto-spawned by KanbanBoard 3 seconds after mount to simulate real-time arrival.

  {
    id: 'sc-4', orderNumber: '10284004', status: 'scheduled',
    customer: { name: 'Noora Z.', phone: '+97444223311', address: 'Al Sadd, Tower 9, Apt 20', tier: 'splus' },
    branch: 'Sakura Sushi, West Bay', pickerEmail: 'staff@sakura-westbay.com',
    items: [
      { id: 'sc4-i1', quantity: 3, name: 'Salmon Roll 8pc', barcode: '44007', unitPrice: 48, totalPrice: 144, image: img.sushi },
      { id: 'sc4-i2', quantity: 2, name: 'Miso Soup',        barcode: '44008', unitPrice: 18, totalPrice: 36,  image: img.soup  },
    ],
    subtotal: 180, discount: 18, deliveryFee: 15, total: 177,
    paymentMethod: 'online', createdAt: mins(80), tags: [], isDelivery: true, pickupTime: hours(2),
  },
  {
    id: 'sc-5', orderNumber: '10284005', status: 'scheduled',
    customer: { name: 'Jake L.', phone: '+97455778833', address: 'Old Airport Road, Bldg 14', tier: 'gold' },
    branch: 'Nandos, Villaggio', pickerEmail: 'staff@nandos-villaggio.com',
    items: [
      { id: 'sc5-i1', quantity: 2, name: 'Whole Chicken Peri Peri', barcode: '44009', unitPrice: 125, totalPrice: 250, image: img.chicken },
      { id: 'sc5-i2', quantity: 4, name: 'Peri Fries',              barcode: '44010', unitPrice: 18,  totalPrice: 72,  image: img.fries   },
    ],
    subtotal: 322, discount: 22, deliveryFee: 18, total: 318,
    paymentMethod: 'card', createdAt: mins(120), tags: ['Extra Hot'],
    isDelivery: false, pickupTime: hours(6),
  },

  // ─── PREPARING — In Progress column (1 card) ─────────────────────────────
  // prepareByTime=eta(3) triggers the UrgentPrepBanner ("3 minutes left for preparing…")
  // which appears 5s after mount when SLA is in (0, 10] minutes.

  {
    id: 'pr-1', orderNumber: '10282001', status: 'preparing',
    customer: { name: 'Sara M.', phone: '+97455512345', address: 'Al Sadd, Building 5, Apt 12', tier: 'gold' },
    branch: 'Subway, Al Sadd', pickerEmail: 'staff@subway-alsadd.com',
    items: [
      { id: 'pr1-i1', quantity: 2, name: 'Chicken Teriyaki Sub', barcode: '22001', unitPrice: 35, totalPrice: 70, image: img.sandwich },
      { id: 'pr1-i2', quantity: 2, name: 'Caesar Salad',         barcode: '22002', unitPrice: 22, totalPrice: 44, image: img.salad    },
    ],
    subtotal: 114, discount: 0, deliveryFee: 15, total: 129,
    paymentMethod: 'card', createdAt: mins(12), tags: [],
    isDelivery: false, prepareByTime: eta(3),
    driver: d.salman,
  },

  // ─── READY FOR PICKUP (20 cards) ──────────────────────────────────────────
  // Bucket logic:
  //   driver.status 'picking_up' | 'customer_near' | 'customer_arrived' → In Delivery tab
  //   everything else → Ready tab
  // completedIds initial: ['rp-1','rp-5','rp-7','rp-9','rp-11'] (pre-completed for demo)

  // rp-1  → Completed (initial)
  {
    id: 'rp-1', orderNumber: '10283001', status: 'ready_for_pickup',
    customer: { name: 'Mohamed K.', phone: '+97430012345', address: 'Lusail, Tower 3, Floor 8', tier: 'standard' },
    branch: 'Cheesecake Factory, Lusail', pickerEmail: 'staff@cheesecake-lusail.com',
    items: [
      { id: 'rp1-i1', quantity: 2, name: 'Original Cheesecake', barcode: '33001', unitPrice: 45, totalPrice: 90, image: img.cheesecake },
      { id: 'rp1-i2', quantity: 2, name: 'Cappuccino',           barcode: '33002', unitPrice: 22, totalPrice: 44, image: img.coffee     },
    ],
    subtotal: 134, discount: 15, deliveryFee: 12, total: 131,
    paymentMethod: 'cash', createdAt: mins(5), tags: [], isDelivery: true,
  },

  // rp-2 → Ready — Own delivery
  {
    id: 'rp-2', orderNumber: '10283002', status: 'ready_for_pickup',
    customer: { name: 'Lara B.', phone: '+97455234567', address: 'Al Mansoura, Building 9, Apt 1', tier: 'gold' },
    branch: 'Paul Bakery, City Center', pickerEmail: 'staff@paul-cc.com',
    items: [
      { id: 'rp2-i1', quantity: 2, name: 'Almond Croissant', barcode: '33003', unitPrice: 22, totalPrice: 44, image: img.croissant },
      { id: 'rp2-i2', quantity: 2, name: 'Flat White',        barcode: '33004', unitPrice: 20, totalPrice: 40, image: img.coffee    },
    ],
    subtotal: 84, discount: 0, deliveryFee: 10, total: 94,
    paymentMethod: 'card', createdAt: mins(3), tags: [], isDelivery: true, deliveryMode: 'own',
  },

  // rp-3 → Ready — Driver on route
  {
    id: 'rp-3', orderNumber: '10283003', status: 'ready_for_pickup',
    customer: { name: 'Kareem F.', phone: '+97466123789', address: 'Al Khail, Street 22, House 4', tier: 'standard' },
    branch: 'Johnny Rockets, Hyatt', pickerEmail: 'staff@johnnyrockets.com',
    items: [
      { id: 'rp3-i1', quantity: 2, name: 'Rocket Single Burger', barcode: '33005', unitPrice: 45, totalPrice: 90,  image: img.burger    },
      { id: 'rp3-i2', quantity: 2, name: 'Classic Milkshake',     barcode: '33006', unitPrice: 28, totalPrice: 56,  image: img.milkshake },
    ],
    subtotal: 146, discount: 0, deliveryFee: 15, total: 161,
    paymentMethod: 'online', createdAt: mins(8), tags: [], isDelivery: true,
    driver: d.tariq,
  },

  // rp-4 → Ready — Driver arrived
  {
    id: 'rp-4', orderNumber: '10283004', status: 'ready_for_pickup',
    customer: { name: 'Yasmin A.', phone: '+97430456789', address: 'Fereej Al Ali, Lane 15', tier: 'platinum' },
    branch: 'Katsuya, Mondrian', pickerEmail: 'staff@katsuya.com',
    items: [
      { id: 'rp4-i1', quantity: 2, name: 'Spicy Tuna Roll 8pc', barcode: '33007', unitPrice: 65, totalPrice: 130, image: img.sushi },
      { id: 'rp4-i2', quantity: 1, name: 'Edamame',              barcode: '33008', unitPrice: 25, totalPrice: 25,  image: img.salad },
    ],
    subtotal: 155, discount: 0, deliveryFee: 20, total: 175,
    paymentMethod: 'card', createdAt: mins(6), tags: [], isDelivery: true,
    driver: d.hassan,
  },

  // rp-5 → Completed (initial)
  {
    id: 'rp-5', orderNumber: '10283005', status: 'ready_for_pickup',
    customer: { name: 'Nasser T.', phone: '+97444678901', address: 'Al Wajba, Compound 1, House 18', tier: 'gold' },
    branch: 'Zaffron, Doha Festival City', pickerEmail: 'staff@zaffron.com',
    items: [
      { id: 'rp5-i1', quantity: 2, name: 'Chicken Tikka Masala', barcode: '33009', unitPrice: 55, totalPrice: 110, image: img.chicken  },
      { id: 'rp5-i2', quantity: 4, name: 'Garlic Naan',           barcode: '33010', unitPrice: 8,  totalPrice: 32,  image: img.sandwich },
    ],
    subtotal: 142, discount: 0, deliveryFee: 15, total: 157,
    paymentMethod: 'cash', createdAt: mins(11), tags: [], isDelivery: true,
  },

  // rp-6 → Ready — Driver waiting
  {
    id: 'rp-6', orderNumber: '10283006', status: 'ready_for_pickup',
    customer: { name: 'Sana H.', phone: '+97455789012', address: 'Umm Ghuwailina, Street 7', tier: 'standard' },
    branch: 'Shake Shack, Lusail', pickerEmail: 'staff@shakeshack-lusail.com',
    items: [
      { id: 'rp6-i1', quantity: 2, name: 'SmokeShack Burger', barcode: '33011', unitPrice: 48, totalPrice: 96,  image: img.burger    },
      { id: 'rp6-i2', quantity: 2, name: 'Vanilla Shake',      barcode: '33012', unitPrice: 30, totalPrice: 60,  image: img.milkshake },
    ],
    subtotal: 156, discount: 0, deliveryFee: 15, total: 171,
    paymentMethod: 'online', createdAt: mins(4), tags: [], isDelivery: true,
    driver: d.khalid,
  },

  // rp-7 → Completed (initial)
  {
    id: 'rp-7', orderNumber: '10283007', status: 'ready_for_pickup',
    customer: { name: 'Murad L.', phone: '+97430890123', address: 'Al Duhail, Building 3', tier: 'gold' },
    branch: 'Ribs & Burgers, West Bay', pickerEmail: 'staff@ribsnburgers.com',
    items: [
      { id: 'rp7-i1', quantity: 1, name: 'Beef Ribs Full Rack', barcode: '33013', unitPrice: 130, totalPrice: 130, image: img.steak },
      { id: 'rp7-i2', quantity: 2, name: 'Corn on the Cob',      barcode: '33014', unitPrice: 18,  totalPrice: 36,  image: img.salad },
    ],
    subtotal: 166, discount: 0, deliveryFee: 18, total: 184,
    paymentMethod: 'card', createdAt: mins(14), tags: ['Smoky BBQ'], isDelivery: true,
  },

  // rp-8 → Ready — Takeaway (waiting for customer)
  {
    id: 'rp-8', orderNumber: '10283008', status: 'ready_for_pickup',
    customer: { name: 'Rawan S.', phone: '+97466901234', address: 'The Pearl, Costa del Mare', tier: 'platinum' },
    branch: 'Coya, Marsa Arabia', pickerEmail: 'staff@coya-doha.com',
    items: [
      { id: 'rp8-i1', quantity: 2, name: 'Ceviche Mixto',   barcode: '33015', unitPrice: 95, totalPrice: 190, image: img.shrimp },
      { id: 'rp8-i2', quantity: 2, name: 'Beef Anticucho',  barcode: '33016', unitPrice: 75, totalPrice: 150, image: img.steak  },
    ],
    subtotal: 340, discount: 30, deliveryFee: 35, total: 345,
    paymentMethod: 'card', createdAt: mins(9), tags: [], isDelivery: false,
  },

  // rp-9 → Completed (initial)
  {
    id: 'rp-9', orderNumber: '10283009', status: 'ready_for_pickup',
    customer: { name: 'Omar W.', phone: '+97455012345', address: 'Wakra, Residential Area, House 33', tier: 'standard' },
    branch: 'Burger King, Ezdan Mall', pickerEmail: 'staff@bk-ezdan.com',
    items: [
      { id: 'rp9-i1', quantity: 3, name: 'Whopper',       barcode: '33017', unitPrice: 30, totalPrice: 90, image: img.burger },
      { id: 'rp9-i2', quantity: 3, name: 'Medium Fries',  barcode: '33018', unitPrice: 12, totalPrice: 36, image: img.fries  },
    ],
    subtotal: 126, discount: 0, deliveryFee: 12, total: 138,
    paymentMethod: 'cash', createdAt: mins(7), tags: [], isDelivery: true, deliveryMode: 'own',
  },

  // rp-10 → Ready — Looking for courier (no driver assigned yet)
  {
    id: 'rp-10', orderNumber: '10283010', status: 'ready_for_pickup',
    customer: { name: 'Leila V.', phone: '+97444123456', address: 'Al Jasra, Building 7, Apt 2', tier: 'gold' },
    branch: 'Bali Hai, Intercontinental', pickerEmail: 'staff@balihai.com',
    items: [
      { id: 'rp10-i1', quantity: 2, name: 'Prawn Pad Thai',      barcode: '33019', unitPrice: 68, totalPrice: 136, image: img.pasta   },
      { id: 'rp10-i2', quantity: 2, name: 'Mango Sticky Rice',   barcode: '33020', unitPrice: 32, totalPrice: 64,  image: img.icecream },
    ],
    subtotal: 200, discount: 20, deliveryFee: 22, total: 202,
    paymentMethod: 'online', createdAt: mins(12), tags: [], isDelivery: true,
    driver: d.looking,
  },

  // rp-11 → Completed (initial)
  {
    id: 'rp-11', orderNumber: '10283011', status: 'ready_for_pickup',
    customer: { name: 'Saad A.', phone: '+97430234567', address: 'Al Manhal, Street 9, House 6', tier: 'standard' },
    branch: 'Fuddruckers, Vilaggio', pickerEmail: 'staff@fuddruckers.com',
    items: [
      { id: 'rp11-i1', quantity: 2, name: '1/3 lb Mushroom Burger', barcode: '33021', unitPrice: 52, totalPrice: 104, image: img.burger },
      { id: 'rp11-i2', quantity: 2, name: 'Onion Rings',             barcode: '33022', unitPrice: 20, totalPrice: 40,  image: img.fries  },
    ],
    subtotal: 144, discount: 0, deliveryFee: 15, total: 159,
    paymentMethod: 'card', createdAt: mins(3), tags: [], isDelivery: false,
  },

  // rp-12 → Ready — Driver on route (second on-route example)
  {
    id: 'rp-12', orderNumber: '10283012', status: 'ready_for_pickup',
    customer: { name: 'Hind K.', phone: '+97466345678', address: 'New Slata, Building 11, Floor 5', tier: 'platinum' },
    branch: 'Benihana, Marriott', pickerEmail: 'staff@benihana.com',
    items: [
      { id: 'rp12-i1', quantity: 2, name: 'Filet Mignon Hibachi', barcode: '33023', unitPrice: 145, totalPrice: 290, image: img.steak },
      { id: 'rp12-i2', quantity: 2, name: 'Miso Soup',             barcode: '33024', unitPrice: 20,  totalPrice: 40,  image: img.soup  },
    ],
    subtotal: 330, discount: 0, deliveryFee: 35, total: 365,
    paymentMethod: 'card', createdAt: mins(16), tags: [], isDelivery: true,
    driver: d.salman,
  },

  // rp-13 → In Delivery — Courier picking up
  {
    id: 'rp-13', orderNumber: '10283013', status: 'in_delivery',
    customer: { name: 'Abdulla R.', phone: '+97444567890', address: 'Fereej Bin Mahmoud, Apt 9', tier: 'gold' },
    branch: 'Karak Chai House, Souq Waqif', pickerEmail: 'staff@karakchai.com',
    items: [
      { id: 'rp13-i1', quantity: 5, name: 'Karak Chai',   barcode: '33025', unitPrice: 5, totalPrice: 25, image: img.coffee    },
      { id: 'rp13-i2', quantity: 5, name: 'Regag Bread',  barcode: '33026', unitPrice: 8, totalPrice: 40, image: img.croissant },
    ],
    subtotal: 65, discount: 0, deliveryFee: 10, total: 75,
    paymentMethod: 'cash', createdAt: mins(2), tags: [], isDelivery: false,
    driver: d.fahad,
  },

  // rp-14 → In Delivery — Courier picking up (second)
  {
    id: 'rp-14', orderNumber: '10283014', status: 'in_delivery',
    customer: { name: 'Erika J.', phone: '+97455456789', address: 'Al Mirqab Al Jadeed, Tower 2', tier: 'standard' },
    branch: 'Carluccios, The Pearl', pickerEmail: 'staff@carluccios.com',
    items: [
      { id: 'rp14-i1', quantity: 1, name: 'Spaghetti Carbonara', barcode: '33027', unitPrice: 72, totalPrice: 72, image: img.pasta      },
      { id: 'rp14-i2', quantity: 1, name: 'Tiramisu',             barcode: '33028', unitPrice: 38, totalPrice: 38, image: img.cheesecake },
    ],
    subtotal: 110, discount: 0, deliveryFee: 15, total: 125,
    paymentMethod: 'online', createdAt: mins(10), tags: [], isDelivery: false,
    driver: { name: 'Majed S.', phone: '+97455990011', status: 'picking_up' as const },
  },

  // rp-15 → In Delivery — Near customer (NEW status)
  {
    id: 'rp-15', orderNumber: '10283015', status: 'in_delivery',
    customer: { name: 'Nawaf S.', phone: '+97430678901', address: 'Al Thumama, House 19', tier: 'gold' },
    branch: 'Smashburger, Aspire Zone', pickerEmail: 'staff@smashburger.com',
    items: [
      { id: 'rp15-i1', quantity: 2, name: 'Classic Smash Burger', barcode: '33029', unitPrice: 42, totalPrice: 84, image: img.burger },
      { id: 'rp15-i2', quantity: 2, name: 'Smash Fries',           barcode: '33030', unitPrice: 16, totalPrice: 32, image: img.fries  },
    ],
    subtotal: 116, discount: 0, deliveryFee: 12, total: 128,
    paymentMethod: 'card', createdAt: mins(6), tags: [], isDelivery: false,
    driver: d.noora,
  },

  // rp-16 → In Delivery — At customer (NEW status)
  {
    id: 'rp-16', orderNumber: '10283016', status: 'in_delivery',
    customer: { name: 'Manal O.', phone: '+97466789012', address: 'Umm Salal Mohammed, Building 3', tier: 'standard' },
    branch: 'Crumbl Cookies, Lusail', pickerEmail: 'staff@crumbl.com',
    items: [
      { id: 'rp16-i1', quantity: 6, name: 'Chocolate Chip Cookie', barcode: '33031', unitPrice: 18, totalPrice: 108, image: img.pancakes },
      { id: 'rp16-i2', quantity: 2, name: 'Pink Sugar Cookie',      barcode: '33032', unitPrice: 18, totalPrice: 36,  image: img.waffles  },
    ],
    subtotal: 144, discount: 0, deliveryFee: 12, total: 156,
    paymentMethod: 'online', createdAt: mins(8), tags: ['Box Packaging'], isDelivery: false,
    driver: d.jamal,
  },

  // rp-17 → Ready — Driver on route
  {
    id: 'rp-17', orderNumber: '10283017', status: 'ready_for_pickup',
    customer: { name: 'Fahad M.', phone: '+97444890123', address: 'Al Rayyan, Villa Complex 5, House 12', tier: 'platinum' },
    branch: 'Il Teatro, Four Seasons', pickerEmail: 'staff@ilteatro.com',
    items: [
      { id: 'rp17-i1', quantity: 2, name: 'Truffle Pasta', barcode: '33033', unitPrice: 118, totalPrice: 236, image: img.pasta      },
      { id: 'rp17-i2', quantity: 2, name: 'Tiramisu',       barcode: '33034', unitPrice: 55,  totalPrice: 110, image: img.cheesecake },
    ],
    subtotal: 346, discount: 35, deliveryFee: 40, total: 351,
    paymentMethod: 'card', createdAt: mins(17), tags: [], isDelivery: true,
    driver: d.tariq,
  },

  // rp-18 → Ready — Driver arrived
  {
    id: 'rp-18', orderNumber: '10283018', status: 'ready_for_pickup',
    customer: { name: 'Shaikha N.', phone: '+97455901234', address: 'Al Waab City, Block 3, Apt 7', tier: 'gold' },
    branch: 'Ginos, City Center', pickerEmail: 'staff@ginos.com',
    items: [
      { id: 'rp18-i1', quantity: 1, name: 'BBQ Chicken Pizza',     barcode: '33035', unitPrice: 68, totalPrice: 68,  image: img.pizza      },
      { id: 'rp18-i2', quantity: 2, name: 'Chocolate Lava Cake',   barcode: '33036', unitPrice: 35, totalPrice: 70,  image: img.cheesecake },
    ],
    subtotal: 138, discount: 0, deliveryFee: 15, total: 153,
    paymentMethod: 'cash', createdAt: mins(5), tags: [], isDelivery: true,
    driver: d.zeina,
  },

  // rp-19 → Ready — Takeaway (waiting for customer)
  {
    id: 'rp-19', orderNumber: '10283019', status: 'ready_for_pickup',
    customer: { name: 'Basma T.', phone: '+97430012678', address: 'Al Hilal, Building 5, Apt 3', tier: 'standard' },
    branch: 'Starbucks, West Bay', pickerEmail: 'staff@starbucks-westbay.com',
    items: [
      { id: 'rp19-i1', quantity: 3, name: 'Caramel Frappuccino', barcode: '33037', unitPrice: 22, totalPrice: 66, image: img.milkshake },
      { id: 'rp19-i2', quantity: 3, name: 'Chocolate Muffin',    barcode: '33038', unitPrice: 15, totalPrice: 45, image: img.croissant },
    ],
    subtotal: 111, discount: 0, deliveryFee: 10, total: 121,
    paymentMethod: 'online', createdAt: mins(4), tags: [], isDelivery: false,
  },

  // rp-20 → Ready — Driver waiting
  {
    id: 'rp-20', orderNumber: '10283020', status: 'ready_for_pickup',
    customer: { name: 'Joud A.', phone: '+97444012345', address: 'Madinat Khalifa South, Villa 8', tier: 'platinum' },
    branch: 'Nobu, Four Seasons', pickerEmail: 'staff@nobu-doha.com',
    items: [
      { id: 'rp20-i1', quantity: 2, name: 'Yellowtail Jalapeño',  barcode: '33039', unitPrice: 95, totalPrice: 190, image: img.sushi  },
      { id: 'rp20-i2', quantity: 2, name: 'Rock Shrimp Tempura',  barcode: '33040', unitPrice: 88, totalPrice: 176, image: img.shrimp },
    ],
    subtotal: 366, discount: 0, deliveryFee: 40, total: 406,
    paymentMethod: 'card', createdAt: mins(13), tags: [], isDelivery: true,
    driver: d.basim,
  },
]

export function getTabCounts(orders: Order[]) {
  return {
    needs_action: orders.filter(
      (o) => o.status === 'needs_action' || o.status === 'looking_for_driver' || o.status === 'cancelled'
    ).length,
    scheduled: orders.filter((o) => o.status === 'scheduled').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    ready_for_pickup: orders.filter((o) => o.status === 'ready_for_pickup').length,
  }
}
