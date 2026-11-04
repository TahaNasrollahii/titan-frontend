'use client';

import { ChevronLeft, ChevronRight, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { faNumber } from '@/lib/format';

import styles from './ImageLightbox.module.css';

export interface LightboxImageItem {
  src: string;
  alt?: string;
}

interface LightboxEventDetail {
  images: LightboxImageItem[];
  initialIndex?: number;
}

const LIGHTBOX_OPEN_EVENT = 'titan:open-image-lightbox';

export function openImageLightbox(images: LightboxImageItem[], initialIndex = 0) {
  if (typeof window === 'undefined' || !images.length) return;
  window.dispatchEvent(
    new CustomEvent<LightboxEventDetail>(LIGHTBOX_OPEN_EVENT, {
      detail: { images, initialIndex },
    }),
  );
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.35;

export function ImageLightbox({
  images,
  initialIndex = 0,
  onClose,
}: {
  images: LightboxImageItem[];
  initialIndex?: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0)),
  );
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0, originX: 0, originY: 0 });
  const movedRef = useRef(false);

  const current = images[index] ?? images[0];

  const resetTransform = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const selectImage = useCallback(
    (nextIdx: number) => {
      const total = images.length;
      if (!total) return;
      const wrapped = ((nextIdx % total) + total) % total;
      setIndex(wrapped);
      resetTransform();
    },
    [images.length, resetTransform],
  );

  const zoomBy = useCallback((delta: number) => {
    setScale(prev => {
      const next = Math.round(Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta)) * 100) / 100;
      if (next <= 1) {
        setOffset({ x: 0, y: 0 });
      }
      return next;
    });
  }, []);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale > 1.05) {
      resetTransform();
    } else {
      setScale(2.25);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    zoomBy(delta);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    movedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      movedRef.current = true;
    }
    setOffset({
      x: dragStartRef.current.originX + dx,
      y: dragStartRef.current.originY + dy,
    });
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === '+' || e.key === '=') zoomBy(ZOOM_STEP);
      else if (e.key === '-') zoomBy(-ZOOM_STEP);
      else if (e.key === '0') resetTransform();
      else if (e.key === 'ArrowLeft' && images.length > 1) selectImage(index + 1);
      else if (e.key === 'ArrowRight' && images.length > 1) selectImage(index - 1);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [images.length, index, onClose, resetTransform, selectImage, zoomBy]);

  if (!current) return null;

  const zoomPercent = faNumber(Math.round(scale * 100));

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={current.alt || 'نمایش بزرگ تصویر محصول'}
      dir="rtl"
    >
      {/* Top Header Bar */}
      <div className={styles.topBar}>
        <div className={styles.captionBox}>
          {images.length > 1 && (
            <span className={styles.counter}>
              {faNumber(index + 1)} از {faNumber(images.length)}
            </span>
          )}
          {current.alt && <p className={styles.title}>{current.alt}</p>}
        </div>

        <div className={styles.topActions}>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.closeBtn}`}
            onClick={onClose}
            aria-label="بستن نمایش تصویر"
          >
            <X size={18} />
            <span>بستن</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Viewport */}
      <div
        className={`${styles.viewport} ${
          dragging ? styles.viewportDragging : scale > 1 ? styles.viewportZoomed : styles.viewportDefault
        }`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onClick={handleViewportClick}
      >
        {images.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.navArrow} ${styles.navPrev}`}
              onClick={e => {
                e.stopPropagation();
                selectImage(index - 1);
              }}
              aria-label="تصویر قبلی"
            >
              <ChevronRight size={24} />
            </button>
            <button
              type="button"
              className={`${styles.navArrow} ${styles.navNext}`}
              onClick={e => {
                e.stopPropagation();
                selectImage(index + 1);
              }}
              aria-label="تصویر بعدی"
            >
              <ChevronLeft size={24} />
            </button>
          </>
        )}

        <div
          className={`${styles.imageStage} ${dragging ? styles.imageStageDragging : ''}`}
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.src} alt={current.alt || ''} className={styles.image} draggable={false} />
        </div>
      </div>

      {/* Bottom Zoom Controls & Thumbnails */}
      <div className={styles.bottomBar}>
        <div className={styles.controlsDock} role="toolbar" aria-label="کنترل‌های بزرگ‌نمایی تصویر">
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => zoomBy(ZOOM_STEP)}
            disabled={scale >= MAX_SCALE}
            aria-label="بزرگ‌نمایی (Zoom In)"
            title="بزرگ‌نمایی (+)"
          >
            <ZoomIn size={18} />
          </button>

          <button
            type="button"
            className={styles.zoomLevelBtn}
            onClick={resetTransform}
            title="بازگردانی به اندازه اصلی (۱۰۰٪)"
          >
            ٪{zoomPercent}
          </button>

          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => zoomBy(-ZOOM_STEP)}
            disabled={scale <= MIN_SCALE}
            aria-label="کوچک‌نمایی (Zoom Out)"
            title="کوچک‌نمایی (-)"
          >
            <ZoomOut size={18} />
          </button>

          <button
            type="button"
            className={styles.iconBtn}
            onClick={resetTransform}
            disabled={scale === 1 && offset.x === 0 && offset.y === 0}
            aria-label="بازنشانی بزرگ‌نمایی"
            title="بازنشانی"
          >
            <RotateCcw size={16} />
            <span>بازنشانی</span>
          </button>
        </div>

        <span className={styles.hintText}>
          برای بزرگ‌نمایی اسکرول یا دابل‌کلیک کنید • در حالت زوم می‌توانید تصویر را بکشید و جابه‌جا کنید
        </span>

        {images.length > 1 && (
          <div className={styles.thumbsRow} role="list" aria-label="لیست تصاویر">
            {images.map((item, i) => (
              <button
                key={item.src + i}
                type="button"
                className={`${styles.thumbBtn} ${i === index ? styles.thumbBtnActive : ''}`}
                onClick={() => selectImage(i)}
                aria-label={`تصویر ${faNumber(i + 1)}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt="" className={styles.thumbImg} draggable={false} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Mounted once in AppShell so any product image, guide screenshot, or `[data-zoomable="true"]`
 * image across the entire site can open the interactive zoom viewer.
 */
export function GlobalImageLightbox() {
  const [state, setState] = useState<LightboxEventDetail | null>(null);

  useEffect(() => {
    const onOpenEvent = (e: Event) => {
      const detail = (e as CustomEvent<LightboxEventDetail>).detail;
      if (detail?.images?.length) {
        setState(detail);
      }
    };

    const onDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const zoomTrigger = target.closest<HTMLElement>('[data-zoomable="true"]');
      if (zoomTrigger) {
        const imgEl =
          zoomTrigger.tagName === 'IMG'
            ? (zoomTrigger as HTMLImageElement)
            : zoomTrigger.querySelector('img');
        const src = zoomTrigger.getAttribute('data-lightbox-src') || imgEl?.currentSrc || imgEl?.src;
        const alt = zoomTrigger.getAttribute('data-lightbox-alt') || imgEl?.alt || '';
        if (src) {
          e.preventDefault();
          e.stopPropagation();
          setState({ images: [{ src, alt }], initialIndex: 0 });
        }
      }
    };

    window.addEventListener(LIGHTBOX_OPEN_EVENT, onOpenEvent);
    document.addEventListener('click', onDocumentClick);
    return () => {
      window.removeEventListener(LIGHTBOX_OPEN_EVENT, onOpenEvent);
      document.removeEventListener('click', onDocumentClick);
    };
  }, []);

  if (!state) return null;

  return (
    <ImageLightbox
      images={state.images}
      initialIndex={state.initialIndex ?? 0}
      onClose={() => setState(null)}
    />
  );
}

