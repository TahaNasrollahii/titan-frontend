import Link from 'next/link';
import type { ReactNode } from 'react';

import { Icon } from '@/components/Icons';
import { faNumber } from '@/lib/format';

import { cleanGuideText } from './getGuides';
import styles from './guides.module.css';

/**
 * Renders the small text format guides are written in from the admin:
 * "## " / "### " headings, "- " bullets, "1. " steps, **bold**, [text](/path) links,
 * and a blank line between paragraphs. Plain text in, so no HTML is ever injected.
 */

type Block =
  | { kind: 'h2' | 'h3'; text: string; id: string; sectionIndex: number }
  | { kind: 'p'; text: string }
  | { kind: 'ul' | 'ol'; items: string[] }
  | { kind: 'img'; src: string; alt: string };

export interface GuideHeading {
  id: string;
  text: string;
  index: number;
}

function sectionIconForTitle(title: string): string {
  if (/امنیت|کلاهبرداری|حفاظت|رمز|2FA|دومرحله/i.test(title)) return 'shield';
  if (/زمان|تحویل|مدت/i.test(title)) return 'clock';
  if (/نکات|مهم|توجه|هشدار/i.test(title)) return 'alert-triangle';
  if (/پشتیبانی|ارتباط|تماس/i.test(title)) return 'chat';
  if (/پرداخت|کیف پول|جایزه|جوایز|قیمت/i.test(title)) return 'wallet';
  if (/تیم|دعوت|اعضا/i.test(title)) return 'users';
  if (/تورنومنت|جدول|مسابقه|لابی/i.test(title)) return 'trophy';
  if (/قبل از|پیش‌نیاز|اطلاعات لازم|چه چیزهایی/i.test(title)) return 'info';
  return 'sparkles';
}

function isWarningText(text: string): boolean {
  return /هرگز|کلاهبرداری|جعلی|خطر|قبل از ثبت سفارش|فقط در اختیار|مهم:/i.test(text);
}

function parse(source: string): Block[] {
  const rawBlocks: Block[] = [];
  let paragraph: string[] = [];
  let headingCount = 0;
  let h2Count = 0;
  let seenH2 = false;

  const flush = () => {
    if (paragraph.length) {
      const joined = cleanGuideText(paragraph.join(' '));
      if (joined) rawBlocks.push({ kind: 'p', text: joined });
    }
    paragraph = [];
  };

  const pushItem = (kind: 'ul' | 'ol', text: string) => {
    const cleaned = cleanGuideText(text);
    if (!cleaned) return;
    const last = rawBlocks[rawBlocks.length - 1];
    if (last && last.kind === kind) last.items.push(cleaned);
    else rawBlocks.push({ kind, items: [cleaned] });
  };

  for (const raw of source.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim();
    const heading = /^(#{2,3})\s+(.+)$/.exec(line);
    const img = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(line);
    const bullet = /^[-•]\s+(.+)$/.exec(line);
    const step = /^\d+[.)]\s+(.+)$/.exec(line);

    if (!line) {
      flush();
    } else if (heading) {
      flush();
      const cleanHeading = cleanGuideText(heading[2]);
      if (!cleanHeading) continue;
      headingCount += 1;
      const isH2 = heading[1].length === 2 || !seenH2;
      if (isH2) {
        seenH2 = true;
        h2Count += 1;
      }
      rawBlocks.push({
        kind: isH2 ? 'h2' : 'h3',
        text: cleanHeading,
        id: `section-${headingCount}`,
        sectionIndex: h2Count,
      });
    } else if (img) {
      flush();
      rawBlocks.push({
        kind: 'img',
        alt: cleanGuideText(img[1]),
        src: img[2].trim(),
      });
    } else if (bullet) {
      flush();
      pushItem('ul', bullet[1]);
    } else if (step) {
      flush();
      pushItem('ol', step[1]);
    } else {
      const cleanedLine = cleanGuideText(line);
      if (cleanedLine) paragraph.push(cleanedLine);
    }
  }
  flush();

  // Remove any heading that ended up empty because its only body line was a draft note
  return rawBlocks.filter((block, idx) => {
    if (block.kind !== 'h2' && block.kind !== 'h3') return true;
    const next = rawBlocks[idx + 1];
    if (!next) return false;
    if (block.kind === 'h2' && next.kind === 'h2') return false;
    if (block.kind === 'h3' && (next.kind === 'h2' || next.kind === 'h3')) return false;
    return true;
  });
}

function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    const key = `${index}-${match[0].length}`;
    if (match[1]) {
      nodes.push(
        <strong key={key} className={styles.inlineStrong}>
          {match[1]}
        </strong>,
      );
    } else if (match[3].startsWith('/')) {
      nodes.push(
        <Link key={key} href={match[3]} className={styles.inlineLink}>
          <span>{match[2]}</span>
          <Icon name="arrow" className={styles.inlineLinkIcon} />
        </Link>,
      );
    } else if (/^https?:\/\//.test(match[3])) {
      nodes.push(
        <a
          key={key}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.inlineLink}
        >
          <span>{match[2]}</span>
          <Icon name="arrow" className={styles.inlineLinkIcon} />
        </a>,
      );
    } else {
      nodes.push(match[0]);
    }
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function guideHeadings(source: string): GuideHeading[] {
  let idx = 0;
  return parse(source).flatMap(block => {
    if (block.kind === 'h2') {
      idx += 1;
      return [{ id: block.id, text: block.text, index: idx }];
    }
    return [];
  });
}

export function guideStepsCount(source: string): number {
  return parse(source).reduce(
    (sum, block) => (block.kind === 'ol' ? sum + block.items.length : sum),
    0,
  );
}

/** Rough reading time for Persian prose (~200 words a minute). */
export function readingMinutes(source: string): number {
  const cleaned = cleanGuideText(source);
  return Math.max(1, Math.round(cleaned.split(/\s+/).filter(Boolean).length / 200));
}

export function GuideBody({ source }: { source: string }) {
  const blocks = parse(source);

  return (
    <div className={styles.prose}>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case 'h2': {
            const iconName = sectionIconForTitle(block.text);
            return (
              <div key={index} className={styles.proseH2Wrap}>
                <div className={styles.proseH2Badge} aria-hidden="true">
                  <span className={styles.proseH2Icon}>
                    <Icon name={iconName} />
                  </span>
                  <span className={styles.proseH2Num}>
                    بخش {faNumber(block.sectionIndex)}
                  </span>
                </div>
                <h2 id={block.id} className={styles.proseH2}>
                  {inline(block.text)}
                </h2>
              </div>
            );
          }
          case 'h3':
            return (
              <h3 key={index} id={block.id} className={styles.proseH3}>
                <span className={styles.proseH3Dot} aria-hidden="true" />
                <span>{inline(block.text)}</span>
              </h3>
            );
          case 'ol':
            return (
              <ol key={index} className={styles.stepList}>
                {block.items.map((item, i) => (
                  <li key={i} className={styles.stepCard}>
                    <div className={styles.stepBadgeCol} aria-hidden="true">
                      <span className={styles.stepBadge}>
                        <small>گام</small>
                        <b>{faNumber(i + 1)}</b>
                      </span>
                      {i < block.items.length - 1 && <span className={styles.stepConnector} />}
                    </div>
                    <div className={styles.stepBody}>{inline(item)}</div>
                  </li>
                ))}
              </ol>
            );
          case 'ul':
            return (
              <ul key={index} className={styles.bulletList}>
                {block.items.map((item, i) => {
                  const warn = isWarningText(item);
                  return (
                    <li
                      key={i}
                      className={`${styles.bulletItem} ${warn ? styles.bulletItemWarn : ''}`}
                    >
                      <span className={styles.bulletMarker} aria-hidden="true">
                        <Icon name={warn ? 'shield' : 'check'} />
                      </span>
                      <div className={styles.bulletText}>{inline(item)}</div>
                    </li>
                  );
                })}
              </ul>
            );
          case 'img':
            return (
              <figure key={index} className={styles.proseFigure}>
                <div className={styles.proseImageFrame}>
                  <img
                    src={block.src}
                    alt={block.alt}
                    loading="lazy"
                    className={styles.proseImage}
                  />
                </div>
                {block.alt && (
                  <figcaption className={styles.proseCaption}>
                    <span className={styles.proseCaptionDot} aria-hidden="true" />
                    <span>{block.alt}</span>
                  </figcaption>
                )}
              </figure>
            );
          default: {
            const isLead = index === 0;
            const warn = !isLead && isWarningText(block.text);
            if (isLead) {
              return (
                <div key={index} className={styles.proseIntroCard}>
                  <span className={styles.proseIntroIcon} aria-hidden="true">
                    <Icon name="sparkles" />
                  </span>
                  <p className={styles.proseIntroText}>{inline(block.text)}</p>
                </div>
              );
            }
            return (
              <p
                key={index}
                className={`${styles.proseParagraph} ${warn ? styles.proseCalloutWarn : ''}`}
              >
                {inline(block.text)}
              </p>
            );
          }
        }
      })}
    </div>
  );
}
