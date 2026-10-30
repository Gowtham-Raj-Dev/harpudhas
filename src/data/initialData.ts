import { Product, OfferBanner, Order, HeaderConfig, FooterConfig, PageContents } from '@/types/store';
import { PRODUCTS } from './products';

export const INITIAL_PRODUCTS: Product[] = PRODUCTS.map((p) => ({
  ...p,
  inStock: true,
}));

export const INITIAL_BANNERS: OfferBanner[] = [
  {
    id: 'banner-1',
    title: 'Grand Herbal Harvest Festival',
    subtitle: 'Pure cold-pressed virgin oils, Kashmiri saffron creams & artisanal soaps handmade in micro-batches.',
    badge: 'Festival Special',
    discountCode: 'HARPUDHAS20',
    buttonText: 'Shop Essentials',
    buttonLink: '/shop',
    imageUrl: '/images/hero-banner.jpg',
    targetPage: 'home',
    isActive: true,
  },
  {
    id: 'banner-2',
    title: 'Cold-Pressed Root-Revive Hair Oil',
    subtitle: 'Slow-infused in bronze urulis with fresh red hibiscus flowers and wild bhringraj leaves.',
    badge: 'Signature Formula',
    discountCode: 'HERBAL15',
    buttonText: 'Explore Hair Care',
    buttonLink: '/shop?category=Hair Care',
    imageUrl: '/images/hair-oil.jpg',
    targetPage: 'home',
    isActive: true,
  },
  {
    id: 'banner-3',
    title: 'Kumkumadi Kashmiri Saffron & Sandalwood',
    subtitle: 'Experience ancestral bridal glow with Grade-1 Pampore saffron threads and Mysore sandalwood.',
    badge: 'Bridal Radiance',
    discountCode: 'SAFFRONGLOW',
    buttonText: 'View Radiance Care',
    buttonLink: '/shop?category=Face Care',
    imageUrl: '/images/face-cream.jpg',
    targetPage: 'home',
    isActive: true,
  },
];

export const INITIAL_HEADER_CONFIG: HeaderConfig = {
  announcementText: '🌿 Authentic Siddha & Ayurvedic Formulations • Free Express Delivery Above ₹499 • Use Code: HARPUDHAS15 for 15% OFF',
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

export const INITIAL_PAGE_CONTENTS: PageContents = {
  home: {
    heroBadge: 'பாரம்பரிய தமிழ் சித்த மருத்துவம் • 100% தூய மூலிகை',
    heroTitle: 'Awaken Timeless Herbal Radiance With Sacred Botanicals.',
    heroSubtitle:
      'Slow-infused in traditional bronze urulis with hand-harvested Western Ghats herbs, cold-pressed virgin seed oils, and Grade-1 Kashmiri saffron. Zero sulfates, zero silicones, 100% chemical-free.',
    catTitle: 'Shop By Ancestral Ritual',
    catSubtitle: 'Every formula addresses root concerns through handpicked native herbs and stone-ground extracts.',
    prodTitle: 'Signature Herbal Formulations',
    prodSubtitle: 'Micro-batched with zero artificial fillers for visible cellular nourishment.',
    processTitle: 'From Sacred Ghats to Your Daily Vanity',
    processSubtitle: 'No industrial speed-cuts. Every bottle requires 14 days of traditional Siddha patience.',
  },
  about: {
    title: 'Our Traditional Herbal Heritage',
    subtitle: 'Preserving indigenous medicinal botanicals, cold wood-milled virgin oils, and bronze uruli slow-cooking.',
    storyTitle: 'Born from Centuries-Old Palm Leaf Inscriptions',
    storyText1:
      'At Hàrpudha’s, we believe authentic beauty is the outward reflection of inner cellular vitality. In an era dominated by synthetic foaming agents, silicones, and mineral oil fillers, our mission is to preserve the sacred herbal formulas documented by ancient Tamil Siddha physicians.',
    storyText2:
      'Nestled near the lush foothills of Pollachi in Tamil Nadu, we cultivate indigenous red hibiscus, bhringraj, vetiver, and Krishna tulsi using biodynamic Vedic agriculture.',
  },
  contact: {
    title: 'Contact & Herbal Consultation',
    subtitle: 'Need guidance on choosing the right Siddha hair oil or facial routine? Reach out directly to our Pollachi care center.',
    hours: 'Monday – Saturday: 9:00 AM – 7:30 PM IST',
  },
  shop: {
    title: 'All Herbal Formulations',
    subtitle: 'Handcrafted with cold-pressed botanical oils, sun-dried roots, and sacred floral extracts.',
  },
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
