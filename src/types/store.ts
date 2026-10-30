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
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    catTitle: string;
    catSubtitle: string;
    prodTitle: string;
    prodSubtitle: string;
    processTitle: string;
    processSubtitle: string;
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
