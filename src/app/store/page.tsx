'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import './store.css';
import { Icon, Avatar } from '@/components/Icons';
import { useAppContext } from '@/context/AppContext';

// Data
const DISCOUNT_PROMOS = [
  {
    title: 'باندل ویژه Valorant',
    subtitle: 'پکیج کامل اسکین‌های پرایم',
    price: '۲,۱۰۰,۰۰۰',
    oldPrice: '۳,۵۰۰,۰۰۰',
    discount: '۴۰٪',
    img: '/images/games/valorant-character.png',
    scale: 1.15,
    y: 0,
  },
  {
    title: 'Elden Crown',
    subtitle: 'نسخه دلوکس',
    price: '۲,۹۵۰,۰۰۰',
    oldPrice: '۳,۴۵۰,۰۰۰',
    discount: '۱۵٪',
    img: '/images/banner-hero.png',
    scale: 1.1,
    y: 0,
  }
];

const BESTSELLER_PROMOS = [
  {
    title: 'باندل ویژه Apex',
    subtitle: 'شامل اسکین اپیک و ۱۰۰۰ کوین',
    price: '۲,۹۵۰,۰۰۰',
    img: '/images/games/apexlegends-character.png',
    bgImg: 'url(/images/games/apexlegends-background.png)',
    bgGrad: 'linear-gradient(135deg, rgba(30, 15, 35, 0.85) 0%, rgba(15, 5, 20, 0.98) 100%)',
    scale: 1.05,
    y: 0,
    x: -15
  },
  {
    title: 'باندل ویژه Fortnite',
    subtitle: 'اسکین لجندری + ۲۰۰۰ وی‌باکس',
    price: '۴,۵۰۰,۰۰۰',
    img: '/images/games/fortnite-character.png',
    bgImg: 'url(/images/games/fortnite-background.png)',
    bgGrad: 'linear-gradient(135deg, rgba(20, 30, 80, 0.85) 0%, rgba(5, 10, 30, 0.98) 100%)',
    scale: 1.1,
    y: 0,
    x: 0
  }
];

const TABS = ['همه', 'فورتنایت', 'ولورانت', 'ایپکس لجندز', 'پرمیوم'];

const PRODUCTS = [
  { id: '1', title: 'Elden Crown', subtitle: 'نسخه دلوکس', price: 2950000, originalPrice: 3450000, badges: ['پرفروش'], rating: 4.9, image: '/images/products/p-game-1.jpg', type: 'پرمیوم', platform: 'پی‌سی', genre: 'نقش‌آفرینی', popularity: 100 },
  { id: '2', title: 'Red Frontier', subtitle: 'بسته پرمیوم', price: 2500000, originalPrice: 4000000, badges: ['تخفیف'], rating: 4.6, image: '/images/products/p-game-3.jpg', type: 'پرمیوم', platform: 'پلی‌استیشن', genre: 'ماجراجویی', popularity: 95 },
  { id: '3', title: 'هدست تایتان پرو', subtitle: '۷.۱ فراگیر · بی‌سیم', price: 7450000, originalPrice: 9000000, badges: ['تخفیف', 'پرفروش'], rating: 4.7, image: '/images/products/p-headset.jpg', type: 'ایپکس لجندز', platform: 'پی‌سی', genre: '', popularity: 90 },
  { id: '4', title: 'کیبورد تایتان K60', subtitle: '۶۰٪ · هات‌سواپ · RGB', price: 5950000, originalPrice: undefined, badges: [], rating: 4.8, image: '/images/products/p-keyboard.jpg', type: 'ولورانت', platform: 'پی‌سی', genre: '', popularity: 88 },
  { id: '5', title: 'موس تایتان M40', subtitle: '۱۶۰۰۰ DPI · بی‌سیم', price: 3450000, originalPrice: undefined, badges: ['جدید'], rating: 4.5, image: '/images/products/p-mouse.jpg', type: 'فورتنایت', platform: 'پی‌سی', genre: '', popularity: 80 },
  { id: '6', title: 'گیفت کارت تایتان', subtitle: '۵۰ دلار اعتبار', price: 2500000, originalPrice: undefined, badges: [], rating: 5.0, image: '/images/products/p-controller.jpg', type: 'پرمیوم', platform: '', genre: '', popularity: 110 },
];

function StorePageContent() {
  const { addToCart } = useAppContext();
  const searchParams = useSearchParams();
  const cat = searchParams.get('category');

  const [activeTab, setActiveTab] = useState(cat && TABS.includes(cat) ? cat : 'همه');
  const [tabIndStyle, setTabIndStyle] = useState({});
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (cat && TABS.includes(cat)) {
      setActiveTab(cat);
    }
  }, [cat]);

  const [priceMax, setPriceMax] = useState(10000000);
  const [priceOpen, setPriceOpen] = useState(false);

  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('محبوبیت');

  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});


  // Tab indicator effect
  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      setTabIndStyle({
        transform: `translateX(${el.offsetLeft}px)`,
        width: `${el.offsetWidth}px`
      });
    }
  }, [activeTab]);


  const toggleWishlist = (id: string) => {
    setWishlist(w => ({ ...w, [id]: !w[id] }));
  };

  // Promo Carousel
  const [mainPromoIdx, setMainPromoIdx] = useState(0);
  const [mainPromoHover, setMainPromoHover] = useState(false);
  useEffect(() => {
    if (mainPromoHover) return;
    const t = setInterval(() => {
      setMainPromoIdx(i => (i + 1) % 2);
    }, 6000);
    return () => clearInterval(t);
  }, [mainPromoHover]);

  const [promoIdx, setPromoIdx] = useState(0);
  const [promoHover, setPromoHover] = useState(false);
  useEffect(() => {
    if (promoHover) return;
    const t = setInterval(() => {
      setPromoIdx(i => (i + 1) % 2);
    }, 5000);
    return () => clearInterval(t);
  }, [promoHover]);

  const [timeLeft, setTimeLeft] = useState(2 * 3600 + 12 * 60 + 58);
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(l => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Mouse tracking for parallax and spot hover effects
  useEffect(() => {
    const handlePointerMove = (e: Event) => {
      const pe = e as PointerEvent;
      const promo = pe.currentTarget as HTMLElement;
      const rect = promo.getBoundingClientRect();
      const x = pe.clientX - rect.left;
      const y = pe.clientY - rect.top;

      // Center-relative percentages (-1 to 1)
      const px = (x / rect.width) * 2 - 1;
      const py = (y / rect.height) * 2 - 1;

      promo.style.setProperty('--px', px.toString());
      promo.style.setProperty('--py', py.toString());
      promo.style.setProperty('--mx', x + 'px');
      promo.style.setProperty('--my', y + 'px');
    };

    const handlePointerLeave = (e: Event) => {
      const promo = e.currentTarget as HTMLElement;
      promo.style.setProperty('--px', '0');
      promo.style.setProperty('--py', '0');
      promo.style.setProperty('--mx', '50%');
      promo.style.setProperty('--my', '50%');
    };

    const promos = document.querySelectorAll('.store-promo');
    promos.forEach(promo => {
      promo.addEventListener('pointermove', handlePointerMove, { passive: true });
      promo.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    });

    return () => {
      promos.forEach(promo => {
        promo.removeEventListener('pointermove', handlePointerMove);
        promo.removeEventListener('pointerleave', handlePointerLeave);
      });
    };
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sc = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sc}`;
  };

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let p = [...PRODUCTS];
    if (activeTab !== 'همه') p = p.filter(x => x.type === activeTab);
    p = p.filter(x => x.price <= priceMax);

    if (sortBy === 'قیمت: کم به زیاد') p.sort((a, b) => a.price - b.price);
    else if (sortBy === 'قیمت: زیاد به کم') p.sort((a, b) => b.price - a.price);
    else if (sortBy === 'محبوبیت') p.sort((a, b) => b.popularity - a.popularity);

    return p;
  }, [activeTab, priceMax, sortBy]);


  // Pointer parallax shell variables are managed globally by titan.js

  return (
    <>
      <div className="store-content reveal" style={{ '--d': 2 } as any}>
        {/* Category + Sort Row */}
        <div className="store-cat-row">
          <div className="store-tabs">
            <span className="store-tab-ind" style={tabIndStyle}></span>
            {TABS.map(tab => {
              const tabImages: Record<string, string> = {
                'فورتنایت': '/images/categories/fortnite.png',
                'ولورانت': '/images/categories/valorant.png',
                'ایپکس لجندز': '/images/categories/apex.png',
                'پرمیوم': '/images/categories/premium.png',
              };
              return (
                <button
                  key={tab}
                  ref={el => { tabRefs.current[tab] = el; }}
                  className={`store-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    marginRight: tab === 'پرمیوم' ? '-15px' : '0'
                  }}
                >
                  {tabImages[tab] && (
                    <img
                      src={tabImages[tab]}
                      alt={tab}
                      style={{
                        width: tab === 'پرمیوم' ? '34px' : '32px',
                        height: tab === 'پرمیوم' ? '34px' : '32px',
                        objectFit: 'contain'
                      }}
                    />
                  )}
                  {tab}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="store-sort">
              <button className="store-sort-btn" onClick={() => { setPriceOpen(!priceOpen); setSortOpen(false); }}>
                <Icon name="sliders" /> قیمت تا: {priceMax === 0 ? '۰' : priceMax.toLocaleString('fa-IR')} تومان <Icon name="chev" className="sort-chev" style={{ transform: priceOpen ? 'rotate(-90deg)' : 'none', transition: 'transform 0.3s var(--spring)' }} />
              </button>
              {priceOpen && (
                <div className="store-sort-drop" style={{ minWidth: '260px', padding: '24px 16px', zIndex: 101 }}>
                  <div className="sf-range-wrap" dir="ltr">
                    <input type="range" min="0" max="10000000" step="100000" value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} className="sf-range" />
                    <div className="sf-range-track" style={{ width: `${(priceMax / 10000000) * 100}%` }}></div>
                    <div className="sf-range-pill" style={{ left: `${(priceMax / 10000000) * 100}%`, transform: `translate(-${(priceMax / 10000000) * 100}%, -50%)` }} dir="rtl">
                      <svg width="6" height="12" viewBox="0 0 6 12" fill="currentColor" style={{ opacity: 0.5, marginRight: '-2px', marginLeft: '6px' }}>
                        <circle cx="2" cy="2" r="1" /><circle cx="2" cy="6" r="1" /><circle cx="2" cy="10" r="1" />
                        <circle cx="5" cy="2" r="1" /><circle cx="5" cy="6" r="1" /><circle cx="5" cy="10" r="1" />
                      </svg>
                      <input
                        type="text"
                        value={priceMax === 0 ? '۰' : priceMax.toLocaleString('fa-IR')}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()).replace(/\D/g, '');
                          let num = Number(val);
                          if (num > 10000000) num = 10000000;
                          setPriceMax(num);
                        }}
                        className="sf-pill-input"
                        dir="ltr"
                      />
                      <span>تومان</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="store-sort">
              <button className="store-sort-btn" onClick={() => { setSortOpen(!sortOpen); setPriceOpen(false); }}>
                <Icon name="arrow" className="sort-icon-rev" style={{ transform: sortBy === 'قیمت: کم به زیاد' ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.3s var(--spring)' }} /> مرتب‌سازی: {sortBy} <Icon name="chev" className="sort-chev" style={{ transform: sortOpen ? 'rotate(-90deg)' : 'none', transition: 'transform 0.3s var(--spring)' }} />
              </button>
              {sortOpen && (
                <div className="store-sort-drop">
                  {['محبوبیت', 'قیمت: کم به زیاد', 'قیمت: زیاد به کم', 'جدیدترین'].map(s => (
                    <button key={s} onClick={() => { setSortBy(s); setSortOpen(false); }}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Promo Banners */}
        <div className="store-promos reveal" style={{ '--d': 3 } as any}>
          <article
            className="store-promo main-promo spot"
            onPointerEnter={() => setMainPromoHover(true)}
            onPointerLeave={() => setMainPromoHover(false)}
          >
            <div className="sp-bg discount-bg"></div>
            <img src="/images/discount.png" alt="Discount Background" className="sp-discount-overlay" />

            {DISCOUNT_PROMOS.map((promo, idx) => (
              <div key={idx} className={`promo-slide-layer ${mainPromoIdx === idx ? 'active' : ''}`}>
                <div className="sp-content">
                  <div className="sp-badges">
                    <span className="sp-badge live-red"><Icon name="flame" /> <span className="live-badge-text">پیشنهاد ویژه</span></span>
                    <span className="sp-badge dark"><Icon name="clock" /> پایان در {formatTime(timeLeft)}</span>
                    <span className="sp-badge" style={{ background: '#ffeb3b', color: '#000' }}>{promo.discount} تخفیف</span>
                  </div>
                  <h2>{promo.title}</h2>
                  <p>{promo.subtitle}</p>
                  <div className="sp-foot">
                    <button className="sp-btn" onClick={() => addToCart(promo.title)}>
                      مشاهده محصول
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '16px' }}>
                      <span className="sp-strike">{promo.oldPrice} تومان</span>
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{promo.price} تومان</span>
                    </div>
                  </div>
                </div>
                <div className="sp-art-wrap">
                  <img src={promo.img} alt="" className="sp-art discount-art" style={{
                    transform: `translate(calc(var(--px) * 10px), calc(var(--py) * 10px)) scale(${promo.scale}) translateY(${promo.y}px)`
                  }} />
                </div>
              </div>
            ))}

            <div className="sp-dots">
              {DISCOUNT_PROMOS.map((_, i) => (
                <button key={i} className={`sp-dot ${mainPromoIdx === i ? 'active' : ''}`} onClick={() => setMainPromoIdx(i)}>
                  <span><i></i></span>
                </button>
              ))}
            </div>
          </article>

          <article
            className="store-promo side-promo spot"
            onPointerEnter={() => setPromoHover(true)}
            onPointerLeave={() => setPromoHover(false)}
          >
            {BESTSELLER_PROMOS.map((promo, idx) => (
              <div key={idx} className={`promo-slide-layer ${promoIdx === idx ? 'active' : ''}`}>
                <div className="sp-bg side-bg" style={{
                  backgroundImage: `${promo.bgGrad}, ${promo.bgImg}`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}></div>

                <div className="sp-content side-content">
                  <div className="sp-badges">
                    <span className="sp-badge cream"><Icon name="trophy" /> پرفروش‌ها</span>
                  </div>
                  <h3>{promo.title}</h3>
                  <p className="side-subtitle">{promo.subtitle}</p>
                  <div className="sp-foot">
                    <Link href="/product/1" className="sp-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      مشاهده محصول
                    </Link>
                    <div style={{ marginRight: '4px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{promo.price} تومان</span>
                    </div>
                  </div>
                </div>
                <div className="sp-art-wrap side-art-wrap">
                  <img src={promo.img} alt="" className="sp-art" style={{
                    transform: `translate(calc(var(--px) * 10px + ${promo.x}px), calc(var(--py) * 10px + ${promo.y}px)) scale(${promo.scale})`
                  }} />
                </div>
              </div>
            ))}

            <div className="sp-dots">
              {BESTSELLER_PROMOS.map((_, i) => (
                <button key={i} className={`sp-dot ${promoIdx === i ? 'active' : ''}`} onClick={() => setPromoIdx(i)}>
                  <span><i></i></span>
                </button>
              ))}
            </div>
          </article>
        </div>

        {/* All Products */}
        <div className="store-sec-h">
          <div className="store-sec-l">
            <h3>همه محصولات</h3>
          </div>
        </div>

        <div className="store-grid">
          {filteredProducts.map((p, i) => (
            <article key={p.id} className="sg-card spot reveal" style={{ '--d': i + 3 } as any}>
              {p.image === 'gift' ? (
                <div className="sg-art gift">
                  <div className="sg-gift-icon"><Icon name="gift" /></div>
                </div>
              ) : (
                <div className="sg-art">
                  <img src={p.image} alt={p.title} />
                </div>
              )}

              <div className="sg-badges-top">
                <div className="sg-b-left">
                  {p.badges && p.badges.map(b => (
                    <span key={b} className={`sg-badge ${b === 'پرفروش' ? 'cream' : b === 'تخفیف' ? 'red' : 'dark'}`}>
                      {b === 'تخفیف' && <Icon name="flame" />}
                      {b === 'پرفروش' && <Icon name="trophy" />}
                      {b}
                    </span>
                  ))}
                  <span className="sg-badge dark star"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg> {p.rating}</span>
                </div>
              </div>

              <div className="sg-body">
                <span className="sg-sub">{p.subtitle}</span>
                <h4>{p.title}</h4>
                <div className="sg-price-row">
                  <span className="sg-price">{p.price.toLocaleString('fa-IR')} تومان</span>
                  {p.originalPrice && <span className="sg-old-price">{p.originalPrice.toLocaleString('fa-IR')}</span>}
                </div>
              </div>

              <div className="sg-actions">
                <Link href={`/product/${p.id}`} className="sg-view-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>مشاهده محصول</Link>
                <button className={`sg-heart ${wishlist[p.id] ? 'active' : ''}`} onClick={() => toggleWishlist(p.id)}>
                  <Icon name="heart" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length > 0 && (
          <div className="store-load-wrap reveal" style={{ '--d': filteredProducts.length + 3 } as any}>
            <button className="store-load-btn">بارگذاری بیشتر <Icon name="chev" /></button>
          </div>
        )}
        {filteredProducts.length === 0 && (
          <div className="store-empty">هیچ محصولی با فیلترهای شما مطابقت ندارد.</div>
        )}

      </div>
    </>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center', color: 'white' }}>در حال بارگذاری فروشگاه...</div>}>
      <StorePageContent />
    </Suspense>
  );
}
