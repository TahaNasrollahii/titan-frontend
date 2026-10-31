'use client';

import { useEffect, useState } from 'react';

import { Icon } from '@/components/Icons';
import { faNumber } from '@/lib/format';
import { useSpotlight } from '@/lib/hooks/useSpotlight';

import type { GuideHeading } from './GuideBody';
import styles from './guides.module.css';

export function GuideReadingTools({ url }: { url: string }) {
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useSpotlight(`.${styles.spotCard}, .${styles.articleHeroStage}`);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setProgress(0);
        return;
      }
      const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      setProgress(pct);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <>
      <div className={styles.readingProgressTrack} aria-hidden="true">
        <div
          className={styles.readingProgressFill}
          style={{ width: `${progress}%` }}
        />
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className={`${styles.copyLinkBtn} ${copied ? styles.copyLinkBtnSuccess : ''}`}
        aria-label="کپی لینک این آموزش"
      >
        <Icon name={copied ? 'check' : 'globe'} />
        <span>{copied ? 'لینک کپی شد!' : 'کپی لینک راهنما'}</span>
      </button>
    </>
  );
}

export function GuideStickyToc({
  headings,
  hasFaq,
}: {
  headings: GuideHeading[];
  hasFaq: boolean;
}) {
  const allItems = [
    ...headings,
    ...(hasFaq
      ? [{ id: 'faq-title', text: 'سوالات متداول', index: headings.length + 1 }]
      : []),
  ];

  const [activeId, setActiveId] = useState<string>(allItems[0]?.id ?? '');

  useEffect(() => {
    if (allItems.length === 0) return;
    const elements = allItems
      .map(item => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-90px 0px -65% 0px',
        threshold: [0, 1],
      },
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headings.length, hasFaq]);

  if (allItems.length === 0) return null;

  return (
    <nav aria-labelledby="toc-title" className={styles.toc}>
      <div className={styles.tocHeader}>
        <div className={styles.tocTitleWrap}>
          <span className={styles.tocHeaderIcon} aria-hidden="true">
            <Icon name="grid" />
          </span>
          <p id="toc-title" className={styles.tocTitle}>
            سرفصل‌های این آموزش
          </p>
        </div>
        <span className={styles.tocCountBadge}>{faNumber(allItems.length)} بخش</span>
      </div>

      <ol className={styles.tocList}>
        {allItems.map(heading => {
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id} className={styles.tocItem}>
              <a
                href={`#${heading.id}`}
                onClick={() => setActiveId(heading.id)}
                className={`${styles.tocLink} ${isActive ? styles.tocLinkActive : ''}`}
              >
                <span className={styles.tocNum} aria-hidden="true">
                  {faNumber(heading.index)}
                </span>
                <span className={styles.tocText}>{heading.text}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
