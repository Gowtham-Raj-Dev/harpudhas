import { Product, OfferBanner, Order, HeaderConfig, FooterConfig } from '@/types/store';
import { PRODUCTS } from './products';

export const INITIAL_PRODUCTS: Product[] = PRODUCTS.map((p) => ({
  ...p,
  inStock: true,
}));

export const INITIAL_BANNERS: OfferBanner[] = [
  {
    id: 'banner-1',
    title: '🌿 Grand Herbal Harvest Festival — 20% Instant OFF',
    subtitle: 'Pure cold-pressed hair oils, artisanal soaps, and saffron creams handmade in micro-batches.',
    badge: 'Limited Period Offer',
    discountCode: 'HARPUDHAS20',
    buttonText: 'Shop Essentials',
    buttonLink: '/shop',
    bgGradient: 'from-emerald-900 via-botanical-800 to-teal-950',
    targetPage: 'home',
    isActive: true,
  },
  {
    id: 'banner-2',
    title: '✨ Free Nalangu Maavu Artisan Ubtan Jar with Orders Over ₹799',
    subtitle: 'Ancient 18-herb traditional bridal bath blend automatically gifted at checkout!',
    badge: 'Complimentary Gift',
    discountCode: 'FREEUBTAN',
    buttonText: 'Explore Hair & Skin',
    buttonLink: '/shop',
    bgGradient: 'from-amber-950 via-sandal-700 to-amber-900',
    targetPage: 'shop',
    isActive: true,
  },
  {
    id: 'banner-3',
    title: '🚚 Zero Shipping Charges Across India on All Orders',
    subtitle: 'No minimum cart value required this weekend. Freshly dispatched from our Pollachi herbal facility.',
    badge: 'Special Weekend Deal',
    buttonText: 'Track Your Order',
    buttonLink: '/orders',
    bgGradient: 'from-slate-900 via-botanical-900 to-emerald-950',
    targetPage: 'all',
    isActive: true,
  },
  {
    id: 'banner-4',
    title: '🌺 Pure Kashmiri Saffron Radiance Combo — Save ₹350',
    subtitle: 'Kumkumadi Radiance Cream + Red Sandalwood Glow Pack duo for glass-like natural herbal glow.',
    badge: 'Best-Selling Duo',
    discountCode: 'GLOWCOMBO',
    buttonText: 'View Product Details',
    buttonLink: '/product/face-cream-1',
    bgGradient: 'from-rose-950 via-terracotta-600 to-amber-950',
    targetPage: 'product',
    isActive: false, // Can be toggled on by admin
  },
];

export const INITIAL_HEADER_CONFIG: HeaderConfig = {
  announcementText: '🌿 Authentic Siddha & Ayurvedic Formulations • Free Shipping Above ₹499 • Use Code: HARPUDHAS15 for 15% OFF',
  announcementActive: true,
  phone: '+91 98420 56789',
  whatsapp: '+91 98420 56789',
  logoTitle: "HÀRPUDHA'S",
  logoSubtitle: 'TRADITIONAL SIDDHA & BOTANICAL SKINCARE',
  freeShippingThreshold: 499,
};

export const INITIAL_FOOTER_CONFIG: FooterConfig = {
  brandDescription:
    'Handcrafted ancestral wellness from Tamil Nadu. Every oil, cleanser, and butter is slow-cooked in traditional bronze urulis using cold-pressed virgin seed oils and hand-harvested wild botanicals.',
  address: 'Harpudhas Herbal Wellness, No. 48/2, Pollachi Main Road, Coimbatore, Tamil Nadu — 642001',
  phone: '+91 98420 56789',
  email: 'care@harpudhas.com',
  whatsapp: '+91 98420 56789',
  instagram: 'https://instagram.com',
  facebook: 'https://facebook.com',
  youtube: 'https://youtube.com',
  copyrightText: "© 2026 Hàrpudha's Herbal Botanicals. All Rights Reserved. Pure. Ethical. Siddha Formulated.",
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'HARP-7821',
    createdAt: '2026-10-29T10:30:00.000Z',
    customer: {
      fullName: 'Priya Sundaram',
      phone: '9840123456',
      email: 'priya.s@gmail.com',
      address: 'Plot 14, 3rd Cross Street, Gandhi Nagar, Adyar',
      landmark: 'Near Cancer Institute',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600020',
      notes: 'Please ring bell twice upon arrival',
    },
    items: [
      {
        productId: 'hair-oil-1',
        productName: 'Hibiscus & Bhringraj Root-Revive Hair Oil',
        sizeLabel: '200 ml',
        price: 949,
        qty: 1,
        image: '/images/hair-oil.jpg',
      },
      {
        productId: 'face-cream-1',
        productName: 'Kumkumadi Saffron & Sandalwood Radiance Cream',
        sizeLabel: '50 g',
        price: 699,
        qty: 1,
        image: '/images/face-cream.jpg',
      },
    ],
    subtotal: 1648,
    discount: 247,
    shipping: 0,
    total: 1401,
    paymentMethod: 'upi',
    status: 'Shipped',
    trackingNumber: 'DELHIVERY-TN948201',
    courierName: 'Delhivery Express',
    statusHistory: [
      {
        status: 'Pending',
        timestamp: '2026-10-29T10:30:00.000Z',
        note: 'Order placed by customer via UPI',
      },
      {
        status: 'Confirmed',
        timestamp: '2026-10-29T11:15:00.000Z',
        note: 'Payment verified and order accepted by store admin',
      },
      {
        status: 'Processing',
        timestamp: '2026-10-29T14:00:00.000Z',
        note: 'Freshly packed in eco-friendly glass containers with tamper seal',
      },
      {
        status: 'Shipped',
        timestamp: '2026-10-30T09:00:00.000Z',
        note: 'Dispatched via Delhivery Express (AWB: DELHIVERY-TN948201)',
      },
    ],
  },
  {
    id: 'HARP-7822',
    createdAt: '2026-10-30T04:15:00.000Z',
    customer: {
      fullName: 'Karthik Subramanian',
      phone: '9443219870',
      email: 'karthik.subbu@outlook.com',
      address: 'Flat 4B, Emerald Heights, Race Course Road',
      landmark: 'Opposite Government Arts College',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641018',
    },
    items: [
      {
        productId: 'body-soap-1',
        productName: 'Nalangu Maavu, Neem & Jasmine Artisan Bath Pack',
        sizeLabel: 'Family Pack of 4 Bars',
        price: 729,
        qty: 2,
        image: '/images/body-soap.jpg',
      },
      {
        productId: 'hair-shampoo-1',
        productName: 'Shikakai, Aloe & Fenugreek Herbal Shampoo',
        sizeLabel: '400 ml',
        price: 789,
        qty: 1,
        image: '/images/hair-shampoo.jpg',
      },
    ],
    subtotal: 2247,
    discount: 337,
    shipping: 0,
    total: 1910,
    paymentMethod: 'cod',
    status: 'Confirmed',
    statusHistory: [
      {
        status: 'Pending',
        timestamp: '2026-10-30T04:15:00.000Z',
        note: 'Order placed via Cash on Delivery',
      },
      {
        status: 'Confirmed',
        timestamp: '2026-10-30T08:00:00.000Z',
        note: 'Customer phone confirmed by admin',
      },
    ],
  },
  {
    id: 'HARP-7823',
    createdAt: '2026-10-30T08:45:00.000Z',
    customer: {
      fullName: 'Ananya Raghavan',
      phone: '9789054321',
      email: 'ananya.r@yahoo.com',
      address: 'No. 22, 1st Main Road, Anna Nagar West',
      landmark: 'Near Roundtana',
      city: 'Madurai',
      state: 'Tamil Nadu',
      pincode: '625020',
    },
    items: [
      {
        productId: 'hair-serum-1',
        productName: 'Rosemary, Vetiver & Kalonji Scalp Tonic Spray',
        sizeLabel: '100 ml',
        price: 499,
        qty: 1,
        image: '/images/hair-serum.jpg',
      },
    ],
    subtotal: 499,
    discount: 0,
    shipping: 0,
    total: 499,
    paymentMethod: 'upi',
    status: 'Pending',
    statusHistory: [
      {
        status: 'Pending',
        timestamp: '2026-10-30T08:45:00.000Z',
        note: 'New order awaiting administrative confirmation',
      },
    ],
  },
];
