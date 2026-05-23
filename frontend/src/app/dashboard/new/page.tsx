'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { apiCreateProperty } from '@/lib/api';
import PropertyForm, { type PropertyFormPayload } from '@/components/property/PropertyForm';

export default function NewPropertyPage() {
  const { accessToken } = useAuth();
  const router = useRouter();

  const submit = async ({ data, files }: PropertyFormPayload) => {
    if (!accessToken) throw new Error('Not authenticated');
    const r = await apiCreateProperty(accessToken, data, files);
    router.push(`/properties/${r.data.slug}`);
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-1">New listing</p>
        <h1 className="font-display text-3xl text-ink-900">Add a property</h1>
        <p className="text-sm text-ink-500 mt-1">Reach thousands of verified buyers and renters.</p>
      </div>
      <PropertyForm onSubmit={submit} submitLabel="Publish listing" />
    </div>
  );
}
