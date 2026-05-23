'use client';

import { useState } from 'react';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import InquiryModal from '@/components/property/InquiryModal';

interface Props {
  propertyId: string;
  propertyTitle: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerRole: string;
}

export default function ContactCTA({ propertyId, propertyTitle, ownerName, ownerEmail, ownerPhone, ownerRole }: Props) {
  const [open, setOpen] = useState(false);
  const [reveal, setReveal] = useState(false);
  const initials = ownerName.split(' ').slice(0, 2).map((s) => s[0]).join('').toUpperCase();

  return (
    <>
      <div className="card p-5">
        <div className="flex items-center gap-3 pb-4 border-b border-ink-100">
          <div className="h-12 w-12 rounded-full bg-gold-100 text-gold-700 grid place-items-center font-display text-lg font-bold">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-ink-900 truncate">{ownerName}</p>
            <p className="text-xs text-ink-500">{ownerRole === 'AGENT' ? 'Verified Agent' : 'Property Owner'}</p>
          </div>
        </div>

        <div className="py-4 space-y-3">
          <button
            onClick={() => setReveal(true)}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-ink-200 hover:border-ink-400 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm text-ink-700">
              <Phone className="h-4 w-4 text-gold-500" />
              {reveal ? ownerPhone || 'No phone listed' : 'Show phone number'}
            </span>
            {!reveal && <span className="text-xs text-ink-500">Tap to reveal</span>}
          </button>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-ink-50 text-sm text-ink-700">
            <Mail className="h-4 w-4 text-gold-500" />
            <span className="truncate">{ownerEmail}</span>
          </div>
        </div>

        <button onClick={() => setOpen(true)} className="btn-gold w-full">
          <MessageSquare className="h-4 w-4" />
          Send a message
        </button>
        <p className="text-xs text-ink-400 text-center mt-3">
          By contacting the owner you agree to our terms of use.
        </p>
      </div>

      <InquiryModal
        open={open}
        onClose={() => setOpen(false)}
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        ownerName={ownerName}
      />
    </>
  );
}
