'use client';

import Link from 'next/link';
import React, { FormEvent, useMemo, useState } from 'react';

import { Icon } from '@/components/Icons';
import { Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { ApiError, errorMessage } from '@/lib/api/client';
import { catalogApi } from '@/lib/api/endpoints';
import type { Product, Review } from '@/lib/api/types';
import { faNumber, timeAgo } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import styles from './reviews.module.css';

const MAX_COMMENT = 2000;
const RATING_WORDS = ['', 'خیلی بد', 'بد', 'معمولی', 'خوب', 'عالی'];
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #f0645a, #b52f3a)',
  'linear-gradient(135deg, #7458d6, #4b2fa8)',
  'linear-gradient(135deg, #2fb6a3, #1d7a6d)',
  'linear-gradient(135deg, #f2a541, #c66a12)',
  'linear-gradient(135deg, #4a90e2, #2858a8)',
];

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
    </svg>
  );
}

/** Read-only star bar; ``value`` may be fractional (e.g. an average) and is rounded. */
export function Stars({ value, className }: { value: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span className={`${styles.stars} ${className ?? ''}`} aria-label={`${faNumber(value)} از ۵`}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={star <= full ? styles.starOn : styles.starOff}>
          <StarIcon />
        </span>
      ))}
    </span>
  );
}

function Summary({ product, reviews }: { product: Product; reviews: Review[] }) {
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));
  const total = Math.max(reviews.length, 1);

  return (
    <div className={`${styles.card} ${styles.summary}`}>
      <div className={styles.average}>{faNumber(Number(product.rating.toFixed(1)))}</div>
      <Stars value={product.rating} />
      <div className={styles.basedOn}>بر اساس {faNumber(product.reviewCount)} دیدگاه</div>
      <div className={styles.bars}>
        {distribution.map(({ star, count }) => (
          <div key={star} className={styles.barRow}>
            <span>{faNumber(star)}</span>
            <StarIcon />
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: `${(count / total) * 100}%` }} />
            </div>
            <span>{faNumber(count)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewForm({
  product,
  existing,
  onSaved,
}: {
  product: Product;
  existing: Review | undefined;
  onSaved: () => Promise<void>;
}) {
  const { user } = useAuth();
  const { addToast } = useAppContext();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [name, setName] = useState(existing?.authorName ?? user?.fullName ?? user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  const shown = hovered || rating;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const local: Record<string, string[]> = {};
    if (!rating) local.rating = ['لطفاً امتیاز خود را انتخاب کنید.'];
    if (!name.trim()) local.authorName = ['نام خود را وارد کنید.'];
    if (!email.trim()) local.authorEmail = ['ایمیل خود را وارد کنید.'];
    setErrors(local);
    if (Object.keys(local).length) return;

    setBusy(true);
    try {
      await catalogApi.submitReview(product.slug, {
        rating,
        comment: comment.trim(),
        authorName: name.trim(),
        authorEmail: email.trim(),
      });
      addToast({ title: existing ? 'دیدگاه شما بروزرسانی شد' : 'دیدگاه شما ثبت شد', icon: 'check', tone: 'success' });
      await onSaved();
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.errors);
      addToast({ title: 'ثبت دیدگاه', text: errorMessage(error), icon: 'info', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const fieldError = (key: string) => errors[key]?.[0];

  return (
    <form className={styles.card} onSubmit={submit} noValidate>
      <div className={styles.formHead}>
        <div>
          <div className={styles.formTitle}>{existing ? 'ویرایش دیدگاه شما' : 'دیدگاه خود را بنویسید'}</div>
          <div className={styles.formHint}>تجربه شما به دیگر خریداران کمک می‌کند.</div>
        </div>
        {existing && <span className={styles.editing}>قبلاً ثبت کرده‌اید</span>}
      </div>

      <div className={styles.ratingPicker}>
        <span className={styles.ratingLabel}>امتیاز شما</span>
        <div className={styles.starButtons} role="radiogroup" aria-label="امتیاز" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${faNumber(star)} ستاره — ${RATING_WORDS[star]}`}
              className={`${styles.starButton} ${star <= shown ? styles.starButtonOn : ''}`}
              onMouseEnter={() => setHovered(star)}
              onClick={() => setRating(star)}
            >
              <StarIcon />
            </button>
          ))}
        </div>
        {shown > 0 && <span className={styles.ratingWord}>{RATING_WORDS[shown]}</span>}
      </div>
      {fieldError('rating') && <p className={styles.error} style={{ marginTop: -10, marginBottom: 14 }}>{fieldError('rating')}</p>}

      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="review-name">
            نام
          </label>
          <input
            id="review-name"
            className={`${styles.input} ${fieldError('authorName') ? styles.inputError : ''}`}
            value={name}
            maxLength={80}
            autoComplete="name"
            placeholder="نامی که کنار دیدگاه نمایش داده می‌شود"
            onChange={e => setName(e.target.value)}
          />
          {fieldError('authorName') && <span className={styles.error}>{fieldError('authorName')}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="review-email">
            ایمیل <span className={styles.labelNote}>منتشر نمی‌شود</span>
          </label>
          <input
            id="review-email"
            type="email"
            dir="ltr"
            className={`${styles.input} ${fieldError('authorEmail') ? styles.inputError : ''}`}
            value={email}
            autoComplete="email"
            placeholder="you@example.com"
            onChange={e => setEmail(e.target.value)}
          />
          {fieldError('authorEmail') && <span className={styles.error}>{fieldError('authorEmail')}</span>}
        </div>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label} htmlFor="review-comment">
            متن دیدگاه <span className={styles.labelNote}>اختیاری</span>
          </label>
          <textarea
            id="review-comment"
            className={styles.textarea}
            value={comment}
            maxLength={MAX_COMMENT}
            placeholder="از کیفیت، سرعت تحویل یا تجربه خرید خود بگویید..."
            onChange={e => setComment(e.target.value)}
          />
          <span className={styles.counter}>
            {faNumber(comment.length)} / {faNumber(MAX_COMMENT)}
          </span>
        </div>
      </div>

      <div className={styles.formFoot}>
        <span className={styles.privacy}>
          <Icon name="lock" /> ایمیل شما فقط برای پیگیری استفاده می‌شود.
        </span>
        <button type="submit" className={styles.submit} disabled={busy}>
          <Icon name="check" />
          {busy ? 'در حال ارسال...' : existing ? 'بروزرسانی دیدگاه' : 'ثبت دیدگاه'}
        </button>
      </div>
    </form>
  );
}

function ReviewCard({ review, mine }: { review: Review; mine: boolean }) {
  const name = review.authorName || review.user.displayName;
  const gradient = AVATAR_GRADIENTS[review.user.id % AVATAR_GRADIENTS.length];
  return (
    <article className={`${styles.card} ${styles.review} ${mine ? styles.reviewMine : ''}`}>
      <div className={styles.reviewHead}>
        <span className={styles.initial} style={{ background: gradient }}>
          {name.trim().charAt(0).toUpperCase()}
        </span>
        <div className={styles.who}>
          <span className={styles.name}>
            {name}
            {review.verifiedPurchase && (
              <span className={styles.verified}>
                <Icon name="check" /> خریدار
              </span>
            )}
          </span>
          <span className={styles.date}>
            {mine ? 'دیدگاه شما · ' : ''}
            {timeAgo(review.createdAt)}
          </span>
        </div>
        <Stars value={review.rating} className={styles.reviewStars} />
      </div>
      {review.comment ? (
        <p className={styles.comment}>{review.comment}</p>
      ) : (
        <p className={styles.noComment}>بدون متن — فقط امتیاز ثبت شده است.</p>
      )}
    </article>
  );
}

/** Rating summary, the review form (or a login prompt) and the list of reviews. */
export function ReviewsSection({ product, onChanged }: { product: Product; onChanged: () => void }) {
  const { user, isAuthenticated } = useAuth();
  const reviews = useApi(() => catalogApi.reviews(product.slug), [product.slug]);
  const list = useMemo(() => reviews.data?.results ?? [], [reviews.data]);
  const mine = user ? list.find(review => review.user.id === user.id) : undefined;

  const saved = async () => {
    await reviews.reload();
    onChanged();
  };

  return (
    <section className={styles.section}>
      <div className={styles.topRow}>
        <Summary product={product} reviews={list} />
        {isAuthenticated ? (
          // Remount when the user's own review loads so the form starts from it.
          <ReviewForm key={mine?.id ?? 'new'} product={product} existing={mine} onSaved={saved} />
        ) : (
          <div className={`${styles.card} ${styles.guest}`}>
            <span className={styles.guestIcon}>
              <Icon name="chat" />
            </span>
            <div className={styles.formTitle}>دیدگاه خود را بنویسید</div>
            <p>برای ثبت دیدگاه و امتیاز، ابتدا وارد حساب کاربری خود شوید.</p>
            <Link href={`/login?next=/product/${product.slug}`} className={styles.submit} style={{ textDecoration: 'none' }}>
              <Icon name="user" /> ورود و ثبت دیدگاه
            </Link>
          </div>
        )}
      </div>

      <div className={styles.listHead}>
        دیدگاه کاربران <span className={styles.count}>{faNumber(list.length)}</span>
      </div>
      {reviews.loading && !reviews.data ? (
        <Loading />
      ) : list.length === 0 ? (
        <div className={`${styles.card} ${styles.empty}`}>هنوز دیدگاهی ثبت نشده است. اولین نفر باشید!</div>
      ) : (
        <div className={styles.list}>
          {list.map(review => (
            <ReviewCard key={review.id} review={review} mine={review.id === mine?.id} />
          ))}
        </div>
      )}
    </section>
  );
}
