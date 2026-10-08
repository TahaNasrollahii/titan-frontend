'use client';

import {
  animate,
  motion,
  MotionConfig,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

import { Avatar, Icon } from '@/components/Icons';
import { contentApi } from '@/lib/api/endpoints';
import type { PlatformStats } from '@/lib/api/types';
import { faNumber } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';
import { useSpotlight } from '@/lib/hooks/useSpotlight';

import { finalCta, hero, manifesto, manifestoHighlights, pillars, team, values } from './content';
import styles from './about.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

/** One of the site's own icons from /public/icons (solid, rounded, white). */
function SiteIcon({ name }: { name: string }) {
  return <img className={styles.siteIcon} src={`/icons/${name}.png`} alt="" draggable={false} />;
}

const stagger: Variants = { show: { transition: { staggerChildren: 0.09 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

/** Section that reveals its `rise` children one after another when scrolled into view. */
function Reveal({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.section
      className={className}
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.section>
  );
}

function SectionHead({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <motion.header className={styles.sectionHead} variants={rise}>
      <span className={styles.kicker}>{kicker}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </motion.header>
  );
}

// ------------------------------------------------------------------ hero
const CHARACTERS = [
  { src: '/images/hero/characters/apexlegends.png', alt: 'Apex Legends', className: styles.charLeft, delay: 0.35 },
  { src: '/images/hero/characters/fortnite.png', alt: 'Fortnite', className: styles.charRight, delay: 0.5 },
  { src: '/images/hero/characters/valorant.png', alt: 'Valorant', className: styles.charCenter, delay: 0.2 },
];

const ORBIT_LOGOS = [
  { src: '/images/glossy-valorant-logo.png', className: styles.orbitA },
  { src: '/images/glossy-apex-logo.png', className: styles.orbitB },
  { src: '/images/glossy-fortnite-logo.png', className: styles.orbitC },
  { src: '/images/login-premium.png', className: styles.orbitD },
];

function Hero() {
  useSpotlight(`.${styles.heroArt}`);

  return (
    <section className={styles.hero}>
      <motion.div className={styles.heroText} variants={stagger} initial="hidden" animate="show">
        <motion.span className={styles.badge} variants={rise}>
          <span className={styles.liveDot} />
          {hero.badge}
        </motion.span>
        <motion.h1 variants={rise}>
          {hero.titleStart} <span className={styles.gradientText}>{hero.titleAccent}</span> {hero.titleEnd}
        </motion.h1>
        <motion.p variants={rise}>{hero.text}</motion.p>
        <motion.div className={styles.actions} variants={rise}>
          <Link href={hero.primary.href} className={styles.btnPrimary}>
            {hero.primary.label}
            <Icon name="arrow" />
          </Link>
          <Link href={hero.secondary.href} className={styles.btnGhost}>
            {hero.secondary.label}
          </Link>
        </motion.div>
      </motion.div>

      <div className={styles.heroArt} aria-hidden>
        <div className={styles.halo} />
        <div className={styles.ringDashed} />
        <div className={styles.ringGlow} />
        {CHARACTERS.map(character => (
          <div key={character.src} className={`${styles.character} ${character.className}`}>
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: character.delay, duration: 0.9, ease: EASE }}
            >
              <Image src={character.src} alt={character.alt} width={420} height={420} priority draggable={false} />
            </motion.div>
          </div>
        ))}
        {ORBIT_LOGOS.map((logo, index) => (
          <motion.div
            key={logo.src}
            className={`${styles.orbit} ${logo.className}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 + index * 0.12, type: 'spring', stiffness: 140, damping: 12 }}
          >
            <Image src={logo.src} alt="" width={90} height={90} draggable={false} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ stats
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!inView || !el) return;
    if (reduce) {
      el.textContent = faNumber(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.8,
      ease: EASE,
      onUpdate: latest => {
        el.textContent = faNumber(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return <span ref={ref}>{faNumber(0)}</span>;
}

const CURRENCY_UNIT = { USD: 'دلار', IRT: 'تومان' } as const;

const STAT_CARDS: { icon: string; label: string; pick: (stats: PlatformStats) => number }[] = [
  { icon: 'account', label: 'گیمر عضو', pick: stats => stats.players },
  { icon: 'team', label: 'تیم فعال', pick: stats => stats.teams },
  { icon: 'dashboard', label: 'تورنومنت برگزارشده', pick: stats => stats.tournaments },
  { icon: 'cart', label: 'سفارش تحویل‌شده', pick: stats => stats.ordersDelivered },
];

function Stats() {
  const { data, error } = useApi(contentApi.stats);
  const [mainPrize, ...otherPrizes] = data?.prizesAwarded ?? [];

  return (
    <Reveal className={styles.section}>
      <SectionHead kicker="تایتان به عدد" title="عددهایی که هر روز بزرگ‌تر می‌شن" />
      <div className={styles.statsGrid}>
        <motion.div className={`${styles.statCard} ${styles.statFeatured}`} variants={rise}>
          <span className={styles.statIcon}>
            <SiteIcon name="tournament" />
          </span>
          <b className={styles.statValue}>
            {data ? <CountUp value={mainPrize?.amount ?? 0} /> : error ? '—' : <span className={styles.skeleton} />}
            {mainPrize && <small>{CURRENCY_UNIT[mainPrize.currency]}</small>}
          </b>
          <span className={styles.statLabel}>جایزه‌ی پرداخت‌شده در تورنومنت‌ها</span>
          {otherPrizes.map(entry => (
            <span key={entry.currency} className={styles.statExtra}>
              + {faNumber(entry.amount)} {CURRENCY_UNIT[entry.currency]}
            </span>
          ))}
        </motion.div>
        {STAT_CARDS.map(card => (
          <motion.div key={card.label} className={styles.statCard} variants={rise}>
            <span className={styles.statIcon}>
              <SiteIcon name={card.icon} />
            </span>
            <b className={styles.statValue}>
              {data ? <CountUp value={card.pick(data)} /> : error ? '—' : <span className={styles.skeleton} />}
            </b>
            <span className={styles.statLabel}>{card.label}</span>
          </motion.div>
        ))}
      </div>
    </Reveal>
  );
}

// ------------------------------------------------------------------ manifesto
const stripPunctuation = (word: string) => word.replace(/[.,:;؛،؟?!]/g, '');

function Word({ progress, range, accent, children }: {
  progress: MotionValue<number>;
  range: [number, number];
  accent: boolean;
  children: string;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <>
      <motion.span style={{ opacity }} className={accent ? styles.accentWord : undefined}>
        {children}
      </motion.span>{' '}
    </>
  );
}

function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = manifesto.split(' ');

  return (
    <section className={`${styles.section} ${styles.manifesto}`}>
      <span className={styles.kicker}>داستان ما</span>
      <p ref={ref}>
        {words.map((word, index) => (
          <Word
            key={index}
            progress={scrollYProgress}
            range={[index / words.length, (index + 1) / words.length]}
            accent={manifestoHighlights.includes(stripPunctuation(word))}
          >
            {word}
          </Word>
        ))}
      </p>
    </section>
  );
}

// ------------------------------------------------------------------ pillars, values, team
function Pillars() {
  useSpotlight(`.${styles.spot}`);

  return (
    <Reveal className={styles.section}>
      <SectionHead kicker="چی می‌سازیم" title="همه‌ی دنیای گیمینگت، یه جا" />
      <div className={styles.pillarGrid}>
        {pillars.map((pillar, index) => (
          <motion.div key={pillar.title} variants={rise}>
            <Link href={pillar.href} className={`${styles.pillar} ${styles.spot}`}>
              <span className={styles.pillarIndex}>{faNumber(index + 1).padStart(2, '۰')}</span>
              <span className={styles.pillarIcon}>
                <SiteIcon name={pillar.icon} />
              </span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
              <span className={styles.pillarLink}>
                {pillar.cta}
                <Icon name="arrow" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </Reveal>
  );
}

function Values() {
  return (
    <Reveal className={styles.section}>
      <SectionHead
        kicker="ارزش‌های ما"
        title="قول‌هایی که پاشون وایمیستیم"
        text="این‌ها شعار نیستن؛ معیارهایی‌ان که هر تصمیم تایتان باهاشون سنجیده می‌شه."
      />
      <div className={styles.valueGrid}>
        {values.map(value => (
          <motion.div key={value.title} className={styles.value} variants={rise}>
            <span className={styles.valueIcon}>
              <SiteIcon name={value.icon} />
            </span>
            <div>
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Reveal>
  );
}

function Team() {
  return (
    <Reveal className={styles.section}>
      <SectionHead kicker="تیم تایتان" title="آدم‌های پشت صحنه" text="گیمرهایی که تصمیم گرفتن تجربه‌ی بازی رو برای همه بهتر کنن." />
      <div className={styles.teamGrid}>
        {team.map(member => (
          <motion.div key={member.tag} className={styles.member} variants={rise}>
            <span className={styles.avatarRing}>
              <span className={styles.avatar}>
                <Avatar seed={member.seed} />
              </span>
            </span>
            <h3>{member.name}</h3>
            <span className={styles.role}>{member.role}</span>
            <p>{member.bio}</p>
            <span className={styles.tag}>@{member.tag}</span>
          </motion.div>
        ))}
      </div>
    </Reveal>
  );
}

function FinalCta() {
  return (
    <Reveal className={styles.section}>
      <motion.div className={styles.cta} variants={rise}>
        <div className={styles.ctaGlow} aria-hidden />
        <Image className={styles.ctaLogo} src="/titan-logo.png" alt="" width={72} height={72} />
        <h2>{finalCta.title}</h2>
        <p>{finalCta.text}</p>
        <div className={styles.actions}>
          <Link href={finalCta.primary.href} className={styles.btnPrimary}>
            {finalCta.primary.label}
            <Icon name="arrow" />
          </Link>
          <Link href={finalCta.secondary.href} className={styles.btnGhost}>
            {finalCta.secondary.label}
          </Link>
        </div>
      </motion.div>
    </Reveal>
  );
}

export function AboutView() {
  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.page}>
        <Hero />
        <Stats />
        <Manifesto />
        <Pillars />
        <Values />
        <Team />
        <FinalCta />
      </div>
    </MotionConfig>
  );
}
