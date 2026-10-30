export type CategoryType = 'Hair Care' | 'Face Care' | 'Skin & Body';

export type FormatType =
  | 'Oil & Serum'
  | 'Shampoo & Cleanser'
  | 'Cream & Butter'
  | 'Mask & Soap';

export interface SizeOption {
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  tamilName: string;
  category: CategoryType;
  format: FormatType;
  price: number;
  mrp: number;
  sizeOptions: SizeOption[];
  rating: number;
  reviews: number;
  badge: string;
  image: string;
  shortDesc: string;
  ingredients: string[];
  ritual: string;
  inStock?: boolean;
}

export interface CartItem {
  id: string;
  sizeIndex: number;
  qty: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItemDetail {
  productId: string;
  productName: string;
  sizeLabel: string;
  price: number;
  qty: number;
  image: string;
}

export interface OrderCustomer {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItemDetail[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: 'cod' | 'upi' | 'card';
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
  trackingNumber?: string;
  courierName?: string;
}

export type BannerTargetPage = 'all' | 'home' | 'shop' | 'product';

export interface OfferBanner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  discountCode?: string;
  buttonText: string;
  buttonLink: string;
  imageUrl?: string;
  bgGradient?: string;
  targetPage: BannerTargetPage;
  isActive: boolean;
}

export interface HeaderConfig {
  announcementText: string;
  announcementActive: boolean;
  phone: string;
  whatsapp: string;
  logoTitle: string;
  logoSubtitle: string;
  freeShippingThreshold: number;
}

export interface FooterConfig {
  brandDescription: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  youtube: string;
  copyrightText: string;
}

export interface PageContents {
  home: {
    // 1. Hero & Badges
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    heroBtn1: string;
    heroBtn2: string;
    marqueeText: string;

    // 2. Value Proposition (4 USPs)
    usp1Title: string;
    usp1Desc: string;
    usp2Title: string;
    usp2Desc: string;
    usp3Title: string;
    usp3Desc: string;
    usp4Title: string;
    usp4Desc: string;

    // 3. Categories Section
    catEyebrow: string;
    catTitle: string;
    catSubtitle: string;

    // 4. Bestselling Products Section
    prodEyebrow: string;
    prodTitle: string;
    prodSubtitle: string;
    prodBtnText: string;

    // 5. Ayurvedic Dosha Quiz Section
    quizEyebrow: string;
    quizTitle: string;
    quizSubtitle: string;
    quizMatchTitle: string;

    // 6. 4-Stage Artisan Process Section
    processEyebrow: string;
    processTitle: string;
    processSubtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;

    // 7. Frequently Asked Questions (FAQ) Section
    faqEyebrow: string;
    faqTitle: string;
    faq1Q: string;
    faq1A: string;
    faq2Q: string;
    faq2A: string;
    faq3Q: string;
    faq3A: string;
    faq4Q: string;
    faq4A: string;
  };
  about: {
    title: string;
    subtitle: string;
    storyTitle: string;
    storyText1: string;
    storyText2: string;
  };
  contact: {
    title: string;
    subtitle: string;
    hours: string;
  };
  shop: {
    title: string;
    subtitle: string;
  };
}
