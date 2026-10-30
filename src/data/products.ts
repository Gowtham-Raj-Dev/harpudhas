import { Product } from '@/types/product';

export const BRAND_LOGO_URL =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5RIMZ3-6u4TixlZvMjiC0kfsq7aSov5k1jshaZlyxCg&s=10';

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const withBasePath = (path: string): string => {
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${BASE_PATH}${path}`;
};

export const PRODUCTS: Product[] = [
  {
    id: 'hair-oil-1',
    name: 'Hibiscus & Bhringraj Root-Revive Hair Oil',
    tamilName: 'செம்பருத்தி & கரிசலாங்கண்ணி கூந்தல் தைலம்',
    category: 'Hair Care',
    format: 'Oil & Serum',
    price: 549,
    mrp: 699,
    sizeOptions: [
      { label: '100 ml', price: 549 },
      { label: '200 ml', price: 949 },
    ],
    rating: 4.9,
    reviews: 342,
    badge: 'Bestseller',
    image: '/images/hair-oil.jpg',
    shortDesc:
      'Cold-pressed virgin coconut & sesame oil slow-infused with fresh red hibiscus petals, bhringraj leaves, and wild amla.',
    ingredients: [
      'Fresh Red Hibiscus Flowers',
      'Bhringraj (Karisalankanni)',
      'Cold-Pressed Gingelly & Coconut Oil',
      'Indian Gooseberry (Nellikai)',
      'Fenugreek Seeds',
    ],
    ritual:
      'Warm 2 teaspoons between palms and massage gently into scalp for 10 minutes before bedtime or 45 minutes before washing.',
  },
  {
    id: 'hair-shampoo-1',
    name: 'Shikakai, Aloe & Fenugreek Herbal Shampoo',
    tamilName: 'சீயக்காய் & கற்றாழை மூலிகை ஷாம்பூ',
    category: 'Hair Care',
    format: 'Shampoo & Cleanser',
    price: 429,
    mrp: 520,
    sizeOptions: [
      { label: '200 ml', price: 429 },
      { label: '400 ml', price: 789 },
    ],
    rating: 4.8,
    reviews: 289,
    badge: 'Sulfate-Free',
    image: '/images/hair-shampoo.jpg',
    shortDesc:
      'Gentle, low-lather botanical cleanser crafted with sun-dried shikakai pods, raw aloe vera pulp, and soaked methi seeds.',
    ingredients: [
      'Whole Shikakai Pods',
      'Fresh Aloe Vera Pulp',
      'Soaked Fenugreek (Vendhayam)',
      'Reetha (Soapnut) Extract',
      'Hibiscus Leaf Mucilage',
    ],
    ritual:
      'Apply to wet scalp and hair, massage into a soft herbal lather for 2 minutes, and rinse thoroughly with lukewarm water.',
  },
  {
    id: 'hair-serum-1',
    name: 'Rosemary, Vetiver & Kalonji Scalp Tonic Spray',
    tamilName: 'ரோஸ்மேரி & வெட்டிவேர் கூந்தல் வளர்ச்சி டானிக்',
    category: 'Hair Care',
    format: 'Oil & Serum',
    price: 499,
    mrp: 625,
    sizeOptions: [
      { label: '100 ml', price: 499 },
      { label: '200 ml', price: 899 },
    ],
    rating: 4.9,
    reviews: 198,
    badge: 'New Launch',
    image: '/images/hair-serum.jpg',
    shortDesc:
      'Non-greasy water-based botanical hair growth mist hydro-distilled from fresh rosemary sprigs, vetiver roots, and black seed.',
    ingredients: [
      'Steam-Distilled Rosemary Hydrosol',
      'Ramacham Vetiver Root',
      'Kalonji (Karunjeeragam) Extract',
      'Peppermint Leaf',
      'Curry Leaf Bio-Active',
    ],
    ritual:
      'Spritz directly onto clean scalp roots every night and massage lightly with fingertips. No rinsing required.',
  },
  {
    id: 'face-cream-1',
    name: 'Kumkumadi Saffron & Sandalwood Radiance Cream',
    tamilName: 'குங்குமப்பூ & சந்தனம் முகப்பொலிவு க்ரீம்',
    category: 'Face Care',
    format: 'Cream & Butter',
    price: 699,
    mrp: 899,
    sizeOptions: [
      { label: '50 g', price: 699 },
      { label: '100 g', price: 1249 },
    ],
    rating: 5.0,
    reviews: 512,
    badge: 'Signature',
    image: '/images/face-cream.jpg',
    shortDesc:
      'Velvety night & day herbal cream whipped with Grade-1 Kashmiri saffron threads, Mysore sandalwood, and pink lotus extract.',
    ingredients: [
      'Kashmiri Pampore Saffron',
      'Pure White Sandalwood Paste',
      'Sacred Pink Lotus Petals',
      'Manjistha Root',
      'Sweet Almond & Shea Emulsion',
    ],
    ritual:
      'Dot a pea-sized amount across cleansed face and neck morning and night; massage upward until absorbed.',
  },
  {
    id: 'face-wash-1',
    name: 'Neem, Tulsi & Green Aloe Purifying Face Wash',
    tamilName: 'வேப்பிலை & துளசி முக சுத்திகரிப்பு ஜெல்',
    category: 'Face Care',
    format: 'Shampoo & Cleanser',
    price: 369,
    mrp: 450,
    sizeOptions: [
      { label: '150 ml', price: 369 },
      { label: '300 ml', price: 649 },
    ],
    rating: 4.8,
    reviews: 274,
    badge: 'Acne Defence',
    image: '/images/face-wash.jpg',
    shortDesc:
      'Soap-free emerald herbal facial cleanser that clears excess sebum, blackheads, and blemishes without stripping natural moisture.',
    ingredients: [
      'Tender Neem Leaf Distillate',
      'Krishna Tulsi (Holy Basil)',
      'Cold-Pressed Aloe Vera Gel',
      'Green Tea Polyphenols',
      'Vetiver Root Water',
    ],
    ritual:
      'Pump 1–2 drops onto damp palms, massage gently over face in circular motions for 45 seconds, and rinse cool.',
  },
  {
    id: 'face-pack-1',
    name: 'Red Sandalwood, Rose & Raw Honey Glow Pack',
    tamilName: 'செஞ்சந்தனம் & பன்னீர் ரோஜா ஃபேஸ் பேக்',
    category: 'Face Care',
    format: 'Mask & Soap',
    price: 489,
    mrp: 599,
    sizeOptions: [
      { label: '100 g', price: 489 },
      { label: '200 g', price: 879 },
    ],
    rating: 4.9,
    reviews: 215,
    badge: 'Bridal Glow',
    image: '/images/face-pack.jpg',
    shortDesc:
      'Ready-to-apply terracotta jar of finely stone-ground Raktha Chandan (Red Sandalwood), Damask rose petals, and wild forest honey.',
    ingredients: [
      'Pure Red Sandalwood (Raktha Chandan)',
      'Paneer Rose Petal Paste',
      'Unprocessed Forest Honey',
      'Multani Mitti Clay',
      'Licorice (Athimadhuram)',
    ],
    ritual:
      'Spread an even layer over damp face and neck, relax for 12 minutes until semi-dry, and rinse with circular massage.',
  },
  {
    id: 'body-butter-1',
    name: 'Kasthuri Turmeric & Sandalwood Ubtan Body Butter',
    tamilName: 'கஸ்தூரி மஞ்சள் & சந்தனம் பாடி பட்டர் க்ரீம்',
    category: 'Skin & Body',
    format: 'Cream & Butter',
    price: 599,
    mrp: 749,
    sizeOptions: [
      { label: '150 g', price: 599 },
      { label: '250 g', price: 929 },
    ],
    rating: 4.9,
    reviews: 318,
    badge: 'Tan Removal',
    image: '/images/body-butter.jpg',
    shortDesc:
      'Rich whipped body cream blending non-staining wild Kasthuri Manjal, sandalwood powder, and sweet almond butter for 24-hour softness.',
    ingredients: [
      'Wild Kasthuri Manjal (Aromatic Turmeric)',
      'Mysore Sandalwood Powder',
      'Cold-Pressed Sweet Almond Oil',
      'Unrefined Cocoa & Shea Butter',
      'Vitamin-Rich Wheatgerm',
    ],
    ritual:
      'Smooth generously over slightly damp skin immediately after bath to lock in moisture and brighten sun-exposed skin.',
  },
  {
    id: 'body-lotion-1',
    name: 'Damask Rose, Vetiver & Shea Hydrating Body Milk',
    tamilName: 'பன்னீர் ரோஜா & வெட்டிவேர் பாடி லோஷன்',
    category: 'Skin & Body',
    format: 'Mask & Soap',
    price: 469,
    mrp: 580,
    sizeOptions: [
      { label: '200 ml', price: 469 },
      { label: '400 ml', price: 829 },
    ],
    rating: 4.8,
    reviews: 186,
    badge: 'Cooling Hydration',
    image: '/images/body-lotion.jpg',
    shortDesc:
      'Feather-light daily herbal body lotion infused with steam-distilled Paneer rose water, cooling vetiver roots, and raw shea butter.',
    ingredients: [
      'Damask Rose Hydrosol',
      'Wild Vetiver Root Infusion',
      'Raw Unrefined Shea Butter',
      'Cold-Pressed Sesame Oil',
      'Chamomile & Calendula',
    ],
    ritual:
      'Dispense 2–3 pumps and glide over arms, legs, and body daily for cool, breathable hydration.',
  },
  {
    id: 'body-soap-1',
    name: 'Nalangu Maavu, Neem & Jasmine Artisan Bath Pack',
    tamilName: 'நலங்கு மாவு & வேப்பிலை மூலிகை குளியல் சோப்',
    category: 'Skin & Body',
    format: 'Mask & Soap',
    price: 399,
    mrp: 499,
    sizeOptions: [
      { label: 'Pack of 2 Bars + Ubtan', price: 399 },
      { label: 'Family Pack of 4 Bars', price: 729 },
    ],
    rating: 4.9,
    reviews: 405,
    badge: 'Traditional Bath',
    image: '/images/body-soap.jpg',
    shortDesc:
      'Cold-processed herbal bath soap bars paired with traditional 18-herb Nalangu Maavu bath powder for naturally fragrant, healthy skin.',
    ingredients: [
      '18-Herb Nalangu Maavu',
      'Crushed Neem & Tulsi Leaves',
      'Green Gram (Pasi Payaru)',
      'Madurai Jasmine Essential Oil',
      'Virgin Coconut Oil Base',
    ],
    ritual:
      'Lather the cold-pressed bar over wet skin or mix the accompanying herbal ubtan powder with rose water for a weekly detox scrub.',
  },
];
