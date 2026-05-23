'use client';

import { useEffect, useState, FormEvent } from 'react';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { apiCreateInquiry, ApiError } from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  ownerName: string;
}

export default function InquiryModal({ open, onClose, propertyId, propertyTitle, ownerName }: Props) {
  const { user, accessToken } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hi ${ownerName.split(' ')[0]}, I'm interested in this property. Could you share more details and arrange a visit?`,
  });
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!open) {
      setState('idle');
      setErrMsg('');
    }
  }, [open]);

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState('submitting');
    setErrMsg('');
    try {
      await apiCreateInquiry({ propertyId, ...form }, accessToken);
      setState('success');
    } catch (err) {
      setState('error');
      setErrMsg(err instanceof ApiError ? err.message : 'Unable to send inquiry. Try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink-950/60 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-md p-6 animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl text-ink-900">Contact owner</h2>
            <p className="text-sm text-ink-500 mt-1 line-clamp-2">Re: {propertyTitle}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-ink-100 rounded" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {state === 'success' ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl text-ink-900">Inquiry sent</h3>
            <p className="text-sm text-ink-600">
              {ownerName} will reach out to you soon at {form.email}.
            </p>
            <button onClick={onClose} className="btn-primary mt-2">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Name</label>
                <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                className="input min-h-[110px] resize-y"
                required
                minLength={10}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            {state === 'error' && (
              <div className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-3">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{errMsg}</span>
              </div>
            )}

            <button type="submit" className="btn-gold w-full" disabled={state === 'submitting'}>
              <Send className="h-4 w-4" />
              {state === 'submitting' ? 'Sending…' : 'Send inquiry'}
            </button>
            <p className="text-xs text-ink-400 text-center">
              We never share your contact info publicly. Owner receives a notification.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
