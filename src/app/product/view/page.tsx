'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';

// Products created from the admin panel don't exist at build time (static export),
// so they are rendered here via /product/view?id=...
function ProductView() {
  const id = useSearchParams().get('id') || '';
  return <ProductDetailClient productId={id} />;
}

export default function ProductViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ProductView />
    </Suspense>
  );
}
