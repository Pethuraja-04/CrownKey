'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, Calendar } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { apiReceivedInquiries } from '@/lib/api';
import { relativeTime } from '@/lib/format';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  property: { id: string; slug: string; title: string; city: string };
  user?: { id: string; name: string; email: string } | null;
}

export default function InquiriesPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<Inquiry[] | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!accessToken) return;
    apiReceivedInquiries(accessToken)
      .then((r) => setItems(r.items as Inquiry[]))
      .catch((e: any) => setErr(e?.message || 'Could not load inquiries'));
  }, [accessToken]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-ink-900">Inquiries</h1>
        <p className="text-sm text-ink-500 mt-1">Messages from prospective buyers and renters.</p>
      </div>

      {err && <div className="card p-4 text-rose-700 bg-rose-50 border-rose-200 mb-4">{err}</div>}
      {items === null && <div className="card p-12 text-center text-ink-500">Loading…</div>}

      {items && items.length === 0 && (
        <div className="card p-12 text-center">
          <h3 className="font-display text-xl text-ink-900 mb-2">No inquiries yet</h3>
          <p className="text-sm text-ink-500">When someone messages you about a listing, it'll show here.</p>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="space-y-3">
          {items.map((i) => (
            <article key={i.id} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-ink-900">{i.name}</p>
                  <Link href={`/properties/${i.property.slug}`} className="text-xs text-gold-600 hover:underline">
                    Re: {i.property.title}
                  </Link>
                </div>
                <span className="text-xs text-ink-500 flex items-center gap-1 whitespace-nowrap">
                  <Calendar className="h-3 w-3" /> {relativeTime(i.createdAt)}
                </span>
              </div>
              <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">{i.message}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <a href={`mailto:${i.email}`} className="badge"><Mail className="h-3 w-3" /> {i.email}</a>
                <a href={`tel:${i.phone}`} className="badge"><Phone className="h-3 w-3" /> {i.phone}</a>
                {i.user && <span className="badge-gold">Verified member</span>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
