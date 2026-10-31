'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Icon } from '@/components/Icons';
import { faNumber } from '@/lib/format';
import { useSpotlight } from '@/lib/hooks/useSpotlight';

import type { GuideHeading } from './GuideBody';
import styles from './guides.module.css';

function useGuideScrollSpy(headings: GuideHeading[], hasFaq: boolean) {
  const allItems = useMemo(
    () => [
      ...headings,
      ...(hasFaq
        ? [{ id: 'faq-title', text: 'سوالات متداول', index: headings.length + 1 }]
        : []),
    ],
    [headings, hasFaq],
  );

  const [activeId, setActiveId] = useState<string>(allItems[0]?.id ?? '');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
      } else {
        setProgress(0);
      }

      if (allItems.length === 0) return;

      // Pick the last heading whose top has crossed 165px from the top of the viewport
      const threshold = 165;
      let currentId = allItems[0].id;
      for (const item of allItems) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= threshold) {
          currentId = item.id;
        }
      }
      setActiveId(currentId);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [allItems]);

  const jumpToSection = useCallback((id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 132;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, []);

  return { allItems, activeId, setActiveId, progress, jumpToSection };
}

export function GuideReadingTools({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  useSpotlight(`.${styles.spotCard}, .${styles.articleHeroStage}`);

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
    <button
      type="button"
      onClick={handleCopy}
      className={`${styles.copyLinkBtn} ${copied ? styles.copyLinkBtnSuccess : ''}`}
      aria-label="کپی لینک این آموزش"
    >
      <Icon name={copied ? 'check' : 'globe'} />
      <span>{copied ? 'لینک کپی شد!' : 'کپی لینک راهنما'}</span>
    </button>
  );
}

/**
 * Sticky Floating Progress + Step Switcher Bar that stays pinned to the top
 * of the viewport as the user scrolls anywhere through the guide.
 */
export function GuideStickyStepBar({
  headings,
  hasFaq,
}: {
  headings: GuideHeading[];
  hasFaq: boolean;
}) {
  const { allItems, activeId, progress, jumpToSection } = useGuideScrollSpy(
    headings,
    hasFaq,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const stripRef = useRef<HTMLDivElement | null>(null);

  const activeIndex = Math.max(
    0,
    allItems.findIndex(item => item.id === activeId),
  );
  const activeItem = allItems[activeIndex] ?? allItems[0];

  // Keep active pill centered inside the horizontal strip without touching window scroll
  useEffect(() => {
    const container = stripRef.current;
    if (!container || !activeId) return;
    const pill = container.querySelector<HTMLElement>(
      `[data-step-pill="${activeId}"]`,
    );
    if (!pill) return;
    const targetLeft =
      pill.offsetLeft - container.clientWidth / 2 + pill.clientWidth / 2;
    container.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }, [activeId]);

  if (allItems.length === 0) return null;

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < allItems.length - 1;

  return (
    <>
      {/* Fixed 3px top edge progress line */}
      <div className={styles.readingProgressTrack} aria-hidden="true">
        <div
          className={styles.readingProgressFill}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Sticky Floating Step Switcher & Progress HUD */}
      <div className={styles.stickyStepBar}>
        <div className={styles.stickyStepProgressLine} aria-hidden="true">
          <div
            className={styles.stickyStepProgressFill}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className={styles.stickyStepTopRow}>
          <button
            type="button"
            onClick={() => setDrawerOpen(prev => !prev)}
            className={styles.stickyStepCurrentBtn}
            aria-expanded={drawerOpen}
            aria-label="نمایش یا بستن فهرست کامل مراحل"
          >
            <span className={styles.stickyStepCounter}>
              گام {faNumber(activeIndex + 1)} از {faNumber(allItems.length)}
            </span>
            <span className={styles.stickyStepCurrentTitle}>
              {activeItem?.text}
            </span>
          </button>

          <div className={styles.stickyStepControls}>
            <span className={styles.stickyStepPercent}>
              {faNumber(Math.round(progress))}٪
            </span>

            <button
              type="button"
              disabled={!canPrev}
              onClick={() => canPrev && jumpToSection(allItems[activeIndex - 1].id)}
              className={styles.stickyStepNavBtn}
              aria-label="گام قبلی"
              title="گام قبلی"
            >
              <Icon name="arrow" className={styles.stickyStepPrevIcon} />
            </button>

            <button
              type="button"
              disabled={!canNext}
              onClick={() => canNext && jumpToSection(allItems[activeIndex + 1].id)}
              className={styles.stickyStepNavBtn}
              aria-label="گام بعدی"
              title="گام بعدی"
            >
              <Icon name="arrow" />
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(prev => !prev)}
              className={`${styles.stickyStepListToggle} ${
                drawerOpen ? styles.stickyStepListToggleActive : ''
              }`}
              aria-expanded={drawerOpen}
            >
              <Icon name={drawerOpen ? 'x' : 'grid'} />
              <span>مراحل</span>
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Step Pills — Always accessible with 1 tap */}
        <div
          ref={stripRef}
          className={styles.stickyStepPills}
          role="tablist"
          aria-label="سوییچ سریع بین مراحل آموزش"
        >
          {allItems.map((item, idx) => {
            const isActive = item.id === activeId;
            const isCompleted = idx < activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                data-step-pill={item.id}
                onClick={() => {
                  jumpToSection(item.id);
                  setDrawerOpen(false);
                }}
                className={`${styles.stickyStepPill} ${
                  isActive ? styles.stickyStepPillActive : ''
                } ${isCompleted ? styles.stickyStepPillDone : ''}`}
              >
                <span className={styles.stickyStepPillNum}>
                  {isCompleted ? <Icon name="check" /> : faNumber(item.index)}
                </span>
                <span className={styles.stickyStepPillText}>{item.text}</span>
              </button>
            );
          })}
        </div>

        {/* Expandable Full Step Drawer (when user taps current step or "مراحل") */}
        {drawerOpen && (
          <ol className={styles.stickyStepDrawer}>
            {allItems.map((item, idx) => {
              const isActive = item.id === activeId;
              const isCompleted = idx < activeIndex;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      jumpToSection(item.id);
                      setDrawerOpen(false);
                    }}
                    className={`${styles.stickyDrawerItem} ${
                      isActive ? styles.stickyDrawerItemActive : ''
                    }`}
                  >
                    <span className={styles.stickyDrawerNum}>
                      {isCompleted ? <Icon name="check" /> : faNumber(item.index)}
                    </span>
                    <span className={styles.stickyDrawerText}>{item.text}</span>
                    {isActive && (
                      <span className={styles.stickyDrawerActiveTag}>در حال مطالعه</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
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
  const { allItems, activeId, jumpToSection } = useGuideScrollSpy(headings, hasFaq);

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
                onClick={e => {
                  e.preventDefault();
                  jumpToSection(heading.id);
                }}
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
