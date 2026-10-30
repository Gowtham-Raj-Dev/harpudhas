import React from 'react';
import { INITIAL_PRODUCTS } from '@/data/initialData';
import ProductDetailClient from '@/components/ProductDetailClient';

// Required for Next.js static export
export function generateStaticParams() {
  return INITIAL_PRODUCTS.map((product) => ({
    id: product.id,
  }));
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return <ProductDetailClient productId={params.id} />;
}
