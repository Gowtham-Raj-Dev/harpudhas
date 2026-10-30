'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { withBasePath } from '@/data/products';
import {
  Sparkles,
  Leaf,
  Award,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Heart,
  Droplets,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-[#FCFBF7] pb-24">
      {/* Header */}
      <div className="bg-botanical-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-botanical-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-widest text-sandal-400 font-bold">
            Ancestral Tamil Siddha Lineage
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
            Our Traditional Herbal Heritage
          </h1>
          <p className="text-base text-sandal-200/90 leading-relaxed font-light max-w-2xl mx-auto">
            Preserving indigenous medicinal botanicals, cold wood-milled virgin oils, and bronze uruli slow-cooking.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-20">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-sandal-200">
            <Image
              src={withBasePath('/images/hero-banner.jpg')}
              alt="Harpudhas Herbal Botanical Extraction"
              fill
              className="object-cover"
            />
          </div>
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
              The Genesis
            </span>
            <h2 className="text-3xl font-serif font-bold text-botanical-900 leading-snug">
              Born from Centuries-Old Palm Leaf Inscriptions
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              At Hàrpudha's, we believe authentic beauty is the outward reflection of inner cellular vitality.
              In an era dominated by synthetic foaming agents, silicones, and mineral oil fillers, our mission
              is to preserve the sacred herbal formulas documented by ancient Tamil Siddha physicians.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Nestled near the lush foothills of Pollachi in Tamil Nadu, we cultivate indigenous red hibiscus,
              bhringraj, vetiver, and Krishna tulsi using biodynamic Vedic agriculture.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-botanical-800 text-white font-semibold text-xs hover:bg-botanical-900 transition-colors shadow-md"
              >
                <span>Experience Our Formulations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-sandal-200 shadow-xs space-y-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
              <Leaf className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-lg text-botanical-900">100% Wild Botanicals</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Never cultivated with synthetic pesticides or chemical fertilizers. Hand-harvested during early morning dew.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-sandal-200 shadow-xs space-y-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-sandal-200 text-botanical-900 mx-auto flex items-center justify-center">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-lg text-botanical-900">Bronze Uruli Alchemy</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Slow-cooked in heavy traditional bronze cauldrons for 72 continuous hours to gently extract bioactive nutrients.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-sandal-200 shadow-xs space-y-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-lg text-botanical-900">Lab Batch Integrity</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every single batch undergoes stringent gas chromatography testing for zero pesticide residues and 100% purity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
