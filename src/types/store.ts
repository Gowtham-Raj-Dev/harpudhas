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

// Where a product is allowed to appear on the storefront
export type ProductPlacement =
  | 'home-featured'
  | 'home-new'
  | 'home-quiz'
  | 'shop'
  | 'product-related'
  | 'cart-upsell';

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
  // Admin-controlled visibility & merchandising
  isVisible?: boolean;
  placements?: ProductPlacement[];
  stock?: number;
  sku?: string;
  sortOrder?: number;
  createdAt?: string;
}

export interface CustomerRecord {
  id: string; // normalised phone digits
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  tags: string[];
  notes: string;
  createdAt: string;
  source: 'order' | 'manual' | 'signup';
}

// ---------- Customer journey ----------

export type JourneyStage = 'browsing' | 'viewed_product' | 'added_to_cart' | 'checkout_started' | 'details_entered' | 'ordered';

export interface JourneyEvent {
  type: JourneyStage | 'page_view' | 'removed_from_cart' | 'signed_in';
  at: string;
  label: string;
}

export type FollowUpStatus = 'new' | 'contacted' | 'converted' | 'not_interested';

export interface VisitorJourney {
  id: string;
  firstSeen: string;
  lastSeen: string;
  stage: JourneyStage;
  reached: Partial<Record<JourneyStage, string>>; // first time each stage was reached
  fullName?: string;
  phone?: string;
  email?: string;
  city?: string;
  signedIn?: boolean;
  signedInAt?: string;
  cart: { productId: string; name: string; size: string; qty: number; price: number }[];
  cartValue: number;
  viewedProducts: string[];
  orderIds: string[];
  pageViews: number;
  source: string;
  device: string;
  events: JourneyEvent[];
  followUp: { status: FollowUpStatus; note: string; contactCount: number; lastContactedAt?: string };
}

// ---------- Integrations ----------

export type WebhookEvent =
  | 'order.created'
  | 'order.status_changed'
  | 'customer.stage_changed'
  | 'customer.created'
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'sync.full'
  | 'webhook.test';

export interface WebhookConfig {
  enabled: boolean;
  url: string;
  secret: string; // used to sign payloads (HMAC-SHA256)
  events: Record<Exclude<WebhookEvent, 'sync.full' | 'webhook.test'>, boolean>;
  stripUploadedImages: boolean;
  lastFullSync?: string;
}

export interface WebhookLogEntry {
  id: string;
  event: WebhookEvent;
  timestamp: string;
  status: 'success' | 'failed' | 'sent';
  httpStatus?: number;
  error?: string;
  bytes: number;
  summary: string;
  payload?: string; // kept (if small) so failed deliveries can be retried
}

export interface DeliveryPartner {
  id: string;
  provider: string;
  enabled: boolean;
  isDefault: boolean;
  mode: 'test' | 'live';
  apiKey: string;
  apiSecret: string;
  accountId: string;
  pickupPincode: string;
  trackingUrlTemplate: string; // use {awb}
  notes: string;
}

export interface IntegrationSettings {
  webhook: WebhookConfig;
  deliveryPartners: DeliveryPartner[];
}

export type HomeSectionId = 'home-featured' | 'home-new' | 'home-quiz';

export type AutoRule = 'bestselling' | 'newest' | 'top-rated' | 'most-reviewed' | 'discount' | 'price-low' | 'price-high';

export interface HomeSectionConfig {
  mode: 'manual' | 'auto';
  rule: AutoRule;
  category: 'all' | CategoryType;
  limit: number; // for the routine finder: per focus area
  columns: 3 | 4;
  hideOutOfStock: boolean;
  order: string[]; // manual ordering of product ids
}

export interface ThemeSettings {
  site: { preset: string; primary: string; accent: string }; // preset id or 'custom'
  admin: { accent: string; sidebar: string };
}

export interface SiteSettings {
  theme: ThemeSettings;
  sections: {
    announcementBar: boolean;
    homeHero: boolean;
    homeUsp: boolean;
    homeCategories: boolean;
    homeFeatured: boolean;
    homeNew: boolean;
    homeQuiz: boolean;
    homeProcess: boolean;
    homeFaq: boolean;
  };
  homeProducts: Record<HomeSectionId, HomeSectionConfig>;
  newSectionTitle: string;
  newSectionSubtitle: string;
  storeOpen: boolean;
  closedMessage: string;
  codEnabled: boolean;
  lowStockThreshold: number;
  abandonAfterMinutes: number;
  followUpCoupon: string;
  followUpTemplates: Record<'added_to_cart' | 'checkout_started' | 'details_entered' | 'ordered' | 'general', string>;
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
