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
}

export interface CartItem {
  id: string;
  sizeIndex: number;
  qty: number;
}
