import Link from 'next/link';
import type { ReactNode } from 'react';

import styles from './guides.module.css';

/**
 * Renders the small text format guides are written in from the admin:
 * "## " / "### " headings, "- " bullets, "1. " steps, **bold**, [text](/path) links,
 * and a blank line between paragraphs. Plain text in, so no HTML is ever injected.
 */

type Block =
  | { kind: 'h2' | 'h3'; text: string; id: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul' | 'ol'; items: string[] };

export interface GuideHeading {
  id: string;
  text: string;
}

function parse(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let headingCount = 0;

  const flush = () => {
    if (paragraph.length) blocks.push({ kind: 'p', text: paragraph.join(' ') });
    paragraph = [];
  };
  const pushItem = (kind: 'ul' | 'ol', text: string) => {
    const last = blocks[blocks.length - 1];
    if (last && last.kind === kind) last.items.push(text);
    else blocks.push({ kind, items: [text] });
  };

  for (const raw of source.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim();
    const heading = /^(#{2,3})\s+(.+)$/.exec(line);
    const bullet = /^[-•]\s+(.+)$/.exec(line);
    const step = /^\d+[.)]\s+(.+)$/.exec(line);

    if (!line) flush();
    else if (heading) {
      flush();
      headingCount += 1;
      blocks.push({ kind: heading[1].length === 2 ? 'h2' : 'h3', text: heading[2], id: `section-${headingCount}` });
    } else if (bullet) {
      flush();
      pushItem('ul', bullet[1]);
    } else if (step) {
      flush();
      pushItem('ol', step[1]);
    } else paragraph.push(line);
  }
  flush();
  return blocks;
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
      nodes.push(<strong key={key}>{match[1]}</strong>);
    } else if (match[3].startsWith('/')) {
      nodes.push(
        <Link key={key} href={match[3]}>
          {match[2]}
        </Link>,
      );
    } else if (/^https?:\/\//.test(match[3])) {
      nodes.push(
        <a key={key} href={match[3]} target="_blank" rel="noopener noreferrer">
          {match[2]}
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
  return parse(source).flatMap(block => (block.kind === 'h2' ? [{ id: block.id, text: block.text }] : []));
}

/** Rough reading time for Persian prose (~200 words a minute). */
export function readingMinutes(source: string): number {
  return Math.max(1, Math.round(source.split(/\s+/).filter(Boolean).length / 200));
}

export function GuideBody({ source }: { source: string }) {
  return (
    <div className={styles.prose}>
      {parse(source).map((block, index) => {
        switch (block.kind) {
          case 'h2':
            return (
              <h2 key={index} id={block.id}>
                {inline(block.text)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={index} id={block.id}>
                {inline(block.text)}
              </h3>
            );
          case 'ul':
          case 'ol': {
            const List = block.kind;
            return (
              <List key={index}>
                {block.items.map((item, i) => (
                  <li key={i}>{inline(item)}</li>
                ))}
              </List>
            );
          }
          default:
            return <p key={index}>{inline(block.text)}</p>;
        }
      })}
    </div>
  );
}
