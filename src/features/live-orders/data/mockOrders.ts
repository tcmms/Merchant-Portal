import type { Order } from '../types'

const now = Date.now()
const mins = (m: number) => new Date(now - m * 60000)
const eta  = (m: number) => new Date(now + m * 60000)

const drivers = {
  salman:  { name: 'Salman OG.',  phone: '+97421349023', status: 'on_route'   as const },
  ahmed:   { name: 'Ahmed D.',    phone: '+97433112233', status: 'arrived'    as const },
  hassan:  { name: 'Hassan R.',   phone: '+97455667788', status: 'picking_up' as const },
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
  tacos:      u('1565299585323-38d6b0865b47'),
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

  // ─── NEEDS ACTION (20) ───────────────────────────────────────────

  {
    id: 'na-1', orderNumber: '10281001', status: 'needs_action',
    customer: { name: 'Davit A.', phone: '+97421343337', address: 'The Pearl-Qatar, Tower 12, Porto Arabia', tier: 'splus' },
    branch: "McDonald's, Al Waab", pickerEmail: 'staff@mcdonalds-waab.com',
    items: [
      { id: 'na1-i1', quantity: 2, name: 'Big Mac', barcode: '11001', unitPrice: 28, totalPrice: 56, image: img.burger },
      { id: 'na1-i2', quantity: 2, name: 'Large Fries', barcode: '11002', unitPrice: 12, totalPrice: 24, image: img.fries },
    ],
    subtotal: 80, discount: 0, deliveryFee: 15, total: 95, paymentMethod: 'cash', createdAt: mins(38), tags: ['Spicy Request'], isDelivery: true, isFirstOrder: true, prepareByTime: eta(14), customerNote: 'Please use less oil in the food. Make it extra spicy.',
  },
  {
    id: 'na-2', orderNumber: '10281002', status: 'needs_action',
    customer: { name: 'Sophie R.', phone: '+97421349023', address: 'West Bay, Diplomatic Area, Tower 5', tier: 'splus' },
    branch: 'Pizza Hut, The Pearl', pickerEmail: 'staff@pizzahut-pearl.com',
    items: [
      { id: 'na2-i1', quantity: 1, name: 'Pepperoni Pizza L', barcode: '11003', unitPrice: 65, totalPrice: 65, image: img.pizza },
      { id: 'na2-i2', quantity: 2, name: 'Garlic Bread', barcode: '11004', unitPrice: 15, totalPrice: 30, image: img.sandwich },
    ],
    subtotal: 95, discount: 0, deliveryFee: 15, total: 110, paymentMethod: 'card', createdAt: mins(32), tags: ['Extra Cheese'], isDelivery: true, isFirstOrder: true, prepareByTime: eta(8),
  },
  {
    id: 'na-3', orderNumber: '10281003', status: 'needs_action',
    customer: { name: 'Ahmed K.', phone: '+97430001122', address: 'Al Sadd, Building 14, Apt 3', tier: 'standard' },
    branch: 'KFC, Landmark Mall', pickerEmail: 'staff@kfc-landmark.com',
    items: [
      { id: 'na3-i1', quantity: 2, name: 'Zinger Burger', barcode: '11005', unitPrice: 32, totalPrice: 64, image: img.burger },
      { id: 'na3-i2', quantity: 1, name: 'Bucket Fried Chicken 8pc', barcode: '11006', unitPrice: 72, totalPrice: 72, image: img.chicken },
    ],
    subtotal: 136, discount: 0, deliveryFee: 18, total: 154, paymentMethod: 'cash', createdAt: mins(27), tags: [], isDelivery: true, isFirstOrder: true,
  },
  {
    id: 'na-4', orderNumber: '10281004', status: 'needs_action',
    customer: { name: 'Maria L.', phone: '+97455512345', address: 'Lusail, Marina District, Block 7', tier: 'gold' },
    branch: 'Shake Shack, Villaggio', pickerEmail: 'staff@shakeshack-villaggio.com',
    items: [
      { id: 'na4-i1', quantity: 1, name: 'ShackBurger', barcode: '11007', unitPrice: 42, totalPrice: 42, image: img.burger },
      { id: 'na4-i2', quantity: 2, name: 'Chocolate Milkshake', barcode: '11008', unitPrice: 30, totalPrice: 60, image: img.milkshake },
    ],
    subtotal: 102, discount: 10, deliveryFee: 12, total: 104, paymentMethod: 'online', createdAt: mins(8), tags: [], isDelivery: false, isFirstOrder: true,
  },
  {
    id: 'na-5', orderNumber: '10281005', status: 'needs_action',
    customer: { name: 'Fatima H.', phone: '+97444009988', address: 'Madinat Khalifa, Villa 22', tier: 'standard' },
    branch: 'Hardees, West Bay', pickerEmail: 'staff@hardees-westbay.com',
    items: [
      { id: 'na5-i1', quantity: 1, name: 'Mushroom Swiss Burger', barcode: '11009', unitPrice: 38, totalPrice: 38, image: img.burger },
      { id: 'na5-i2', quantity: 1, name: 'Onion Rings', barcode: '11010', unitPrice: 18, totalPrice: 18, image: img.fries },
    ],
    subtotal: 56, discount: 0, deliveryFee: 15, total: 71, paymentMethod: 'card', createdAt: mins(14), tags: [], isDelivery: true,
  },
  {
    id: 'na-6', orderNumber: '10281006', status: 'needs_action',
    customer: { name: 'Omar S.', phone: '+97466123456', address: 'Al Rayyan, Landmark Complex, Apt 9', tier: 'gold' },
    branch: 'Five Guys, City Center', pickerEmail: 'staff@fiveguys-cc.com',
    items: [
      { id: 'na6-i1', quantity: 2, name: 'Five Guys Burger', barcode: '11011', unitPrice: 55, totalPrice: 110, image: img.burger },
      { id: 'na6-i2', quantity: 2, name: 'Cajun Fries', barcode: '11012', unitPrice: 20, totalPrice: 40, image: img.fries },
    ],
    subtotal: 150, discount: 15, deliveryFee: 18, total: 153, paymentMethod: 'card', createdAt: mins(6), tags: ['No Onion'], isDelivery: true, isFirstOrder: true,
  },
  {
    id: 'na-7', orderNumber: '10281007', status: 'needs_action',
    customer: { name: 'Lena V.', phone: '+97477234567', address: 'Bin Mahmoud, Street 860', tier: 'standard' },
    branch: 'Applebees, Hyatt Plaza', pickerEmail: 'staff@applebees-hyatt.com',
    items: [
      { id: 'na7-i1', quantity: 1, name: 'Sirloin Steak 8oz', barcode: '11013', unitPrice: 95, totalPrice: 95, image: img.steak },
      { id: 'na7-i2', quantity: 2, name: 'Mashed Potatoes', barcode: '11014', unitPrice: 18, totalPrice: 36, image: img.soup },
    ],
    subtotal: 131, discount: 0, deliveryFee: 22, total: 153, paymentMethod: 'online', createdAt: mins(3), tags: ['Medium Rare'], isDelivery: true, isFirstOrder: true,
  },
  {
    id: 'na-8', orderNumber: '10281008', status: 'needs_action',
    customer: { name: 'Yusuf A.', phone: '+97455600112', address: 'Al Dafna, Corniche Road, Bldg 4', tier: 'splus' },
    branch: 'Sakura Sushi, West Bay', pickerEmail: 'staff@sakura-westbay.com',
    items: [
      { id: 'na8-i1', quantity: 2, name: 'Salmon Roll 8pc', barcode: '11015', unitPrice: 48, totalPrice: 96, image: img.sushi },
      { id: 'na8-i2', quantity: 1, name: 'Miso Soup', barcode: '11016', unitPrice: 18, totalPrice: 18, image: img.soup },
    ],
    subtotal: 114, discount: 0, deliveryFee: 15, total: 129, paymentMethod: 'card', createdAt: mins(11), tags: [], isDelivery: false,
  },
  {
    id: 'na-9', orderNumber: '10281009', status: 'needs_action',
    customer: { name: 'Nour R.', phone: '+97430099887', address: 'Fereej Abdul Aziz, Lane 12', tier: 'standard' },
    branch: 'Spice Route, Ain Khaled', pickerEmail: 'staff@spiceroute.com',
    items: [
      { id: 'na9-i1', quantity: 3, name: 'Chicken Biryani', barcode: '11017', unitPrice: 42, totalPrice: 126, image: img.biryani },
      { id: 'na9-i2', quantity: 1, name: 'Raita Sauce', barcode: '11018', unitPrice: 8, totalPrice: 8, image: img.soup },
    ],
    subtotal: 134, discount: 0, deliveryFee: 18, total: 152, paymentMethod: 'cash', createdAt: mins(21), tags: ['Extra Spicy'], isDelivery: true,
  },
  {
    id: 'na-10', orderNumber: '10281010', status: 'needs_action',
    customer: { name: 'Alex P.', phone: '+97477100200', address: 'The Pearl, Qanat Quartier, D2', tier: 'gold' },
    branch: 'Tony Romas, Landmark', pickerEmail: 'staff@tonyromas.com',
    items: [
      { id: 'na10-i1', quantity: 1, name: 'BBQ Ribs Half Rack', barcode: '11019', unitPrice: 110, totalPrice: 110, image: img.steak },
      { id: 'na10-i2', quantity: 2, name: 'Coleslaw', barcode: '11020', unitPrice: 15, totalPrice: 30, image: img.salad },
    ],
    subtotal: 140, discount: 20, deliveryFee: 15, total: 135, paymentMethod: 'card', createdAt: mins(5), tags: [], isDelivery: true,
  },
  {
    id: 'na-11', orderNumber: '10281011', status: 'looking_for_driver',
    customer: { name: 'Hana M.', phone: '+97455311200', address: 'Al Messila, Compound 3, Villa 8', tier: 'standard' },
    branch: 'Elevation Burger, Villaggio', pickerEmail: 'staff@elevation-villaggio.com',
    items: [
      { id: 'na11-i1', quantity: 2, name: 'Double Elevation Burger', barcode: '11021', unitPrice: 48, totalPrice: 96, image: img.burger },
      { id: 'na11-i2', quantity: 2, name: 'Sweet Potato Fries', barcode: '11022', unitPrice: 22, totalPrice: 44, image: img.fries },
    ],
    subtotal: 140, discount: 0, deliveryFee: 18, total: 158, paymentMethod: 'online', createdAt: mins(29), tags: [], isDelivery: true, driver: drivers.salman,
  },
  {
    id: 'na-12', orderNumber: '10281012', status: 'looking_for_driver',
    customer: { name: 'Khalid J.', phone: '+97433445566', address: 'Old Airport Road, Bldg 20', tier: 'gold' },
    branch: 'Al Shaab Village, Shawarma Express', pickerEmail: 'staff@shawarma-express.com',
    items: [
      { id: 'na12-i1', quantity: 3, name: 'Chicken Shawarma', barcode: '11023', unitPrice: 22, totalPrice: 66, image: img.shawarma },
      { id: 'na12-i2', quantity: 2, name: 'Hummus & Pita', barcode: '11024', unitPrice: 18, totalPrice: 36, image: img.wrap },
    ],
    subtotal: 102, discount: 10, deliveryFee: 12, total: 104, paymentMethod: 'cash', createdAt: mins(18), tags: ['Extra Garlic'], isDelivery: true, driver: drivers.ahmed, customerNote: 'Extra garlic sauce on the side please.',
  },
  {
    id: 'na-13', orderNumber: '10281013', status: 'looking_for_driver',
    customer: { name: 'Diana C.', phone: '+97466778899', address: 'Wakra Corniche, Building A', tier: 'standard' },
    branch: 'Noodle House, City Center', pickerEmail: 'staff@noodlehouse.com',
    items: [
      { id: 'na13-i1', quantity: 2, name: 'Chicken Ramen', barcode: '11025', unitPrice: 45, totalPrice: 90, image: img.ramen },
      { id: 'na13-i2', quantity: 2, name: 'Gyoza 6pc', barcode: '11026', unitPrice: 28, totalPrice: 56, image: img.shrimp },
    ],
    subtotal: 146, discount: 0, deliveryFee: 20, total: 166, paymentMethod: 'card', createdAt: mins(24), tags: [], isDelivery: true,
  },
  {
    id: 'na-14', orderNumber: '10281014', status: 'looking_for_driver',
    customer: { name: 'Rania T.', phone: '+97444556677', address: 'Bin Omran, Street 24, Villa 5', tier: 'platinum' },
    branch: 'Texas Roadhouse, Lusail', pickerEmail: 'staff@texasroadhouse.com',
    items: [
      { id: 'na14-i1', quantity: 2, name: 'Ribeye Steak 12oz', barcode: '11027', unitPrice: 135, totalPrice: 270, image: img.steak },
      { id: 'na14-i2', quantity: 1, name: 'Caesar Salad', barcode: '11028', unitPrice: 35, totalPrice: 35, image: img.salad },
    ],
    subtotal: 305, discount: 30, deliveryFee: 25, total: 300, paymentMethod: 'card', createdAt: mins(9), tags: ['Well Done'], isDelivery: false,
  },
  {
    id: 'na-15', orderNumber: '10281015', status: 'looking_for_driver',
    customer: { name: 'Tariq B.', phone: '+97455988776', address: 'Al Wakrah, Compound B, Apt 2', tier: 'standard' },
    branch: 'Wrap & Roll, Aspire Zone', pickerEmail: 'staff@wrapandroll.com',
    items: [
      { id: 'na15-i1', quantity: 3, name: 'Chicken Caesar Wrap', barcode: '11029', unitPrice: 32, totalPrice: 96, image: img.wrap },
      { id: 'na15-i2', quantity: 3, name: 'Side Salad', barcode: '11030', unitPrice: 18, totalPrice: 54, image: img.salad },
    ],
    subtotal: 150, discount: 0, deliveryFee: 15, total: 165, paymentMethod: 'online', createdAt: mins(35), tags: [], isDelivery: true,
  },
  {
    id: 'na-16', orderNumber: '10281016', status: 'cancelled',
    customer: { name: 'Ines F.', phone: '+97430122334', address: 'Corniche Road, Four Seasons Tower', tier: 'platinum' },
    branch: 'Nobu, Four Seasons', pickerEmail: 'staff@nobu-doha.com',
    items: [
      { id: 'na16-i1', quantity: 2, name: 'Salmon Sashimi 5pc', barcode: '11031', unitPrice: 75, totalPrice: 150, image: img.sushi },
      { id: 'na16-i2', quantity: 1, name: 'Black Cod Miso', barcode: '11032', unitPrice: 120, totalPrice: 120, image: img.shrimp },
    ],
    subtotal: 270, discount: 0, deliveryFee: 30, total: 300, paymentMethod: 'card', createdAt: mins(52), tags: [], isDelivery: false,
  },
  {
    id: 'na-17', orderNumber: '10281017', status: 'cancelled',
    customer: { name: 'Bader A.', phone: '+97444321567', address: 'Al Aziziyah, Lane 7, Bldg 3', tier: 'standard' },
    branch: 'Burger Boutique, Hyatt', pickerEmail: 'staff@burgerboutique.com',
    items: [
      { id: 'na17-i1', quantity: 1, name: 'Wagyu Beef Burger', barcode: '11033', unitPrice: 88, totalPrice: 88, image: img.burger },
      { id: 'na17-i2', quantity: 1, name: 'Truffle Fries', barcode: '11034', unitPrice: 35, totalPrice: 35, image: img.fries },
    ],
    subtotal: 123, discount: 0, deliveryFee: 18, total: 141, paymentMethod: 'cash', createdAt: mins(45), tags: ['No Gluten'], isDelivery: true,
  },
  {
    id: 'na-18', orderNumber: '10281018', status: 'cancelled',
    customer: { name: 'Salma K.', phone: '+97466001122', address: 'Education City, Staff Housing', tier: 'gold' },
    branch: 'Thai Orchid, Al Sadd', pickerEmail: 'staff@thaiorchid.com',
    items: [
      { id: 'na18-i1', quantity: 2, name: 'Pad Thai Chicken', barcode: '11035', unitPrice: 48, totalPrice: 96, image: img.pasta },
      { id: 'na18-i2', quantity: 2, name: 'Tom Yum Soup', barcode: '11036', unitPrice: 35, totalPrice: 70, image: img.soup },
    ],
    subtotal: 166, discount: 0, deliveryFee: 20, total: 186, paymentMethod: 'online', createdAt: mins(60), tags: ['Less Spicy'], isDelivery: true,
  },
  {
    id: 'na-19', orderNumber: '10281019', status: 'cancelled',
    customer: { name: 'Paul D.', phone: '+97455778899', address: 'West Bay Lagoon, Villa 44', tier: 'standard' },
    branch: 'Chilis, Doha Festival City', pickerEmail: 'staff@chilis-dfc.com',
    items: [
      { id: 'na19-i1', quantity: 1, name: 'Big Mouth Bites', barcode: '11037', unitPrice: 58, totalPrice: 58, image: img.burger },
      { id: 'na19-i2', quantity: 1, name: 'Bottomless Chips', barcode: '11038', unitPrice: 22, totalPrice: 22, image: img.nachos },
    ],
    subtotal: 80, discount: 0, deliveryFee: 15, total: 95, paymentMethod: 'card', createdAt: mins(70), tags: [], isDelivery: false,
  },
  {
    id: 'na-20', orderNumber: '10281020', status: 'cancelled',
    customer: { name: 'Aisha N.', phone: '+97430667788', address: 'Al Khor City, Block 5', tier: 'gold' },
    branch: 'Panda Express, Ezdan Mall', pickerEmail: 'staff@pandaexpress.com',
    items: [
      { id: 'na20-i1', quantity: 2, name: 'Orange Chicken Bowl', barcode: '11039', unitPrice: 45, totalPrice: 90, image: img.chicken },
      { id: 'na20-i2', quantity: 2, name: 'Fried Rice', barcode: '11040', unitPrice: 22, totalPrice: 44, image: img.biryani },
    ],
    subtotal: 134, discount: 15, deliveryFee: 18, total: 137, paymentMethod: 'cash', createdAt: mins(55), tags: [], isDelivery: true,
  },

  // ─── PREPARING (20) ──────────────────────────────────────────────

  {
    id: 'pr-1', orderNumber: '10282001', status: 'preparing',
    customer: { name: 'Sara M.', phone: '+97455512345', address: 'Al Sadd, Building 5, Apt 12', tier: 'gold' },
    branch: 'Subway, Al Sadd', pickerEmail: 'staff@subway-alsadd.com',
    items: [
      { id: 'pr1-i1', quantity: 2, name: 'Chicken Teriyaki Sub', barcode: '22001', unitPrice: 35, totalPrice: 70, image: img.sandwich },
      { id: 'pr1-i2', quantity: 2, name: 'Caesar Salad', barcode: '22002', unitPrice: 22, totalPrice: 44, image: img.salad },
    ],
    subtotal: 114, discount: 0, deliveryFee: 15, total: 129, paymentMethod: 'card', createdAt: mins(12), tags: [], isDelivery: false, driver: drivers.hassan, prepareByTime: eta(6),
  },
  {
    id: 'pr-2', orderNumber: '10282002', status: 'preparing',
    customer: { name: 'Jassim A.', phone: '+97444201345', address: 'Fereej Bin Dirham, House 17', tier: 'standard' },
    branch: 'Popeyes, Al Khor Mall', pickerEmail: 'staff@popeyes-alkhor.com',
    items: [
      { id: 'pr2-i1', quantity: 3, name: 'Spicy Chicken Sandwich', barcode: '22003', unitPrice: 30, totalPrice: 90, image: img.sandwich },
      { id: 'pr2-i2', quantity: 3, name: 'Cajun Fries', barcode: '22004', unitPrice: 15, totalPrice: 45, image: img.fries },
    ],
    subtotal: 135, discount: 0, deliveryFee: 20, total: 155, paymentMethod: 'cash', createdAt: mins(8), tags: ['Extra Crispy'], isDelivery: true, driver: drivers.salman, prepareByTime: eta(18), customerNote: 'Please make it extra crispy, last time it was soggy.',
  },
  {
    id: 'pr-3', orderNumber: '10282003', status: 'preparing',
    customer: { name: 'Laila F.', phone: '+97466112233', address: 'Ain Khaled, Compound 7, Villa 3', tier: 'platinum' },
    branch: 'PF Changs, Doha Festival City', pickerEmail: 'staff@pfchangs-dfc.com',
    items: [
      { id: 'pr3-i1', quantity: 1, name: 'Kung Pao Chicken', barcode: '22005', unitPrice: 68, totalPrice: 68, image: img.chicken },
      { id: 'pr3-i2', quantity: 1, name: 'Chicken Fried Rice', barcode: '22006', unitPrice: 52, totalPrice: 52, image: img.biryani },
      { id: 'pr3-i3', quantity: 2, name: 'Spring Rolls', barcode: '22007', unitPrice: 32, totalPrice: 64, image: img.wrap },
    ],
    subtotal: 184, discount: 20, deliveryFee: 18, total: 182, paymentMethod: 'card', createdAt: mins(15), tags: [], isDelivery: false,
  },
  {
    id: 'pr-4', orderNumber: '10282004', status: 'preparing',
    customer: { name: 'Majed S.', phone: '+97455990011', address: 'Nuaija, Building 8, Floor 3', tier: 'standard' },
    branch: 'Biryani House, Al Muntazah', pickerEmail: 'staff@biryanihouse.com',
    items: [
      { id: 'pr4-i1', quantity: 2, name: 'Mutton Biryani', barcode: '22008', unitPrice: 55, totalPrice: 110, image: img.biryani },
      { id: 'pr4-i2', quantity: 2, name: 'Raita', barcode: '22009', unitPrice: 10, totalPrice: 20, image: img.soup },
    ],
    subtotal: 130, discount: 0, deliveryFee: 15, total: 145, paymentMethod: 'online', createdAt: mins(20), tags: ['Extra Spicy'], isDelivery: true,
  },
  {
    id: 'pr-5', orderNumber: '10282005', status: 'preparing',
    customer: { name: 'Nadia K.', phone: '+97430880099', address: 'Al Mansoura, Lane 4, Villa 9', tier: 'gold' },
    branch: 'Olive Garden, Villaggio', pickerEmail: 'staff@olivegarden-villaggio.com',
    items: [
      { id: 'pr5-i1', quantity: 1, name: 'Fettuccine Alfredo', barcode: '22010', unitPrice: 62, totalPrice: 62, image: img.pasta },
      { id: 'pr5-i2', quantity: 2, name: 'Breadsticks', barcode: '22011', unitPrice: 15, totalPrice: 30, image: img.sandwich },
    ],
    subtotal: 92, discount: 0, deliveryFee: 18, total: 110, paymentMethod: 'card', createdAt: mins(6), tags: [], isDelivery: true,
  },
  {
    id: 'pr-6', orderNumber: '10282006', status: 'preparing',
    customer: { name: 'Hassan R.', phone: '+97444887766', address: 'Gharafa, Building B, Apt 15', tier: 'standard' },
    branch: 'Wings Stop, City Center', pickerEmail: 'staff@wingsstop.com',
    items: [
      { id: 'pr6-i1', quantity: 2, name: 'Buffalo Wings 10pc', barcode: '22012', unitPrice: 55, totalPrice: 110, image: img.wings },
      { id: 'pr6-i2', quantity: 2, name: 'Seasoned Fries', barcode: '22013', unitPrice: 18, totalPrice: 36, image: img.fries },
    ],
    subtotal: 146, discount: 0, deliveryFee: 15, total: 161, paymentMethod: 'cash', createdAt: mins(11), tags: ['Lemon Pepper'], isDelivery: true,
  },
  {
    id: 'pr-7', orderNumber: '10282007', status: 'preparing',
    customer: { name: 'Youmna A.', phone: '+97455223344', address: 'Dahl Al Hamam, Street 5', tier: 'gold' },
    branch: 'Wagamama, Hyatt Plaza', pickerEmail: 'staff@wagamama.com',
    items: [
      { id: 'pr7-i1', quantity: 2, name: 'Chicken Ramen', barcode: '22014', unitPrice: 58, totalPrice: 116, image: img.ramen },
      { id: 'pr7-i2', quantity: 2, name: 'Chicken Gyoza', barcode: '22015', unitPrice: 32, totalPrice: 64, image: img.shrimp },
    ],
    subtotal: 180, discount: 18, deliveryFee: 20, total: 182, paymentMethod: 'online', createdAt: mins(17), tags: [], isDelivery: false,
  },
  {
    id: 'pr-8', orderNumber: '10282008', status: 'preparing',
    customer: { name: 'Khalid M.', phone: '+97430556677', address: 'Umm Salal Ali, House 44', tier: 'standard' },
    branch: 'Taco Bell, Landmark', pickerEmail: 'staff@tacobell.com',
    items: [
      { id: 'pr8-i1', quantity: 3, name: 'Crunchy Taco', barcode: '22016', unitPrice: 18, totalPrice: 54, image: img.tacos },
      { id: 'pr8-i2', quantity: 2, name: 'Nachos BellGrande', barcode: '22017', unitPrice: 28, totalPrice: 56, image: img.nachos },
    ],
    subtotal: 110, discount: 0, deliveryFee: 12, total: 122, paymentMethod: 'card', createdAt: mins(7), tags: [], isDelivery: true,
  },
  {
    id: 'pr-9', orderNumber: '10282009', status: 'preparing',
    customer: { name: 'Mona T.', phone: '+97466334455', address: 'The Pearl, Viva Bahriyah', tier: 'platinum' },
    branch: 'Seafood Palace, Corniche', pickerEmail: 'staff@seafoodpalace.com',
    items: [
      { id: 'pr9-i1', quantity: 2, name: 'Grilled Shrimp Platter', barcode: '22018', unitPrice: 85, totalPrice: 170, image: img.shrimp },
      { id: 'pr9-i2', quantity: 1, name: 'Clam Chowder', barcode: '22019', unitPrice: 38, totalPrice: 38, image: img.soup },
    ],
    subtotal: 208, discount: 0, deliveryFee: 25, total: 233, paymentMethod: 'card', createdAt: mins(22), tags: [], isDelivery: false,
  },
  {
    id: 'pr-10', orderNumber: '10282010', status: 'preparing',
    customer: { name: 'Faisal H.', phone: '+97444765432', address: 'Al Hilal, Building 12, Apt 7', tier: 'gold' },
    branch: 'Fuego, West Bay', pickerEmail: 'staff@fuego.com',
    items: [
      { id: 'pr10-i1', quantity: 2, name: 'Beef Tacos', barcode: '22020', unitPrice: 38, totalPrice: 76, image: img.tacos },
      { id: 'pr10-i2', quantity: 1, name: 'Guacamole & Chips', barcode: '22021', unitPrice: 30, totalPrice: 30, image: img.nachos },
    ],
    subtotal: 106, discount: 0, deliveryFee: 15, total: 121, paymentMethod: 'online', createdAt: mins(13), tags: ['No Cilantro'], isDelivery: true,
  },
  {
    id: 'pr-11', orderNumber: '10282011', status: 'preparing',
    customer: { name: 'Amira S.', phone: '+97455100200', address: 'Aziziya, Compound 2, House 5', tier: 'standard' },
    branch: 'Nandos, Villaggio', pickerEmail: 'staff@nandos-villaggio.com',
    items: [
      { id: 'pr11-i1', quantity: 1, name: 'Half Chicken Peri Peri', barcode: '22022', unitPrice: 62, totalPrice: 62, image: img.chicken },
      { id: 'pr11-i2', quantity: 2, name: 'Peri Fries', barcode: '22023', unitPrice: 18, totalPrice: 36, image: img.fries },
    ],
    subtotal: 98, discount: 0, deliveryFee: 15, total: 113, paymentMethod: 'cash', createdAt: mins(9), tags: ['Extra Hot'], isDelivery: true,
  },
  {
    id: 'pr-12', orderNumber: '10282012', status: 'preparing',
    customer: { name: 'Ibrahim O.', phone: '+97430445566', address: 'New Slata, Block 8', tier: 'gold' },
    branch: 'Zuma, Four Seasons', pickerEmail: 'staff@zuma-doha.com',
    items: [
      { id: 'pr12-i1', quantity: 2, name: 'Salmon Teriyaki', barcode: '22024', unitPrice: 98, totalPrice: 196, image: img.sushi },
      { id: 'pr12-i2', quantity: 2, name: 'Edamame', barcode: '22025', unitPrice: 22, totalPrice: 44, image: img.salad },
    ],
    subtotal: 240, discount: 25, deliveryFee: 28, total: 243, paymentMethod: 'card', createdAt: mins(19), tags: [], isDelivery: false,
  },
  {
    id: 'pr-13', orderNumber: '10282013', status: 'preparing',
    customer: { name: 'Reem J.', phone: '+97466223344', address: 'Al Wakrah, Main Street, Apt 11', tier: 'standard' },
    branch: 'Greek Club, West Bay', pickerEmail: 'staff@greekclub.com',
    items: [
      { id: 'pr13-i1', quantity: 2, name: 'Chicken Souvlaki', barcode: '22026', unitPrice: 45, totalPrice: 90, image: img.wrap },
      { id: 'pr13-i2', quantity: 2, name: 'Greek Salad', barcode: '22027', unitPrice: 30, totalPrice: 60, image: img.salad },
    ],
    subtotal: 150, discount: 0, deliveryFee: 18, total: 168, paymentMethod: 'online', createdAt: mins(25), tags: [], isDelivery: true,
  },
  {
    id: 'pr-14', orderNumber: '10282014', status: 'preparing',
    customer: { name: 'Turki A.', phone: '+97444998877', address: 'Duhail, Street 102, House 6', tier: 'platinum' },
    branch: 'LPM, Marsa Malaz Kempinski', pickerEmail: 'staff@lpm-doha.com',
    items: [
      { id: 'pr14-i1', quantity: 1, name: 'Burrata Salad', barcode: '22028', unitPrice: 72, totalPrice: 72, image: img.salad },
      { id: 'pr14-i2', quantity: 1, name: 'Grilled Sea Bass', barcode: '22029', unitPrice: 148, totalPrice: 148, image: img.shrimp },
    ],
    subtotal: 220, discount: 0, deliveryFee: 30, total: 250, paymentMethod: 'card', createdAt: mins(14), tags: [], isDelivery: false,
  },
  {
    id: 'pr-15', orderNumber: '10282015', status: 'preparing',
    customer: { name: 'Dina R.', phone: '+97455667788', address: 'Mansoura, Lane 9, Villa 2', tier: 'standard' },
    branch: 'Pinkberry, The Pearl', pickerEmail: 'staff@pinkberry.com',
    items: [
      { id: 'pr15-i1', quantity: 3, name: 'Mango Frozen Yogurt', barcode: '22030', unitPrice: 28, totalPrice: 84, image: img.icecream },
      { id: 'pr15-i2', quantity: 2, name: 'Fresh Waffle', barcode: '22031', unitPrice: 22, totalPrice: 44, image: img.waffles },
    ],
    subtotal: 128, discount: 0, deliveryFee: 15, total: 143, paymentMethod: 'cash', createdAt: mins(5), tags: [], isDelivery: false,
  },
  {
    id: 'pr-16', orderNumber: '10282016', status: 'preparing',
    customer: { name: 'Walid N.', phone: '+97430334455', address: 'Al Mirqab, Building C, Apt 8', tier: 'gold' },
    branch: 'Crepaway, Landmark', pickerEmail: 'staff@crepaway.com',
    items: [
      { id: 'pr16-i1', quantity: 2, name: 'Nutella & Banana Crepe', barcode: '22032', unitPrice: 35, totalPrice: 70, image: img.pancakes },
      { id: 'pr16-i2', quantity: 2, name: 'Hot Chocolate', barcode: '22033', unitPrice: 22, totalPrice: 44, image: img.coffee },
    ],
    subtotal: 114, discount: 10, deliveryFee: 15, total: 119, paymentMethod: 'online', createdAt: mins(10), tags: [], isDelivery: false,
  },
  {
    id: 'pr-17', orderNumber: '10282017', status: 'preparing',
    customer: { name: 'Aseel H.', phone: '+97466445566', address: 'Al Nasr, Street 44', tier: 'standard' },
    branch: 'Salam Palace, Airport Road', pickerEmail: 'staff@salampalace.com',
    items: [
      { id: 'pr17-i1', quantity: 2, name: 'Mixed Grill Platter', barcode: '22034', unitPrice: 95, totalPrice: 190, image: img.steak },
      { id: 'pr17-i2', quantity: 2, name: 'Tabouleh Salad', barcode: '22035', unitPrice: 25, totalPrice: 50, image: img.salad },
    ],
    subtotal: 240, discount: 0, deliveryFee: 22, total: 262, paymentMethod: 'card', createdAt: mins(16), tags: [], isDelivery: true,
  },
  {
    id: 'pr-18', orderNumber: '10282018', status: 'preparing',
    customer: { name: 'Zainab A.', phone: '+97455334455', address: 'Rawda, House 7, Lane 3', tier: 'gold' },
    branch: 'Tim Hortons, Villaggio', pickerEmail: 'staff@timhortons.com',
    items: [
      { id: 'pr18-i1', quantity: 4, name: 'Iced Capp', barcode: '22036', unitPrice: 18, totalPrice: 72, image: img.coffee },
      { id: 'pr18-i2', quantity: 4, name: 'Boston Cream Donut', barcode: '22037', unitPrice: 8, totalPrice: 32, image: img.croissant },
    ],
    subtotal: 104, discount: 0, deliveryFee: 12, total: 116, paymentMethod: 'cash', createdAt: mins(4), tags: [], isDelivery: false,
  },
  {
    id: 'pr-19', orderNumber: '10282019', status: 'preparing',
    customer: { name: 'Basil Q.', phone: '+97430990011', address: 'Ain Khaled, Villa Complex 4', tier: 'standard' },
    branch: 'Grill Point, Al Sadd', pickerEmail: 'staff@grillpoint.com',
    items: [
      { id: 'pr19-i1', quantity: 2, name: 'Beef Shawarma', barcode: '22038', unitPrice: 25, totalPrice: 50, image: img.shawarma },
      { id: 'pr19-i2', quantity: 2, name: 'Fattoush Salad', barcode: '22039', unitPrice: 20, totalPrice: 40, image: img.salad },
    ],
    subtotal: 90, discount: 0, deliveryFee: 12, total: 102, paymentMethod: 'online', createdAt: mins(18), tags: [], isDelivery: true,
  },
  {
    id: 'pr-20', orderNumber: '10282020', status: 'preparing',
    customer: { name: 'Huda M.', phone: '+97444556655', address: 'Legtaifiya, Building 2, Apt 4', tier: 'platinum' },
    branch: 'Novotel Brasserie, Airport', pickerEmail: 'staff@novotel-doha.com',
    items: [
      { id: 'pr20-i1', quantity: 1, name: 'Club Sandwich', barcode: '22040', unitPrice: 58, totalPrice: 58, image: img.sandwich },
      { id: 'pr20-i2', quantity: 2, name: 'Cappuccino', barcode: '22041', unitPrice: 22, totalPrice: 44, image: img.coffee },
    ],
    subtotal: 102, discount: 0, deliveryFee: 15, total: 117, paymentMethod: 'card', createdAt: mins(7), tags: [], isDelivery: false,
  },

  // ─── READY FOR PICKUP (20) ───────────────────────────────────────

  {
    id: 'rp-1', orderNumber: '10283001', status: 'ready_for_pickup',
    customer: { name: 'Mohamed K.', phone: '+97430012345', address: 'Lusail, Tower 3, Floor 8', tier: 'standard' },
    branch: 'Cheesecake Factory, Lusail', pickerEmail: 'staff@cheesecake-lusail.com',
    items: [
      { id: 'rp1-i1', quantity: 2, name: 'Original Cheesecake', barcode: '33001', unitPrice: 45, totalPrice: 90, image: img.cheesecake },
      { id: 'rp1-i2', quantity: 2, name: 'Cappuccino', barcode: '33002', unitPrice: 22, totalPrice: 44, image: img.coffee },
    ],
    subtotal: 134, discount: 15, deliveryFee: 12, total: 131, paymentMethod: 'cash', createdAt: mins(5), tags: [], isDelivery: true,
  },
  {
    id: 'rp-2', orderNumber: '10283002', status: 'ready_for_pickup',
    customer: { name: 'Lara B.', phone: '+97455234567', address: 'Al Mansoura, Building 9, Apt 1', tier: 'gold' },
    branch: 'Paul Bakery, City Center', pickerEmail: 'staff@paul-cc.com',
    items: [
      { id: 'rp2-i1', quantity: 2, name: 'Almond Croissant', barcode: '33003', unitPrice: 22, totalPrice: 44, image: img.croissant },
      { id: 'rp2-i2', quantity: 2, name: 'Flat White', barcode: '33004', unitPrice: 20, totalPrice: 40, image: img.coffee },
    ],
    subtotal: 84, discount: 0, deliveryFee: 10, total: 94, paymentMethod: 'card', createdAt: mins(3), tags: [], isDelivery: false,
  },
  {
    id: 'rp-3', orderNumber: '10283003', status: 'ready_for_pickup',
    customer: { name: 'Kareem F.', phone: '+97466123789', address: 'Al Khail, Street 22, House 4', tier: 'standard' },
    branch: 'Johnny Rockets, Hyatt', pickerEmail: 'staff@johnnyrockets.com',
    items: [
      { id: 'rp3-i1', quantity: 2, name: 'Rocket Single Burger', barcode: '33005', unitPrice: 45, totalPrice: 90, image: img.burger },
      { id: 'rp3-i2', quantity: 2, name: 'Classic Milkshake', barcode: '33006', unitPrice: 28, totalPrice: 56, image: img.milkshake },
    ],
    subtotal: 146, discount: 0, deliveryFee: 15, total: 161, paymentMethod: 'online', createdAt: mins(8), tags: [], isDelivery: false,
  },
  {
    id: 'rp-4', orderNumber: '10283004', status: 'ready_for_pickup',
    customer: { name: 'Yasmin A.', phone: '+97430456789', address: 'Fereej Al Ali, Lane 15', tier: 'platinum' },
    branch: 'Katsuya, Mondrian', pickerEmail: 'staff@katsuya.com',
    items: [
      { id: 'rp4-i1', quantity: 2, name: 'Spicy Tuna Roll 8pc', barcode: '33007', unitPrice: 65, totalPrice: 130, image: img.sushi },
      { id: 'rp4-i2', quantity: 1, name: 'Edamame', barcode: '33008', unitPrice: 25, totalPrice: 25, image: img.salad },
    ],
    subtotal: 155, discount: 0, deliveryFee: 20, total: 175, paymentMethod: 'card', createdAt: mins(6), tags: [], isDelivery: false,
  },
  {
    id: 'rp-5', orderNumber: '10283005', status: 'ready_for_pickup',
    customer: { name: 'Nasser T.', phone: '+97444678901', address: 'Al Wajba, Compound 1, House 18', tier: 'gold' },
    branch: 'Zaffron, Doha Festival City', pickerEmail: 'staff@zaffron.com',
    items: [
      { id: 'rp5-i1', quantity: 2, name: 'Chicken Tikka Masala', barcode: '33009', unitPrice: 55, totalPrice: 110, image: img.chicken },
      { id: 'rp5-i2', quantity: 4, name: 'Garlic Naan', barcode: '33010', unitPrice: 8, totalPrice: 32, image: img.sandwich },
    ],
    subtotal: 142, discount: 0, deliveryFee: 15, total: 157, paymentMethod: 'cash', createdAt: mins(11), tags: [], isDelivery: true,
  },
  {
    id: 'rp-6', orderNumber: '10283006', status: 'ready_for_pickup',
    customer: { name: 'Sana H.', phone: '+97455789012', address: 'Umm Ghuwailina, Street 7', tier: 'standard' },
    branch: 'Shake Shack, Lusail', pickerEmail: 'staff@shakeshack-lusail.com',
    items: [
      { id: 'rp6-i1', quantity: 2, name: 'SmokeShack Burger', barcode: '33011', unitPrice: 48, totalPrice: 96, image: img.burger },
      { id: 'rp6-i2', quantity: 2, name: 'Vanilla Shake', barcode: '33012', unitPrice: 30, totalPrice: 60, image: img.milkshake },
    ],
    subtotal: 156, discount: 0, deliveryFee: 15, total: 171, paymentMethod: 'online', createdAt: mins(4), tags: [], isDelivery: false,
  },
  {
    id: 'rp-7', orderNumber: '10283007', status: 'ready_for_pickup',
    customer: { name: 'Murad L.', phone: '+97430890123', address: 'Al Duhail, Building 3', tier: 'gold' },
    branch: 'Ribs & Burgers, West Bay', pickerEmail: 'staff@ribsnburgers.com',
    items: [
      { id: 'rp7-i1', quantity: 1, name: 'Beef Ribs Full Rack', barcode: '33013', unitPrice: 130, totalPrice: 130, image: img.steak },
      { id: 'rp7-i2', quantity: 2, name: 'Corn on the Cob', barcode: '33014', unitPrice: 18, totalPrice: 36, image: img.salad },
    ],
    subtotal: 166, discount: 0, deliveryFee: 18, total: 184, paymentMethod: 'card', createdAt: mins(14), tags: ['Smoky BBQ'], isDelivery: true,
  },
  {
    id: 'rp-8', orderNumber: '10283008', status: 'ready_for_pickup',
    customer: { name: 'Rawan S.', phone: '+97466901234', address: 'The Pearl, Costa del Mare', tier: 'platinum' },
    branch: 'Coya, Marsa Arabia', pickerEmail: 'staff@coya-doha.com',
    items: [
      { id: 'rp8-i1', quantity: 2, name: 'Ceviche Mixto', barcode: '33015', unitPrice: 95, totalPrice: 190, image: img.shrimp },
      { id: 'rp8-i2', quantity: 2, name: 'Beef Anticucho', barcode: '33016', unitPrice: 75, totalPrice: 150, image: img.steak },
    ],
    subtotal: 340, discount: 30, deliveryFee: 35, total: 345, paymentMethod: 'card', createdAt: mins(9), tags: [], isDelivery: false,
  },
  {
    id: 'rp-9', orderNumber: '10283009', status: 'ready_for_pickup',
    customer: { name: 'Omar W.', phone: '+97455012345', address: 'Wakra, Residential Area, House 33', tier: 'standard' },
    branch: 'Burger King, Ezdan Mall', pickerEmail: 'staff@bk-ezdan.com',
    items: [
      { id: 'rp9-i1', quantity: 3, name: 'Whopper', barcode: '33017', unitPrice: 30, totalPrice: 90, image: img.burger },
      { id: 'rp9-i2', quantity: 3, name: 'Medium Fries', barcode: '33018', unitPrice: 12, totalPrice: 36, image: img.fries },
    ],
    subtotal: 126, discount: 0, deliveryFee: 12, total: 138, paymentMethod: 'cash', createdAt: mins(7), tags: [], isDelivery: true,
  },
  {
    id: 'rp-10', orderNumber: '10283010', status: 'ready_for_pickup',
    customer: { name: 'Leila V.', phone: '+97444123456', address: 'Al Jasra, Building 7, Apt 2', tier: 'gold' },
    branch: 'Bali Hai, Intercontinental', pickerEmail: 'staff@balihai.com',
    items: [
      { id: 'rp10-i1', quantity: 2, name: 'Prawn Pad Thai', barcode: '33019', unitPrice: 68, totalPrice: 136, image: img.pasta },
      { id: 'rp10-i2', quantity: 2, name: 'Mango Sticky Rice', barcode: '33020', unitPrice: 32, totalPrice: 64, image: img.icecream },
    ],
    subtotal: 200, discount: 20, deliveryFee: 22, total: 202, paymentMethod: 'online', createdAt: mins(12), tags: [], isDelivery: false,
  },
  {
    id: 'rp-11', orderNumber: '10283011', status: 'ready_for_pickup',
    customer: { name: 'Saad A.', phone: '+97430234567', address: 'Al Manhal, Street 9, House 6', tier: 'standard' },
    branch: 'Fuddruckers, Vilaggio', pickerEmail: 'staff@fuddruckers.com',
    items: [
      { id: 'rp11-i1', quantity: 2, name: '1/3 lb Mushroom Burger', barcode: '33021', unitPrice: 52, totalPrice: 104, image: img.burger },
      { id: 'rp11-i2', quantity: 2, name: 'Onion Rings', barcode: '33022', unitPrice: 20, totalPrice: 40, image: img.fries },
    ],
    subtotal: 144, discount: 0, deliveryFee: 15, total: 159, paymentMethod: 'card', createdAt: mins(3), tags: [], isDelivery: false,
  },
  {
    id: 'rp-12', orderNumber: '10283012', status: 'ready_for_pickup',
    customer: { name: 'Hind K.', phone: '+97466345678', address: 'New Slata, Building 11, Floor 5', tier: 'platinum' },
    branch: 'Benihana, Marriott', pickerEmail: 'staff@benihana.com',
    items: [
      { id: 'rp12-i1', quantity: 2, name: 'Filet Mignon Hibachi', barcode: '33023', unitPrice: 145, totalPrice: 290, image: img.steak },
      { id: 'rp12-i2', quantity: 2, name: 'Miso Soup', barcode: '33024', unitPrice: 20, totalPrice: 40, image: img.soup },
    ],
    subtotal: 330, discount: 0, deliveryFee: 35, total: 365, paymentMethod: 'card', createdAt: mins(16), tags: [], isDelivery: false,
  },
  {
    id: 'rp-13', orderNumber: '10283013', status: 'ready_for_pickup',
    customer: { name: 'Abdulla R.', phone: '+97444567890', address: 'Fereej Bin Mahmoud, Apt 9', tier: 'gold' },
    branch: 'Karak Chai House, Souq Waqif', pickerEmail: 'staff@karakchai.com',
    items: [
      { id: 'rp13-i1', quantity: 5, name: 'Karak Chai', barcode: '33025', unitPrice: 5, totalPrice: 25, image: img.coffee },
      { id: 'rp13-i2', quantity: 5, name: 'Regag Bread', barcode: '33026', unitPrice: 8, totalPrice: 40, image: img.croissant },
    ],
    subtotal: 65, discount: 0, deliveryFee: 10, total: 75, paymentMethod: 'cash', createdAt: mins(2), tags: [], isDelivery: false,
  },
  {
    id: 'rp-14', orderNumber: '10283014', status: 'ready_for_pickup',
    customer: { name: 'Erika J.', phone: '+97455456789', address: 'Al Mirqab Al Jadeed, Tower 2', tier: 'standard' },
    branch: 'Carluccios, The Pearl', pickerEmail: 'staff@carluccios.com',
    items: [
      { id: 'rp14-i1', quantity: 1, name: 'Spaghetti Carbonara', barcode: '33027', unitPrice: 72, totalPrice: 72, image: img.pasta },
      { id: 'rp14-i2', quantity: 1, name: 'Tiramisu', barcode: '33028', unitPrice: 38, totalPrice: 38, image: img.cheesecake },
    ],
    subtotal: 110, discount: 0, deliveryFee: 15, total: 125, paymentMethod: 'online', createdAt: mins(10), tags: [], isDelivery: false,
  },
  {
    id: 'rp-15', orderNumber: '10283015', status: 'ready_for_pickup',
    customer: { name: 'Nawaf S.', phone: '+97430678901', address: 'Al Thumama, House 19', tier: 'gold' },
    branch: 'Smashburger, Aspire Zone', pickerEmail: 'staff@smashburger.com',
    items: [
      { id: 'rp15-i1', quantity: 2, name: 'Classic Smash Burger', barcode: '33029', unitPrice: 42, totalPrice: 84, image: img.burger },
      { id: 'rp15-i2', quantity: 2, name: 'Smash Fries', barcode: '33030', unitPrice: 16, totalPrice: 32, image: img.fries },
    ],
    subtotal: 116, discount: 0, deliveryFee: 12, total: 128, paymentMethod: 'card', createdAt: mins(6), tags: [], isDelivery: false,
  },
  {
    id: 'rp-16', orderNumber: '10283016', status: 'ready_for_pickup',
    customer: { name: 'Manal O.', phone: '+97466789012', address: 'Umm Salal Mohammed, Building 3', tier: 'standard' },
    branch: 'Crumbl Cookies, Lusail', pickerEmail: 'staff@crumbl.com',
    items: [
      { id: 'rp16-i1', quantity: 6, name: 'Chocolate Chip Cookie', barcode: '33031', unitPrice: 18, totalPrice: 108, image: img.pancakes },
      { id: 'rp16-i2', quantity: 2, name: 'Pink Sugar Cookie', barcode: '33032', unitPrice: 18, totalPrice: 36, image: img.waffles },
    ],
    subtotal: 144, discount: 0, deliveryFee: 12, total: 156, paymentMethod: 'online', createdAt: mins(8), tags: ['Box Packaging'], isDelivery: false,
  },
  {
    id: 'rp-17', orderNumber: '10283017', status: 'ready_for_pickup',
    customer: { name: 'Fahad M.', phone: '+97444890123', address: 'Al Rayyan, Villa Complex 5, House 12', tier: 'platinum' },
    branch: 'Il Teatro, Four Seasons', pickerEmail: 'staff@ilteatro.com',
    items: [
      { id: 'rp17-i1', quantity: 2, name: 'Truffle Pasta', barcode: '33033', unitPrice: 118, totalPrice: 236, image: img.pasta },
      { id: 'rp17-i2', quantity: 2, name: 'Tiramisu', barcode: '33034', unitPrice: 55, totalPrice: 110, image: img.cheesecake },
    ],
    subtotal: 346, discount: 35, deliveryFee: 40, total: 351, paymentMethod: 'card', createdAt: mins(17), tags: [], isDelivery: false,
  },
  {
    id: 'rp-18', orderNumber: '10283018', status: 'ready_for_pickup',
    customer: { name: 'Shaikha N.', phone: '+97455901234', address: 'Al Waab City, Block 3, Apt 7', tier: 'gold' },
    branch: 'Ginos, City Center', pickerEmail: 'staff@ginos.com',
    items: [
      { id: 'rp18-i1', quantity: 1, name: 'BBQ Chicken Pizza', barcode: '33035', unitPrice: 68, totalPrice: 68, image: img.pizza },
      { id: 'rp18-i2', quantity: 2, name: 'Chocolate Lava Cake', barcode: '33036', unitPrice: 35, totalPrice: 70, image: img.cheesecake },
    ],
    subtotal: 138, discount: 0, deliveryFee: 15, total: 153, paymentMethod: 'cash', createdAt: mins(5), tags: [], isDelivery: false,
  },
  {
    id: 'rp-19', orderNumber: '10283019', status: 'ready_for_pickup',
    customer: { name: 'Basma T.', phone: '+97430012678', address: 'Al Hilal, Building 5, Apt 3', tier: 'standard' },
    branch: 'Starbucks, West Bay', pickerEmail: 'staff@starbucks-westbay.com',
    items: [
      { id: 'rp19-i1', quantity: 3, name: 'Caramel Frappuccino', barcode: '33037', unitPrice: 22, totalPrice: 66, image: img.milkshake },
      { id: 'rp19-i2', quantity: 3, name: 'Chocolate Muffin', barcode: '33038', unitPrice: 15, totalPrice: 45, image: img.croissant },
    ],
    subtotal: 111, discount: 0, deliveryFee: 10, total: 121, paymentMethod: 'online', createdAt: mins(4), tags: [], isDelivery: false,
  },
  {
    id: 'rp-20', orderNumber: '10283020', status: 'ready_for_pickup',
    customer: { name: 'Joud A.', phone: '+97444012345', address: 'Madinat Khalifa South, Villa 8', tier: 'platinum' },
    branch: 'Nobu, Four Seasons', pickerEmail: 'staff@nobu-doha.com',
    items: [
      { id: 'rp20-i1', quantity: 2, name: 'Yellowtail Jalapeño', barcode: '33039', unitPrice: 95, totalPrice: 190, image: img.sushi },
      { id: 'rp20-i2', quantity: 2, name: 'Rock Shrimp Tempura', barcode: '33040', unitPrice: 88, totalPrice: 176, image: img.shrimp },
    ],
    subtotal: 366, discount: 0, deliveryFee: 40, total: 406, paymentMethod: 'card', createdAt: mins(13), tags: [], isDelivery: false,
  },
]

export function getTabCounts(orders: Order[]) {
  return {
    needs_action: orders.filter(
      (o) => o.status === 'needs_action' || o.status === 'looking_for_driver' || o.status === 'cancelled'
    ).length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    ready_for_pickup: orders.filter((o) => o.status === 'ready_for_pickup').length,
  }
}
