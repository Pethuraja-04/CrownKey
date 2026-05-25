'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  HandshakeIcon,
  BotMessageSquare,
  Phone,
  Star,
  Heart,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const FEATURES = [
  {
    id: 'verified',
    icon: BadgeCheck,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    accentColor: 'from-emerald-500/10',
    tag: 'Trust & Safety',
    title: 'Verified Listings Only',
    description:
      'Every listing on CrownKey goes through a manual verification process. Our team confirms ownership documents, property existence, and accurate pricing — so you never waste time on fraudulent ads.',
    highlight: '100% Owner-Verified',
    demo: (
      <div className="flex flex-col gap-3">
        {[
          { label: 'Ownership Docs', done: true },
          { label: 'Site Inspection', done: true },
          { label: 'Price Accuracy', done: true },
          { label: 'Legal Clearance', done: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-zinc-700">{item.label}</span>
          </div>
        ))}
        <div className="mt-2 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-700 text-xs font-bold">
          <BadgeCheck className="w-3.5 h-3.5" />
          Verified Property
        </div>
      </div>
    ),
  },
  {
    id: 'nobrokerage',
    icon: HandshakeIcon,
    iconColor: 'text-luxury-gold',
    iconBg: 'bg-luxury-gold/10 border-luxury-gold/20',
    accentColor: 'from-amber-500/10',
    tag: 'Zero Commission',
    title: 'No Broker. No Fees.',
    description:
      'Connect directly with property owners without a middleman. CrownKey eliminates brokerage fees entirely — what you see is what you pay. Save up to 2% on every transaction.',
    highlight: 'Save up to ₹2L on a 1Cr property',
    demo: (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Property Price</span>
          <span className="font-bold text-zinc-900">₹1,00,00,000</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Brokerage (Typical 2%)</span>
          <span className="font-bold text-red-500 line-through">₹2,00,000</span>
        </div>
        <div className="border-t border-zinc-100 pt-2 flex items-center justify-between text-sm">
          <span className="text-zinc-500">CrownKey Fee</span>
          <span className="font-bold text-emerald-600">₹0</span>
        </div>
        <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-[12px] p-3 text-center">
          <p className="text-xs text-zinc-500 mb-0.5">You save</p>
          <p className="font-display text-2xl font-bold text-luxury-gold">₹2,00,000</p>
        </div>
      </div>
    ),
  },
  {
    id: 'ai',
    icon: BotMessageSquare,
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    accentColor: 'from-violet-500/10',
    tag: 'AI Powered',
    title: 'AI Property Concierge',
    description:
      "Get instant answers about any property, neighbourhood, or real-estate process — powered by Groq's Llama 3.3. Ask about EMI, legal checks, locality reviews, or investment potential any time of day.",
    highlight: 'Powered by Llama 3.3 (Groq)',
    demo: (
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <BotMessageSquare className="w-4 h-4 text-violet-500" />
          </div>
          <div className="bg-violet-50 border border-violet-100 rounded-[14px] rounded-tl-none p-3 text-xs text-zinc-700 leading-relaxed max-w-[220px]">
            Hi! I'm your CrownKey AI. Ask me anything about this property or the neighbourhood!
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <div className="bg-luxury-navy text-white rounded-[14px] rounded-tr-none p-3 text-xs leading-relaxed max-w-[200px]">
            What's the average EMI for this property?
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <BotMessageSquare className="w-4 h-4 text-violet-500" />
          </div>
          <div className="bg-violet-50 border border-violet-100 rounded-[14px] rounded-tl-none p-3 text-xs text-zinc-700 max-w-[220px]">
            At ₹85L with 8.5% interest over 20 years, your EMI would be approx <strong>₹73,800/mo</strong>.
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'contact',
    icon: Phone,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    accentColor: 'from-blue-500/10',
    tag: 'Direct Connect',
    title: 'Talk Directly to Owners',
    description:
      "No filtered leads, no delays. Send an inquiry or reveal the owner's phone number directly from the listing page. Your message goes straight to the owner — guaranteed same-day response.",
    highlight: 'Average response: 2.3 hours',
    demo: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-white border border-zinc-100 rounded-[14px] shadow-sm">
          <div className="w-10 h-10 rounded-full bg-luxury-navy/10 flex items-center justify-center text-luxury-navy font-bold font-display text-sm shrink-0">
            R
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Rajesh Mehta</p>
            <p className="text-[11px] text-zinc-500">Property Owner · Verified</p>
          </div>
          <BadgeCheck className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
        </div>
        <button className="w-full bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold font-semibold text-sm py-2.5 rounded-[12px] flex items-center justify-center gap-2">
          <Phone className="w-4 h-4" />
          Reveal Phone Number
        </button>
        <button className="w-full bg-luxury-navy text-white font-semibold text-sm py-2.5 rounded-[12px] flex items-center justify-center gap-2">
          Send a Message
        </button>
      </div>
    ),
  },
  {
    id: 'reviews',
    icon: Star,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    accentColor: 'from-amber-500/10',
    tag: 'Community Driven',
    title: 'Honest Property Reviews',
    description:
      'Read star ratings and detailed comments from real tenants and buyers before making a decision. Our review system enforces one honest review per verified user — no paid promotions.',
    highlight: '1 review per verified user',
    demo: (
      <div className="space-y-3">
        {[
          { name: 'Priya S.', rating: 5, text: 'Locality is excellent. Owner was very cooperative!', time: '2d ago' },
          { name: 'Arjun K.', rating: 4, text: 'Great property, slightly high on maintenance.', time: '1w ago' },
        ].map((r) => (
          <div key={r.name} className="p-3 bg-white border border-zinc-100 rounded-[14px] shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                  {r.name[0]}
                </div>
                <span className="text-xs font-semibold text-zinc-800">{r.name}</span>
              </div>
              <span className="text-[10px] text-zinc-400">{r.time}</span>
            </div>
            <div className="flex gap-0.5 mb-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`} />
              ))}
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'wishlist',
    icon: Heart,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-500/10 border-rose-500/20',
    accentColor: 'from-rose-500/10',
    tag: 'Smart Shortlisting',
    title: 'Save & Compare Properties',
    description:
      'Bookmark your favourite properties with one tap and revisit them anytime from your personal wishlist. Organise your shortlist and share it before making a final call.',
    highlight: 'Sync across all your devices',
    demo: (
      <div className="space-y-3">
        {[
          { title: '3 BHK in Bandra, Mumbai', price: '₹2.4 Cr', tag: 'For Sale' },
          { title: 'Studio Flat, Koramangala', price: '₹28,000/mo', tag: 'For Rent' },
          { title: '4 BHK Villa, Jubilee Hills', price: '₹3.8 Cr', tag: 'For Sale' },
        ].map((p) => (
          <div key={p.title} className="flex items-center gap-3 p-2.5 bg-white border border-zinc-100 rounded-[12px] shadow-sm">
            <div className="w-9 h-9 rounded-[10px] bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-800 truncate">{p.title}</p>
              <p className="text-[11px] text-zinc-500">{p.price}</p>
            </div>
            <span className="text-[10px] bg-luxury-navy/5 text-luxury-navy px-2 py-0.5 rounded-full font-semibold shrink-0">
              {p.tag}
            </span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function FeaturedProperties() {
  const [activeId, setActiveId] = useState('verified');
  const active = FEATURES.find((f) => f.id === activeId)!;
  const Icon = active.icon;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold text-[11px] font-bold uppercase tracking-[0.25em] mb-5">
            <Sparkles className="w-3 h-3" />
            Platform Features
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-luxury-navy tracking-tight">
            Why Choose <span className="text-luxury-gold">CrownKey?</span>
          </h2>
          <p className="mt-4 text-luxury-muted text-base font-sans leading-relaxed">
            Built for serious property seekers. Everything you need to find, evaluate, and secure your dream property — in one place.
          </p>
        </div>

        {/* Features Grid: Tab Pills + Active Card */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">

          {/* LEFT: Feature pill navigation */}
          <div className="flex flex-col gap-2">
            {FEATURES.map((feature) => {
              const FIcon = feature.icon;
              const isActive = activeId === feature.id;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveId(feature.id)}
                  className={`group flex items-center gap-4 p-4 rounded-[18px] text-left transition-all duration-300 border ${
                    isActive
                      ? 'bg-luxury-navy text-white border-luxury-navy shadow-lg shadow-luxury-navy/20 scale-[1.02]'
                      : 'bg-zinc-50 border-transparent hover:bg-zinc-100 hover:border-zinc-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border transition-all duration-300 ${
                    isActive ? 'bg-white/10 border-white/20' : feature.iconBg
                  }`}>
                    <FIcon className={`w-5 h-5 ${isActive ? 'text-white' : feature.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isActive ? 'text-white/60' : 'text-zinc-400'}`}>
                      {feature.tag}
                    </p>
                    <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-zinc-800'}`}>
                      {feature.title}
                    </p>
                  </div>
                  <ArrowRight className={`w-4 h-4 ml-auto shrink-0 transition-all duration-300 ${
                    isActive ? 'text-luxury-gold opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* RIGHT: Active Feature Detail Card */}
          <div
            key={activeId}
            className="relative rounded-[28px] overflow-hidden border border-zinc-100 bg-white shadow-xl shadow-zinc-100/80 animate-fade-in"
          >
            {/* Accent gradient blob */}
            <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br ${active.accentColor} to-transparent blur-3xl pointer-events-none`} />

            <div className="grid md:grid-cols-2 gap-0 relative">

              {/* Left: Text content */}
              <div className="p-8 md:p-10 flex flex-col justify-between">
                <div>
                  {/* Tag + Icon */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center border ${active.iconBg}`}>
                      <Icon className={`w-6 h-6 ${active.iconColor}`} />
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${active.iconBg} ${active.iconColor}`}>
                      {active.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-luxury-navy leading-tight mb-4">
                    {active.title}
                  </h3>

                  {/* Description */}
                  <p className="text-luxury-muted text-sm leading-relaxed font-sans mb-6">
                    {active.description}
                  </p>

                  {/* Highlight pill */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold ${active.iconBg} ${active.iconColor}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {active.highlight}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <Link
                    href="/properties"
                    className="inline-flex items-center gap-2 bg-luxury-navy text-white text-sm font-semibold px-6 py-3 rounded-[14px] hover:bg-luxury-deep transition-all duration-300 group"
                  >
                    Explore Properties
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>

              {/* Right: Live Demo Preview */}
              <div className="bg-zinc-50/80 border-l border-zinc-100 p-8 flex flex-col">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-5">
                  Live Preview
                </p>
                <div className="flex-1 flex flex-col justify-center">
                  {active.demo}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Stats Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '50,000+', label: 'Active Listings', icon: '🏠' },
            { value: '₹0', label: 'Brokerage Fee', icon: '🤝' },
            { value: '4.8★', label: 'Average Rating', icon: '⭐' },
            { value: '2.3h', label: 'Avg Owner Response', icon: '⚡' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-5 rounded-[20px] bg-zinc-50 border border-zinc-100 hover:border-luxury-gold/30 hover:bg-luxury-gold/5 transition-all duration-300 group"
            >
              <p className="text-2xl mb-2">{stat.icon}</p>
              <p className="font-display text-2xl font-bold text-luxury-navy">{stat.value}</p>
              <p className="text-xs text-zinc-500 mt-1 font-sans">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }
      `}} />
    </section>
  );
}