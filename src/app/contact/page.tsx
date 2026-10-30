'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Send,
  CheckCircle2,
} from 'lucide-react';

export default function ContactPage() {
  const { footerConfig, pageContents, triggerToast } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) {
      triggerToast('Please provide your name and message.', 'error');
      return;
    }
    setSubmitted(true);
    triggerToast('Message received! Our herbal advisor will respond shortly.');
  };

  return (
    <div className="w-full min-h-screen bg-[#FCFBF7] pb-24">
      {/* Header */}
      <div className="bg-botanical-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-botanical-800">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="text-xs uppercase tracking-widest text-sandal-400 font-bold">
            Connect With Our Herbalists
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
            {pageContents.contact.title}
          </h1>
          <p className="text-sm text-sandal-200/90 leading-relaxed font-light max-w-xl mx-auto">
            {pageContents.contact.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-sandal-200 shadow-xs space-y-6">
              <h3 className="font-serif font-bold text-xl text-botanical-900 border-b border-sandal-100 pb-4">
                Herbal Center Information
              </h3>

              <div className="space-y-5 text-xs text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-sandal-100 text-botanical-800 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-botanical-900 text-sm">Facility Address</h4>
                    <p className="mt-1 leading-relaxed">{footerConfig.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-sandal-100 text-botanical-800 flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-botanical-900 text-sm">Direct Phone</h4>
                    <p className="mt-1 font-medium">{footerConfig.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-sandal-100 text-botanical-800 flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-botanical-900 text-sm">Email Support</h4>
                    <p className="mt-1 font-medium">{footerConfig.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-sandal-100 text-botanical-800 flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-botanical-900 text-sm">Operating Hours</h4>
                    <p className="mt-1">{pageContents.contact.hours}</p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Action */}
              {footerConfig.whatsapp && (
                <div className="pt-4 border-t border-sandal-100">
                  <a
                    href={`https://wa.me/${footerConfig.whatsapp.replace(/\D/g, '')}?text=Hello%20Harpudhas%20Store%2C%20I%20need%20herbal%20guidance`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Instant WhatsApp Consultation</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-sandal-200 shadow-xs">
              <h3 className="font-serif font-bold text-2xl text-botanical-900 mb-2">
                Send Us a Note
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Fill out the form below and one of our certified Ayurvedic practitioners will respond within 24 hours.
              </p>

              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="font-serif font-bold text-xl text-botanical-900">
                    Message Dispatched Successfully!
                  </h4>
                  <p className="text-xs text-gray-600 max-w-sm mx-auto">
                    Thank you, {name}. We will get back to you with personalized herbal formulation recommendations.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                    className="px-6 py-2 rounded-full bg-botanical-800 text-white text-xs font-semibold"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-botanical-900">
                        Your Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Gowtham"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-sandal-300 text-xs focus:outline-none focus:ring-1 focus:ring-botanical-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-botanical-900">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-sandal-300 text-xs focus:outline-none focus:ring-1 focus:ring-botanical-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-botanical-900">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sandal-300 text-xs focus:outline-none focus:ring-1 focus:ring-botanical-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-botanical-900">
                      Inquiry / Dosha Concern <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your hair fall, skin sensitivity, or question about our herbal oils..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sandal-300 text-xs focus:outline-none focus:ring-1 focus:ring-botanical-700"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-botanical-800 text-white font-bold text-xs hover:bg-botanical-900 transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
