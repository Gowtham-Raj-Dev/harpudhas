import {
  Product,
  OfferBanner,
  Order,
  HeaderConfig,
  FooterConfig,
  PageContents,
  ProductPlacement,
  SiteSettings,
} from '@/types/store';
import { PRODUCTS } from './products';

const NEW_ARRIVALS = new Set(['hair-serum-1', 'face-pack-1', 'body-lotion-1', 'body-butter-1']);
const CART_UPSELL = new Set(['hair-serum-1', 'face-wash-1', 'body-soap-1', 'face-pack-1']);

export const INITIAL_PRODUCTS: Product[] = PRODUCTS.map((p, i) => {
  const placements: ProductPlacement[] = ['shop', 'product-related', 'home-quiz'];
  if (i < 6) placements.push('home-featured');
  if (NEW_ARRIVALS.has(p.id)) placements.push('home-new');
  if (CART_UPSELL.has(p.id)) placements.push('cart-upsell');
  return {
    ...p,
    inStock: true,
    isVisible: true,
    placements,
    stock: 50,
    sku: `HRP-${p.id.toUpperCase().replace(/-1$/, '')}`,
    sortOrder: i + 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
});

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  theme: {
    site: { preset: 'botanical', primary: '#132A1F', accent: '#C89D54' },
    admin: { accent: 'emerald', sidebar: 'forest' },
  },
  sections: {
    announcementBar: true,
    homeHero: true,
    homeUsp: true,
    homeCategories: true,
    homeFeatured: true,
    homeNew: true,
    homeQuiz: true,
    homeProcess: true,
    homeFaq: true,
  },
  homeProducts: {
    'home-featured': {
      mode: 'manual',
      rule: 'bestselling',
      category: 'all',
      limit: 6,
      columns: 3,
      hideOutOfStock: false,
      order: PRODUCTS.slice(0, 6).map((p) => p.id),
    },
    'home-new': {
      mode: 'manual',
      rule: 'newest',
      category: 'all',
      limit: 4,
      columns: 4,
      hideOutOfStock: true,
      order: PRODUCTS.filter((p) => NEW_ARRIVALS.has(p.id)).map((p) => p.id),
    },
    'home-quiz': {
      mode: 'auto',
      rule: 'top-rated',
      category: 'all',
      limit: 2,
      columns: 3,
      hideOutOfStock: true,
      order: [],
    },
  },
  newSectionTitle: 'Fresh From the Apothecary',
  newSectionSubtitle: 'Newly crafted micro-batches, just out of the bronze uruli.',
  storeOpen: true,
  closedMessage: 'We are restocking fresh batches. Orders reopen shortly — thank you for your patience!',
  codEnabled: true,
  lowStockThreshold: 10,
  abandonAfterMinutes: 30,
  followUpCoupon: 'WELCOME10',
  followUpTemplates: {
    added_to_cart:
      'Vanakkam {name} 🌿 You left {cart_items} in your Hàrpudha’s basket. Complete your order today with code {coupon} for extra savings: {store_url}',
    checkout_started:
      'Hi {name}, your herbal order ({cart_value}) is almost done! Need help with checkout? Reply here and we’ll assist. Use {coupon} for a little extra off 🌿',
    details_entered:
      'Hi {name}, we noticed your order for {cart_items} ({cart_value}) wasn’t completed. Shall we place it for you? Cash on delivery available. Code {coupon} still active!',
    ordered: 'Thank you {name} for choosing Hàrpudha’s 🙏 How are you liking your products? We’d love your feedback.',
    general: 'Vanakkam {name} 🌿 Fresh batches of our Siddha hair oils and saffron creams are in. Shop now with code {coupon}: {store_url}',
  },
};

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
    // 1. Hero & Badges
    heroBadge: 'பாரம்பரிய தமிழ் சித்த மருத்துவம் • 100% தூய மூலிகை',
    heroTitle: 'Awaken Timeless Herbal Radiance With Sacred Botanicals.',
    heroSubtitle:
      'Slow-infused in traditional bronze urulis with hand-harvested Western Ghats herbs, cold-pressed virgin seed oils, and Grade-1 Kashmiri saffron. Zero sulfates, zero silicones, 100% chemical-free.',
    heroBtn1: 'Shop Herbal Catalog',
    heroBtn2: 'Take 30-Sec Dosha Quiz',
    marqueeText: '🌿 100% Herbal Siddha Formulations • Hand-Harvested Herbs from Pollachi • Bronze Uruli Infusions • Zero Sulfates & Parabens • Free Shipping Above ₹499 • 🌿',

    // 2. Value Proposition (4 USPs)
    usp1Title: '100% Herbal Siddha',
    usp1Desc: 'Nil Sulfates, Parabens or Chemicals',
    usp2Title: 'Bronze Uruli Alchemy',
    usp2Desc: '72-Hour Traditional Slow-Cooking',
    usp3Title: 'Free Express Delivery',
    usp3Desc: 'On all orders above ₹499 in India',
    usp4Title: 'Lab Batch Certified',
    usp4Desc: 'Direct From Pollachi Farmstead',

    // 3. Categories Section
    catEyebrow: 'Ancestral Collections',
    catTitle: 'Shop By Ancestral Ritual',
    catSubtitle: 'Every formula addresses root concerns through handpicked native herbs and stone-ground extracts.',

    // 4. Bestselling Products Section
    prodEyebrow: 'Community Favorites',
    prodTitle: 'Signature Herbal Formulations',
    prodSubtitle: 'Micro-batched with zero artificial fillers for visible cellular nourishment.',
    prodBtnText: 'View All Products',

    // 5. Ayurvedic Dosha Quiz Section
    quizEyebrow: 'Ancestral Diagnostic',
    quizTitle: 'Discover Your Tailored Siddha Routine',
    quizSubtitle: 'Take 30 seconds to select your primary focus area. Our herbal experts have mapped traditional botanicals to restore natural equilibrium.',
    quizMatchTitle: 'Recommended Routine',

    // 6. 4-Stage Artisan Process Section
    processEyebrow: 'The Artisan Process',
    processTitle: 'From Sacred Ghats to Your Daily Vanity',
    processSubtitle: 'No industrial speed-cuts. Every bottle requires 14 days of traditional Siddha patience.',
    step1Title: 'Wild Herb Foraging',
    step1Desc: 'Fresh red hibiscus, karisalankanni, and vetiver roots harvested at dawn from Pollachi foothill groves.',
    step2Title: 'Cold Wood-Milling',
    step2Desc: 'Virgin coconut and gingelly oils extracted via slow wooden vaagai chekku mills with zero thermal degradation.',
    step3Title: 'Bronze Uruli Infusion',
    step3Desc: 'Botanicals slow-simmered in heirloom heavy bronze vats for 72 hours under constant gentle stirring.',
    step4Title: 'Lab Batch Certified',
    step4Desc: 'Independently tested for zero heavy metals, zero microbes, and packaged in dark UV-protective glass bottles.',

    // 7. Frequently Asked Questions (FAQ) Section
    faqEyebrow: 'Got Questions?',
    faqTitle: 'Frequently Asked Questions',
    faq1Q: 'How is Hàrpudha’s hair oil different from regular commercial oils?',
    faq1A: 'Unlike commercial oils that use 80% liquid paraffin (mineral oil) and artificial fragrance, our oils are prepared using 100% pure cold wood-pressed coconut and sesame base, slow-infused for 72 hours in heavy bronze urulis with fresh red hibiscus flowers, karisalankanni juice, and 18 mountain herbs.',
    faq2Q: 'Are your products safe for sensitive and acne-prone skin?',
    faq2A: 'Yes, absolutely. Every formulation is free from parabens, phthalates, synthetic preservatives, and artificial colorants. We use natural herbs like wild turmeric, neem, and pure saffron that soothe skin inflammation naturally.',
    faq3Q: 'How long does delivery take across India?',
    faq3A: 'We dispatch all orders within 24 hours of confirmation from our Pollachi apothecary via Delhivery Express or BlueDart. Deliveries to Tamil Nadu take 1-2 days; metro cities across India take 2-4 business days.',
    faq4Q: 'Can men and teenagers use these Siddha formulations?',
    faq4A: 'Yes! Traditional Siddha formulations are unisex and suitable for all age groups (above 3 years). Both men and women benefit equally from our hair oils, ubtans, and skin remedies.',
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
