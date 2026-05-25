'use client';

import { useState } from 'react';
import { Star, Edit2, Trash2, MessageSquare, AlertCircle, PenLine } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { apiCreateReview, apiUpdateReview, apiDeleteReview } from '@/lib/api';
import type { Review } from '@/lib/types';
import { relativeTime } from '@/lib/format';

interface PropertyReviewsProps {
  propertyId: string;
  ownerId: string;
  initialReviews: Review[];
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="p-1 hover:scale-110 transition-transform duration-200"
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <Star
            className={`h-7 w-7 transition-colors duration-150 ${
              star <= (hover || value)
                ? 'fill-gold-500 text-gold-500'
                : 'text-zinc-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-gold-500 text-gold-500' : 'text-zinc-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function PropertyReviews({
  propertyId,
  ownerId,
  initialReviews,
}: PropertyReviewsProps) {
  const { user, accessToken, openAuth } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  // New-review form state
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [newSubmitting, setNewSubmitting] = useState(false);
  const [newError, setNewError] = useState<string | null>(null);

  // Edit state (lives on the card itself)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isOwner = user?.id === ownerId;
  const myReview = reviews.find((r) => r.userId === user?.id);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  // ── Handlers ──────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !accessToken) { openAuth('login'); return; }
    if (newRating === 0) { setNewError('Please select a star rating'); return; }
    if (!newComment.trim()) { setNewError('Please write a comment'); return; }

    setNewSubmitting(true);
    setNewError(null);
    try {
      const res = await apiCreateReview(accessToken, propertyId, {
        rating: newRating,
        comment: newComment,
      });
      if (res.success && res.data) {
        setReviews((prev) => [
          { ...res.data!, user: { id: user.id, name: user.name } },
          ...prev,
        ]);
        setNewRating(0);
        setNewComment('');
      }
    } catch (err: any) {
      setNewError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setNewSubmitting(false);
    }
  };

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !editingId) return;
    if (editRating === 0) { setEditError('Please select a star rating'); return; }
    if (!editComment.trim()) { setEditError('Please write a comment'); return; }

    setEditSubmitting(true);
    setEditError(null);
    try {
      const res = await apiUpdateReview(accessToken, editingId, {
        rating: editRating,
        comment: editComment,
      });
      if (res.success && res.data) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === editingId
              ? { ...res.data!, user: r.user }
              : r
          )
        );
        cancelEdit();
      }
    } catch (err: any) {
      setEditError(err.message || 'Failed to save changes.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!accessToken) return;
    if (!confirm('Delete your review? This cannot be undone.')) return;
    setDeleteError(null);
    try {
      const res = await apiDeleteReview(accessToken, reviewId);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        if (editingId === reviewId) cancelEdit();
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete review.');
    }
  };

  // ── Render ─────────────────────────────────────────────────────

  const canWrite = user && !isOwner && !myReview;

  return (
    <section className="space-y-8 border-t border-zinc-100 pt-10">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl text-ink-900 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-gold-600" />
          Reviews &amp; Ratings
          <span className="text-ink-400 font-normal text-lg">({reviews.length})</span>
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 bg-gold-50 border border-gold-100 px-4 py-1.5 rounded-full">
            <Star className="h-4 w-4 fill-gold-500 text-gold-500" />
            <span className="text-sm font-bold text-gold-900">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-gold-600">/ 5</span>
          </div>
        )}
      </div>

      {/* Write-a-review form (only if user can write a new review) */}
      {canWrite && (
        <div className="bg-zinc-50 border border-zinc-100 rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <PenLine className="h-4 w-4 text-gold-600" />
            <h3 className="text-sm font-semibold text-ink-900">Write a Review</h3>
          </div>
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <p className="text-xs text-ink-500 mb-2 font-medium uppercase tracking-wider">Your Rating</p>
              <StarPicker value={newRating} onChange={setNewRating} />
            </div>
            <div>
              <label htmlFor="new-comment" className="text-xs text-ink-500 mb-2 font-medium uppercase tracking-wider block">
                Comment
              </label>
              <textarea
                id="new-comment"
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience with the property, locality, or the owner..."
                className="w-full rounded-[14px] border border-zinc-200 bg-white p-4 text-ink-800 text-sm leading-relaxed focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>
            {newError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-[10px]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{newError}</span>
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={newSubmitting}
                className="btn btn-primary px-6"
              >
                {newSubmitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Not logged in nudge */}
      {!user && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50 border border-zinc-100 rounded-[20px] p-5">
          <p className="text-sm text-ink-600">Log in to share your experience with this property.</p>
          <button onClick={() => openAuth('login')} className="btn btn-primary px-5 whitespace-nowrap">
            Log In to Review
          </button>
        </div>
      )}

      {/* Owner notice (compact) */}
      {isOwner && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-[16px] p-4">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">You cannot review your own property.</p>
        </div>
      )}

      {deleteError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-[10px]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Reviews list — always visible */}
      <div className="space-y-5">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50/60 border border-dashed border-zinc-200 rounded-[20px]">
            <MessageSquare className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-ink-500 text-sm">No reviews yet. Be the first to review this property!</p>
          </div>
        ) : (
          reviews.map((review) => {
            const isMyReview = review.userId === user?.id;
            const isBeingEdited = editingId === review.id;

            return (
              <div
                key={review.id}
                className={`rounded-[20px] border transition-all duration-300 overflow-hidden ${
                  isMyReview
                    ? 'bg-gold-50/30 border-gold-200/60'
                    : 'bg-white border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200'
                }`}
              >
                {isBeingEdited ? (
                  /* ── Inline Edit Form ───────────────────── */
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <Edit2 className="h-4 w-4 text-gold-600" />
                      <h3 className="text-sm font-semibold text-ink-900">Edit your review</h3>
                    </div>
                    <form onSubmit={handleSaveEdit} className="space-y-5">
                      <div>
                        <p className="text-xs text-ink-500 mb-2 font-medium uppercase tracking-wider">Your Rating</p>
                        <StarPicker value={editRating} onChange={setEditRating} />
                      </div>
                      <div>
                        <label htmlFor="edit-comment" className="text-xs text-ink-500 mb-2 font-medium uppercase tracking-wider block">
                          Comment
                        </label>
                        <textarea
                          id="edit-comment"
                          rows={4}
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          className="w-full rounded-[14px] border border-zinc-200 bg-white p-4 text-ink-800 text-sm leading-relaxed focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                        />
                      </div>
                      {editError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-[10px]">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{editError}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="btn btn-outline px-5"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={editSubmitting}
                          className="btn btn-primary px-6"
                        >
                          {editSubmitting ? 'Saving…' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* ── Normal Review Card ─────────────────── */
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Avatar + name + stars */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {review.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-ink-900 text-sm">{review.user.name}</span>
                            {isMyReview && (
                              <span className="text-[10px] bg-gold-100 text-gold-900 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                You
                              </span>
                            )}
                          </div>
                          <StarDisplay rating={review.rating} />
                        </div>
                      </div>

                      {/* Timestamp + my-review actions */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-xs text-ink-400">{relativeTime(review.createdAt)}</span>
                        {isMyReview && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => startEdit(review)}
                              className="text-xs text-ink-500 hover:text-gold-600 flex items-center gap-1 transition-colors duration-200 font-medium"
                            >
                              <Edit2 className="h-3 w-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(review.id)}
                              className="text-xs text-ink-500 hover:text-red-600 flex items-center gap-1 transition-colors duration-200 font-medium"
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-ink-700 text-sm leading-relaxed mt-4 whitespace-pre-line">
                      {review.comment}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
