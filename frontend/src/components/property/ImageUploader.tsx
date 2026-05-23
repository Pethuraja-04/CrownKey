'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, Star, AlertCircle } from 'lucide-react';
import type { PropertyImage } from '@/lib/types';

const MAX_FILES = 12;
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

interface Props {
  // Already-uploaded images attached to an existing property (edit flow).
  initialImages?: PropertyImage[];
  // Notified whenever the selection changes — parent uses these on submit.
  onChange: (state: { keepUrls: string[]; files: File[] }) => void;
}

interface Preview {
  id: string;
  file: File;
  url: string;
}

const humanSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function ImageUploader({ initialImages = [], onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [keepUrls, setKeepUrls] = useState<string[]>(initialImages.map((i) => i.url));
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  // Sync upward whenever the user changes the selection.
  useEffect(() => {
    onChange({ keepUrls, files: previews.map((p) => p.file) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keepUrls, previews]);

  // Release object URLs on unmount so we don't leak memory.
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const totalCount = keepUrls.length + previews.length;
  const remainingSlots = MAX_FILES - totalCount;

  const addFiles = useCallback(
    (incoming: File[]) => {
      setError('');
      const accepted: Preview[] = [];
      const errors: string[] = [];

      for (const f of incoming) {
        if (accepted.length + previews.length + keepUrls.length >= MAX_FILES) {
          errors.push(`Limit is ${MAX_FILES} images — extras ignored.`);
          break;
        }
        if (!ALLOWED_TYPES.includes(f.type)) {
          errors.push(`${f.name}: unsupported type (use JPG / PNG / WEBP / AVIF)`);
          continue;
        }
        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
          errors.push(`${f.name}: too large (max ${MAX_SIZE_MB}MB)`);
          continue;
        }
        accepted.push({
          id: `${f.name}-${f.lastModified}-${f.size}-${Math.random().toString(36).slice(2, 6)}`,
          file: f,
          url: URL.createObjectURL(f),
        });
      }

      if (accepted.length) setPreviews((cur) => [...cur, ...accepted]);
      if (errors.length) setError(errors[0]);
    },
    [keepUrls.length, previews.length],
  );

  const onSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    addFiles(files);
    // Reset the input so selecting the same file again still fires onChange.
    if (inputRef.current) inputRef.current.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    addFiles(files);
  };

  const removeExisting = (url: string) => setKeepUrls((u) => u.filter((x) => x !== url));
  const removePreview = (id: string) => {
    setPreviews((cur) => {
      const found = cur.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return cur.filter((p) => p.id !== id);
    });
  };

  const primaryUrl = keepUrls[0] || previews[0]?.url;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all ${
          dragOver
            ? 'border-gold-400 bg-gold-50/60'
            : 'border-ink-200 hover:border-ink-400 bg-white/60 hover:bg-white'
        } ${remainingSlots <= 0 ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={onSelectFiles}
        />
        <div className="px-6 py-10 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-ink-900 grid place-items-center mb-3 shadow-soft">
            <Upload className="h-5 w-5" />
          </div>
          <p className="font-semibold text-ink-900">
            Drag & drop images here
          </p>
          <p className="text-sm text-ink-500 mt-1">
            or <span className="text-gold-700 font-medium">click to browse</span>
          </p>
          <p className="text-xs text-ink-400 mt-3">
            JPG · PNG · WEBP · AVIF — up to {MAX_SIZE_MB} MB each, max {MAX_FILES} files
          </p>
          {remainingSlots > 0 && remainingSlots < MAX_FILES && (
            <p className="text-xs text-ink-500 mt-2">
              {remainingSlots} more slot{remainingSlots === 1 ? '' : 's'} available
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-3">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {totalCount > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider text-ink-500 font-semibold">
              Gallery · {totalCount} of {MAX_FILES}
            </p>
            <p className="text-xs text-ink-400 flex items-center gap-1">
              <Star className="h-3 w-3 text-gold-500 fill-gold-500" />
              First image becomes the cover
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {/* Existing images first */}
            {keepUrls.map((url, idx) => (
              <Thumb
                key={`existing-${url}`}
                src={url}
                label={idx === 0 ? 'Cover' : `#${idx + 1}`}
                isPrimary={url === primaryUrl}
                onRemove={() => removeExisting(url)}
                badge="Saved"
              />
            ))}
            {/* New previews */}
            {previews.map((p, idx) => (
              <Thumb
                key={p.id}
                src={p.url}
                label={`${humanSize(p.file.size)}`}
                isPrimary={p.url === primaryUrl}
                onRemove={() => removePreview(p.id)}
                badge="New"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Thumb({
  src,
  label,
  isPrimary,
  onRemove,
  badge,
}: {
  src: string;
  label: string;
  isPrimary: boolean;
  onRemove: () => void;
  badge: 'Saved' | 'New';
}) {
  return (
    <div className={`group relative aspect-[4/3] rounded-xl overflow-hidden border ${isPrimary ? 'border-gold-400 ring-2 ring-gold-200' : 'border-ink-100'}`}>
      {/* Using <img> for blob: URLs because next/image doesn't support them */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-ink-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span
        className={`absolute top-1.5 left-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded ${
          badge === 'New'
            ? 'bg-gold-400 text-ink-900'
            : 'bg-white/90 backdrop-blur text-ink-700'
        }`}
      >
        {badge}
      </span>
      {isPrimary && (
        <span className="absolute top-1.5 right-1.5 h-6 w-6 grid place-items-center rounded-full bg-gold-400 text-ink-900 shadow-soft">
          <Star className="h-3 w-3 fill-current" />
        </span>
      )}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[10px]">
        <span className="px-1.5 py-0.5 rounded bg-ink-900/70 text-canvas">{label}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove image"
          className="h-6 w-6 grid place-items-center rounded-full bg-ink-900/80 text-canvas hover:bg-rose-600 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
