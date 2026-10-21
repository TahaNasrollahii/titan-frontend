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

import {
  finalCta,
  hero,
  manifesto,
  manifestoHighlights,
  manifestoIntro,
  manifestoPillars,
  pillars,
  statsIntro,
  team,
  values,
} from './content';
import styles from './about.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

/** One of the site's own icons from /public/icons (solid, rounded, white). */
function SiteIcon({ name }: { name: string }) {
  return <img className={styles.siteIcon} src={`/icons/${name}.webp`} alt="" aria-hidden="true" draggable={false} />;
}

const stagger: Variants = { show: { transition: { staggerChildren: 0.08 } } };
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
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </motion.section>
  );
}

function SectionHead({
  kicker,
  title,
  text,
  badgeIcon,
}: {
  kicker: string;
  title: string;
  text?: string;
  badgeIcon?: string;
}) {
  return (
    <motion.header className={styles.sectionHead} variants={rise}>
      <span className={styles.kicker}>
        {badgeIcon && <span className={styles.kickerDot} />}
        {kicker}
      </span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </motion.header>
  );
}

// ------------------------------------------------------------------ hero (DO NOT TOUCH)
const CHARACTERS = [
  { src: '/images/hero/characters/apexlegends.webp', alt: 'Apex Legends', className: styles.charLeft, delay: 0.35 },
  { src: '/images/hero/characters/fortnite.webp', alt: 'Fortnite', className: styles.charRight, delay: 0.5 },
  { src: '/images/hero/characters/valorant.webp', alt: 'Valorant', className: styles.charCenter, delay: 0.2 },
];

const ORBIT_LOGOS = [
  { src: '/images/glossy-valorant-logo.webp', className: styles.orbitA },
  { src: '/images/glossy-apex-logo.webp', className: styles.orbitB },
  { src: '/images/glossy-fortnite-logo.webp', className: styles.orbitC },
  { src: '/images/login-premium.webp', className: styles.orbitD },
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

const STAT_CARDS: {
  icon: string;
  label: string;
  sub: string;
  badge: string;
  accent: 'crimson' | 'violet' | 'amber' | 'emerald';
  pick: (stats: PlatformStats) => number;
}[] = [
  {
    icon: 'account',
    label: 'گیمر عضو',
    sub: 'پلیرهای ثبت‌نام‌شده در پلتفرم',
    badge: 'جامعه فعال',
    accent: 'crimson',
    pick: stats => stats.players,
  },
  {
    icon: 'team',
    label: 'تیم فعال',
    sub: 'اسکوادها و کلن‌های ثبت‌شده',
    badge: 'آماده مسابقات',
    accent: 'violet',
    pick: stats => stats.teams,
  },
  {
    icon: 'dashboard',
    label: 'تورنومنت برگزارشده',
    sub: 'مسابقات رسمی با جوایز نقدی',
    badge: 'براکت زنده',
    accent: 'amber',
    pick: stats => stats.tournaments,
  },
  {
    icon: 'cart',
    label: 'سفارش تحویل‌شده',
    sub: 'آیتم‌ها و بسته‌های فعال‌شده',
    badge: 'تحویل فوری',
    accent: 'emerald',
    pick: stats => stats.ordersDelivered,
  },
];

function Stats({ initialStats }: { initialStats?: PlatformStats | null }) {
  const { data, error } = useApi(contentApi.stats, [], initialStats ?? undefined);
  const [mainPrize, ...otherPrizes] = data?.prizesAwarded ?? [];
  useSpotlight(`.${styles.spotStat}`);

  return (
    <Reveal className={styles.section}>
      <SectionHead
        kicker={statsIntro.kicker}
        title={statsIntro.title}
        text={statsIntro.subtitle}
        badgeIcon="dot"
      />
      <div className={styles.statsGrid}>
        {/* Featured Card: Prizes Awarded */}
        <motion.div
          className={`${styles.statCard} ${styles.statFeatured} ${styles.spotStat}`}
          variants={rise}
        >
          <div className={styles.featuredGlow} aria-hidden />
          <div className={styles.statFeaturedHeader}>
            <span className={styles.prizeTrophyBadge}>
              <span className={styles.trophyIcon}>🏆</span>
              رکورد پرداخت جوایز نقدی
            </span>
            <span className={styles.liveInstantBadge}>
              <span className={styles.pulseDotGreen} />
              تسویه آنی به برندگان
            </span>
          </div>

          <div className={styles.featuredMainContent}>
            <div className={styles.featuredIconContainer}>
              <SiteIcon name="tournament" />
            </div>

            <div className={styles.featuredNumbers}>
              <span className={styles.featuredLabel}>مجموع جوایز پرداخت‌شده در تورنومنت‌ها</span>
              <div className={styles.featuredValueRow}>
                <b className={styles.statValueFeatured}>
                  {data ? (
                    <CountUp value={mainPrize?.amount ?? 0} />
                  ) : error ? (
                    '—'
                  ) : (
                    <span className={styles.skeleton} />
                  )}
                </b>
                {mainPrize && <span className={styles.featuredUnit}>{CURRENCY_UNIT[mainPrize.currency]}</span>}
              </div>

              {otherPrizes.length > 0 && (
                <div className={styles.otherPrizesRow}>
                  {otherPrizes.map(entry => (
                    <span key={entry.currency} className={styles.prizePill}>
                      <span className={styles.prizePillPlus}>+</span>
                      <b>{faNumber(entry.amount)}</b>
                      <small>{CURRENCY_UNIT[entry.currency]}</small>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.featuredFooter}>
            <span className={styles.guaranteeShield}>
              <Icon name="shield" />
            </span>
            <p className={styles.guaranteeText}>{statsIntro.guaranteeText}</p>
          </div>
        </motion.div>

        {/* 4 Metric Cards */}
        {STAT_CARDS.map(card => (
          <motion.div
            key={card.label}
            className={`${styles.statCard} ${styles.statMetric} ${styles.spotStat}`}
            data-accent={card.accent}
            variants={rise}
          >
            <div className={styles.metricTop}>
              <span className={`${styles.statIcon} ${styles[`accent_${card.accent}`]}`}>
                <SiteIcon name={card.icon} />
              </span>
              <span className={styles.metricBadge}>{card.badge}</span>
            </div>

            <div className={styles.metricBottom}>
              <b className={styles.statValue}>
                {data ? (
                  <CountUp value={card.pick(data)} />
                ) : error ? (
                  '—'
                ) : (
                  <span className={styles.skeleton} />
                )}
              </b>
              <h3 className={styles.statLabel}>{card.label}</h3>
              <p className={styles.statSub}>{card.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Reveal>
  );
}

// ------------------------------------------------------------------ manifesto (Our Story)
const stripPunctuation = (word: string) => word.replace(/[.,:;؛،؟?!]/g, '');

function Word({
  progress,
  range,
  accent,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  accent: boolean;
  children: string;
}) {
  const opacity = useTransform(progress, range, [0.22, 1]);
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
    <Reveal className={styles.section}>
      <div className={styles.manifestoWrapper}>
        <div className={styles.manifestoAmbientGlow} aria-hidden />

        <div className={styles.manifestoHeader}>
          <span className={styles.kicker}>
            <span className={styles.kickerDot} />
            {manifestoIntro.kicker}
          </span>
          <h2>{manifestoIntro.title}</h2>
          <p>{manifestoIntro.tagline}</p>
        </div>

        <div className={styles.quoteBlock}>
          <p ref={ref} className={styles.manifestoParagraph}>
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
        </div>

        <div className={styles.manifestoPillarsGrid}>
          {manifestoPillars.map(p => (
            <div key={p.title} className={styles.manifestoPillarCard}>
              <span className={styles.manifestoPillarIcon}>
                <Icon name={p.icon} />
              </span>
              <div>
                <h4>{p.title}</h4>
                <p>{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

// ------------------------------------------------------------------ pillars (Ecosystem)
function Pillars() {
  useSpotlight(`.${styles.spotPillar}`);

  return (
    <Reveal className={styles.section}>
      <SectionHead
        kicker="اکوسیستم پلتفرم"
        title="همه‌ی دنیای گیمینگت، یک‌جا"
        text="تایتان فقط یک فروشگاه نیست؛ مجموعه‌ای کامل از ابزارهای رقابت، تجارت، تیم‌سازی و پاداش برای گیمرهاست."
        badgeIcon="dot"
      />
      <div className={styles.pillarGrid}>
        {pillars.map(pillar => (
          <motion.div key={pillar.title} variants={rise} className={styles.pillarCol}>
            <Link
              href={pillar.href}
              className={`${styles.pillar} ${styles.spotPillar}`}
              data-accent={pillar.accent}
            >
              <div className={styles.pillarTopRow}>
                <span className={styles.pillarModBadge}>{pillar.mod}</span>
                <span className={styles.pillarFeatureBadge}>{pillar.badge}</span>
              </div>

              <div className={styles.pillarIconFrame}>
                <span className={styles.pillarIcon}>
                  <SiteIcon name={pillar.icon} />
                </span>
              </div>

              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarText}>{pillar.text}</p>

              <div className={styles.pillarTagsRow}>
                {pillar.tags.map(tag => (
                  <span key={tag} className={styles.pillarTag}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className={styles.pillarFooter}>
                <span className={styles.pillarLink}>
                  {pillar.cta}
                  <span className={styles.pillarArrowIcon}>
                    <Icon name="arrow" />
                  </span>
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </Reveal>
  );
}

// ------------------------------------------------------------------ values (Core Principles)
function Values() {
  return (
    <Reveal className={styles.section}>
      <SectionHead
        kicker="ارزش‌ها و تعهدات"
        title="قول‌هایی که پای آن‌ها ایستاده‌ایم"
        text="این‌ها شعار تبلیغاتی نیستند؛ قواعد و استانداردهایی هستند که هر روز در تک‌تک تراکنش‌ها و مسابقات اعمال می‌شوند."
        badgeIcon="dot"
      />
      <div className={styles.valueGrid}>
        {values.map(value => (
          <motion.div key={value.title} className={styles.valueCard} variants={rise}>
            <div className={styles.valueHeader}>
              <div className={styles.valueIndexNumber}>{value.number}</div>
              <span className={styles.valueBadge}>{value.badge}</span>
            </div>

            <div className={styles.valueContent}>
              <div className={styles.valueTitleRow}>
                <span className={styles.valueIcon}>
                  <SiteIcon name={value.icon} />
                </span>
                <h3>{value.title}</h3>
              </div>
              <p>{value.text}</p>

              <ul className={styles.valueBulletList}>
                {value.bullets.map((bullet, idx) => (
                  <li key={idx}>
                    <span className={styles.bulletCheckIcon}>
                      <Icon name="check" />
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </Reveal>
  );
}

// ------------------------------------------------------------------ team (Leadership Squad)
function Team() {
  return (
    <Reveal className={styles.section}>
      <SectionHead
        kicker="فرماندهی تایتان"
        title="آدم‌های پشت صحنه"
        text="گیمرهایی با سال‌ها تجربه که تصمیم گرفتند تجربه‌ی بازی و مسابقات را برای جامعه ایران دگرگون کنند."
        badgeIcon="dot"
      />
      <div className={styles.teamGrid}>
        {team.map(member => (
          <motion.div key={member.tag} className={styles.memberCard} variants={rise}>
            <div className={styles.memberTop}>
              <span className={styles.memberStatusDot}>
                <span className={styles.livePulseMini} />
                فعال
              </span>
              <span className={styles.memberTag}>@{member.tag}</span>
            </div>

            <div className={styles.memberAvatarContainer}>
              <div className={styles.avatarCyberRing}>
                <div className={styles.avatarInner}>
                  <Avatar seed={member.seed} />
                </div>
              </div>
            </div>

            <div className={styles.memberInfo}>
              <h3 className={styles.memberName}>{member.name}</h3>
              <span className={styles.memberRole}>{member.role}</span>
              <p className={styles.memberBio}>{member.bio}</p>

              <div className={styles.specialtiesRow}>
                {member.specialties.map(spec => (
                  <span key={spec} className={styles.specialtyChip}>
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Reveal>
  );
}

// ------------------------------------------------------------------ final CTA
function FinalCta() {
  return (
    <Reveal className={styles.section}>
      <motion.div className={styles.cta} variants={rise}>
        <div className={styles.ctaGlow} aria-hidden />
        <div className={styles.ctaInnerGlow} aria-hidden />

        <div className={styles.ctaLogoWrapper}>
          <div className={styles.logoRingHalo} />
          <Image
            className={styles.ctaLogo}
            src="/titan-logo.webp"
            alt="لوگوی تایتان"
            width={84}
            height={84}
            priority
          />
        </div>

        <span className={styles.ctaKickerBadge}>
          <span className={styles.pulseDotGreen} />
          {finalCta.badge}
        </span>

        <h2 className={styles.ctaTitle}>{finalCta.title}</h2>
        <p className={styles.ctaSubtitle}>{finalCta.text}</p>

        <div className={styles.ctaActions}>
          <Link href={finalCta.primary.href} className={styles.btnPrimaryLg}>
            <span>{finalCta.primary.label}</span>
            <span className={styles.btnArrowWrapper}>
              <Icon name="arrow" />
            </span>
          </Link>
          <Link href={finalCta.secondary.href} className={styles.btnGhostLg}>
            <span>{finalCta.secondary.label}</span>
          </Link>
        </div>

        <div className={styles.trustStrip}>
          {finalCta.trustPoints.map((point, index) => (
            <span key={index} className={styles.trustItem}>
              <span className={styles.trustCheck}>
                <Icon name="check" />
              </span>
              <span>{point}</span>
            </span>
          ))}
        </div>
      </motion.div>
    </Reveal>
  );
}

export function AboutView({ initialStats }: { initialStats?: PlatformStats | null }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.page}>
        <Hero />
        <Stats initialStats={initialStats} />
        <Manifesto />
        <Pillars />
        <Values />
        <Team />
        <FinalCta />
      </div>
    </MotionConfig>
  );
}
