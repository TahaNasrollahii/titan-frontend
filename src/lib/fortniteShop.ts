/* eslint-disable @typescript-eslint/no-explicit-any */
export type ShopFilterCategory =
  | 'all'
  | 'bundle'
  | 'outfit'
  | 'emote'
  | 'pickaxe'
  | 'backpack'
  | 'glider'
  | 'wrap'
  | 'track'
  | 'car'
  | 'instrument'
  | 'other';

export interface ShopBundleItem {
  id: string;
  name: string;
  typeEn: string;
  typeFa: string;
  rarityKey: string;
  rarityColor: string;
  image: string | null;
}

/** Tile colours from the in-game shop layout (fortnite-api `colors`). */
export interface ShopCardColors {
  primary: string;
  secondary: string | null;
  accent: string | null;
  plate: string | null;
}

export interface ShopEntry {
  id: string;
  name: string;
  description: string | null;
  image: string;
  category: Exclude<ShopFilterCategory, 'all'>;
  typeEn: string;
  typeFa: string;
  rarityKey: string;
  rarityEn: string;
  rarityFa: string;
  rarityColor: string;
  cardBgColor: string | null;
  cardColors: ShopCardColors | null;
  regularPrice: number;
  finalPrice: number;
  discountAmount: number;
  discountPercent: number;
  banner: string | null;
  isBundle: boolean;
  bundleItems: ShopBundleItem[];
  giftable: boolean;
  inDate: string | null;
  outDate: string | null;
  tileSize: string | null;
  sectionName?: string;
}

export interface ShopSection {
  id: string;
  name: string;
  nameFa: string | null;
  rank: number;
  index: number;
  entries: ShopEntry[];
}

export interface FortniteShopData {
  date: string;
  resetsAt: string;
  vbuckIcon: string;
  source: 'fortnite-api.com' | 'fn-api.cc';
  totalEntries: number;
  sections: ShopSection[];
}

const PRIMARY_SHOP_URL = 'https://fortnite-api.com/v2/shop?language=en';
const FALLBACK_SHOP_URL = 'https://prod.fn-api.cc/v1/itemshop';
const DEFAULT_VBUCK_ICON = 'https://fortnite-api.com/images/vbuck.png';

interface RarityInfo {
  en: string;
  fa: string;
  color: string;
}

const RARITY_MAP: Record<string, RarityInfo> = {
  legendary: { en: 'Legendary', fa: 'لجندری', color: '#f58b2a' },
  epic: { en: 'Epic', fa: 'اپیک', color: '#b848ff' },
  rare: { en: 'Rare', fa: 'ریر', color: '#2cc1ff' },
  uncommon: { en: 'Uncommon', fa: 'آن‌کامون', color: '#58d638' },
  common: { en: 'Common', fa: 'کامون', color: '#9aa4b2' },
  mythic: { en: 'Mythic', fa: 'میثیک', color: '#ffd43b' },
  icon: { en: 'Icon Series', fa: 'آیکون سریز', color: '#27e3e3' },
  'icon series': { en: 'Icon Series', fa: 'آیکون سریز', color: '#27e3e3' },
  gaminglegends: { en: 'Gaming Legends', fa: 'گیمینگ لجندز', color: '#7e57ff' },
  'gaming legends series': { en: 'Gaming Legends', fa: 'گیمینگ لجندز', color: '#7e57ff' },
  marvel: { en: 'Marvel Series', fa: 'مارول', color: '#e53935' },
  'marvel series': { en: 'Marvel Series', fa: 'مارول', color: '#e53935' },
  dc: { en: 'DC Series', fa: 'دی‌سی', color: '#2979ff' },
  'dc series': { en: 'DC Series', fa: 'دی‌سی', color: '#2979ff' },
  starwars: { en: 'Star Wars', fa: 'استار وارز', color: '#3b82f6' },
  'star wars series': { en: 'Star Wars', fa: 'استار وارز', color: '#3b82f6' },
  dark: { en: 'Dark Series', fa: 'دارک سریز', color: '#ec4899' },
  'dark series': { en: 'Dark Series', fa: 'دارک سریز', color: '#ec4899' },
  slurp: { en: 'Slurp Series', fa: 'اسلرپ سریز', color: '#06b6d4' },
  'slurp series': { en: 'Slurp Series', fa: 'اسلرپ سریز', color: '#06b6d4' },
  shadow: { en: 'Shadow Series', fa: 'شدو سریز', color: '#a1a1aa' },
  'shadow series': { en: 'Shadow Series', fa: 'شدو سریز', color: '#a1a1aa' },
  lava: { en: 'Lava Series', fa: 'لاوا سریز', color: '#f97316' },
  'lava series': { en: 'Lava Series', fa: 'لاوا سریز', color: '#f97316' },
  frozen: { en: 'Frozen Series', fa: 'فروزن سریز', color: '#7dd3fc' },
  'frozen series': { en: 'Frozen Series', fa: 'فروزن سریز', color: '#7dd3fc' },
};

interface TypeInfo {
  category: Exclude<ShopFilterCategory, 'all'>;
  en: string;
  fa: string;
}

const TYPE_MAP: Record<string, TypeInfo> = {
  bundle: { category: 'bundle', en: 'Bundle', fa: 'باندل' },
  outfit: { category: 'outfit', en: 'Outfit', fa: 'اسکین' },
  character: { category: 'outfit', en: 'Outfit', fa: 'اسکین' },
  athenacharacter: { category: 'outfit', en: 'Outfit', fa: 'اسکین' },
  emote: { category: 'emote', en: 'Emote', fa: 'ایموت' },
  athenadance: { category: 'emote', en: 'Emote', fa: 'ایموت' },
  pickaxe: { category: 'pickaxe', en: 'Pickaxe', fa: 'پیککس' },
  athenapickaxe: { category: 'pickaxe', en: 'Pickaxe', fa: 'پیککس' },
  backpack: { category: 'backpack', en: 'Back Bling', fa: 'بک‌بلینگ' },
  athenabackpack: { category: 'backpack', en: 'Back Bling', fa: 'بک‌بلینگ' },
  glider: { category: 'glider', en: 'Glider', fa: 'گلایدر' },
  athenaglider: { category: 'glider', en: 'Glider', fa: 'گلایدر' },
  wrap: { category: 'wrap', en: 'Wrap', fa: 'رپ' },
  athenaitemwrap: { category: 'wrap', en: 'Wrap', fa: 'رپ' },
  track: { category: 'track', en: 'Jam Track', fa: 'موزیک' },
  jamtrack: { category: 'track', en: 'Jam Track', fa: 'موزیک' },
  sparkssong: { category: 'track', en: 'Jam Track', fa: 'موزیک' },
  body: { category: 'car', en: 'Car Body', fa: 'بدنه خودرو' },
  wheel: { category: 'car', en: 'Wheels', fa: 'چرخ خودرو' },
  skin: { category: 'car', en: 'Decal', fa: 'اسکین خودرو' },
  trail: { category: 'car', en: 'Trail', fa: 'رد خودرو' },
  booster: { category: 'car', en: 'Boost', fa: 'بوست خودرو' },
  car: { category: 'car', en: 'Vehicle', fa: 'خودرو' },
  bass: { category: 'instrument', en: 'Bass', fa: 'گیتار بیس' },
  guitar: { category: 'instrument', en: 'Guitar', fa: 'گیتار' },
  drum: { category: 'instrument', en: 'Drums', fa: 'درامز' },
  drums: { category: 'instrument', en: 'Drums', fa: 'درامز' },
  mic: { category: 'instrument', en: 'Microphone', fa: 'میکروفن' },
  keyboard: { category: 'instrument', en: 'Keytar', fa: 'کیبورد' },
  instrument: { category: 'instrument', en: 'Instrument', fa: 'ساز موسیقی' },
  shoe: { category: 'other', en: 'Kicks', fa: 'کفش (Kicks)' },
  sidekick: { category: 'other', en: 'Sidekick', fa: 'همراه (Sidekick)' },
  contrail: { category: 'other', en: 'Contrail', fa: 'رد پرواز' },
  loadingscreen: { category: 'other', en: 'Loading Screen', fa: 'صفحه لودینگ' },
  music: { category: 'track', en: 'Lobby Music', fa: 'موزیک لابی' },
  spray: { category: 'other', en: 'Spray', fa: 'اسپری' },
  emoji: { category: 'other', en: 'Emoticon', fa: 'ایموجی' },
  lego: { category: 'other', en: 'LEGO Kit', fa: 'کیت لگو' },
};

const SECTION_TRANSLATIONS: Record<string, string> = {
  'featured': 'ویژه روز',
  'daily': 'آیتم‌های روزانه',
  'special offers': 'پیشنهادهای ویژه',
  'jam tracks': 'موزیک‌ها (Jam Tracks)',
  'featured & daily': 'آیتم‌های ویژه و منتخب',
  'battle royale': 'بتل رویال',
  'signature style': 'استایل اختصاصی',
  'start your engines': 'خودروها و آیتم‌های مسابقه‌ای',
  'kicks': 'کفش‌ها (Kicks)',
  'fortnite crew': 'کروپک فورتنایت',
};

export function getNextShopResetIso(nowMs = Date.now()): string {
  const now = new Date(nowMs);
  const nextReset = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0),
  );
  return nextReset.toISOString();
}

export function getSmartRevalidateSeconds(nowMs = Date.now()): number {
  const now = new Date(nowMs);
  const minutesSinceMidnightUtc = now.getUTCHours() * 60 + now.getUTCMinutes();
  // During the first 12 minutes right after 00:00 UTC reset, revalidate every 90 seconds
  // so that as soon as the upstream API indexes the new shop, our page updates automatically.
  if (minutesSinceMidnightUtc < 12) {
    return 90;
  }
  const nextResetMs = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
    0,
  );
  const secondsUntilReset = Math.max(60, Math.floor((nextResetMs - nowMs) / 1000));
  return Math.min(1800, secondsUntilReset);
}

function resolveCardColors(colors: any): ShopCardColors | null {
  const primary = normalizeHexColor(colors?.color1);
  if (!primary) return null;
  return {
    primary,
    secondary: normalizeHexColor(colors?.color2),
    accent: normalizeHexColor(colors?.color3),
    plate: normalizeHexColor(colors?.textBackgroundColor),
  };
}

function normalizeHexColor(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const cleaned = raw.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{8}$/.test(cleaned)) {
    return `#${cleaned.slice(0, 6)}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return `#${cleaned}`;
  }
  return null;
}

function resolveRarity(
  rarityValue?: string | null,
  rarityDisplay?: string | null,
  seriesValue?: string | null,
  seriesDisplay?: string | null,
  fallbackHex?: string | null,
): { key: string; en: string; fa: string; color: string } {
  const candidates = [
    seriesValue?.toLowerCase().trim(),
    seriesDisplay?.toLowerCase().trim(),
    rarityValue?.toLowerCase().trim(),
    rarityDisplay?.toLowerCase().trim(),
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    if (RARITY_MAP[c]) {
      return { key: c.replace(/\s+/g, ''), ...RARITY_MAP[c] };
    }
    if (c.includes('icon')) return { key: 'icon', ...RARITY_MAP.icon };
    if (c.includes('gaming')) return { key: 'gaminglegends', ...RARITY_MAP.gaminglegends };
    if (c.includes('marvel')) return { key: 'marvel', ...RARITY_MAP.marvel };
    if (c.includes('star wars') || c.includes('starwars')) return { key: 'starwars', ...RARITY_MAP.starwars };
    if (c.includes('dc')) return { key: 'dc', ...RARITY_MAP.dc };
    if (c.includes('dark')) return { key: 'dark', ...RARITY_MAP.dark };
    if (c.includes('slurp')) return { key: 'slurp', ...RARITY_MAP.slurp };
    if (c.includes('lava')) return { key: 'lava', ...RARITY_MAP.lava };
    if (c.includes('frozen')) return { key: 'frozen', ...RARITY_MAP.frozen };
    if (c.includes('shadow')) return { key: 'shadow', ...RARITY_MAP.shadow };
    if (c.includes('series')) {
      const label = seriesDisplay || seriesValue || rarityDisplay || 'Special Series';
      return {
        key: 'series',
        en: label,
        fa: 'سری ویژه',
        color: normalizeHexColor(fallbackHex) || '#e2a03f',
      };
    }
  }

  return {
    key: 'rare',
    en: rarityDisplay || 'Rare',
    fa: 'ریر',
    color: normalizeHexColor(fallbackHex) || '#2cc1ff',
  };
}

function resolveType(
  rawValue?: string | null,
  rawDisplay?: string | null,
  isBundle = false,
  fallbackCategory?: Exclude<ShopFilterCategory, 'all'>,
): TypeInfo {
  if (isBundle) {
    return TYPE_MAP.bundle;
  }
  const key = (rawValue || '').toLowerCase().trim();
  if (key && TYPE_MAP[key]) {
    return TYPE_MAP[key];
  }
  const displayKey = (rawDisplay || '').toLowerCase().trim();
  if (displayKey && TYPE_MAP[displayKey]) {
    return TYPE_MAP[displayKey];
  }
  if (fallbackCategory && TYPE_MAP[fallbackCategory]) {
    return TYPE_MAP[fallbackCategory];
  }
  return {
    category: fallbackCategory || 'other',
    en: rawDisplay || rawValue || 'Cosmetic',
    fa: 'آیتم تزئینی',
  };
}

function translateSectionName(name: string): string | null {
  const lower = name.trim().toLowerCase();
  if (SECTION_TRANSLATIONS[lower]) return SECTION_TRANSLATIONS[lower];
  if (lower.includes('jam track')) return 'موزیک‌ها';
  if (lower.includes('bundle')) return 'باندل‌های ویژه';
  return null;
}

function cleanDevName(devName?: string | null): string {
  if (!devName) return 'Fortnite Cosmetic';
  const cleaned = devName
    .replace(/^\[VIRTUAL\]\s*/i, '')
    .replace(/\s+for\s+-?\d+\s+MtxCurrency$/i, '')
    .replace(/^\d+\s*x\s*/i, '')
    .split(',')[0]
    .trim();
  return cleaned || 'Fortnite Cosmetic';
}

const CATEGORY_PRIORITY: Record<Exclude<ShopFilterCategory, 'all'>, number> = {
  bundle: 1,
  outfit: 2,
  emote: 3,
  pickaxe: 4,
  glider: 5,
  backpack: 6,
  wrap: 7,
  car: 8,
  instrument: 9,
  other: 10,
  track: 11,
};

export function compareShopEntries(a: ShopEntry, b: ShopEntry): number {
  const prioA = CATEGORY_PRIORITY[a.category] ?? 10;
  const prioB = CATEGORY_PRIORITY[b.category] ?? 10;
  if (prioA !== prioB) return prioA - prioB;

  // Inside bundles, prioritize bundles that include an Outfit
  if (a.category === 'bundle' && b.category === 'bundle') {
    const aHasOutfit = a.bundleItems.some(sub => sub.typeEn === 'Outfit');
    const bHasOutfit = b.bundleItems.some(sub => sub.typeEn === 'Outfit');
    if (aHasOutfit !== bHasOutfit) return aHasOutfit ? -1 : 1;
  }

  return b.finalPrice - a.finalPrice;
}

function parsePrimaryApi(json: any): FortniteShopData {
  const data = json?.data ?? {};
  const rawEntries: any[] = Array.isArray(data.entries) ? data.entries : [];
  const sectionMap = new Map<string, ShopSection>();

  for (const entry of rawEntries) {
    const brItems: any[] = Array.isArray(entry.brItems) ? entry.brItems : [];
    const cars: any[] = Array.isArray(entry.cars) ? entry.cars : [];
    const instruments: any[] = Array.isArray(entry.instruments) ? entry.instruments : [];
    const legoKits: any[] = Array.isArray(entry.legoKits) ? entry.legoKits : [];
    const tracks: any[] = Array.isArray(entry.tracks) ? entry.tracks : [];

    const allSubItems: {
      id: string;
      name: string;
      description: string | null;
      typeValue?: string;
      typeDisplay?: string;
      fallbackCategory: Exclude<ShopFilterCategory, 'all'>;
      rarityValue?: string;
      rarityDisplay?: string;
      seriesValue?: string;
      seriesDisplay?: string;
      image: string | null;
      featuredImage: string | null;
    }[] = [];

    for (const item of brItems) {
      allSubItems.push({
        id: item.id || item.name,
        name: item.name || 'Cosmetic',
        description: item.description || null,
        typeValue: item.type?.value,
        typeDisplay: item.type?.displayValue,
        fallbackCategory: 'other',
        rarityValue: item.rarity?.value,
        rarityDisplay: item.rarity?.displayValue,
        seriesValue: item.series?.value,
        seriesDisplay: item.series?.displayValue,
        image: item.images?.smallIcon || item.images?.icon || item.images?.featured || null,
        featuredImage: item.images?.featured || item.images?.icon || item.images?.smallIcon || null,
      });
    }

    for (const car of cars) {
      allSubItems.push({
        id: car.id || car.vehicleId || car.name,
        name: car.name || 'Vehicle Item',
        description: car.description || null,
        typeValue: car.type?.value || 'car',
        typeDisplay: car.type?.displayValue || 'Vehicle',
        fallbackCategory: 'car',
        rarityValue: car.rarity?.value,
        rarityDisplay: car.rarity?.displayValue,
        seriesValue: car.series?.value,
        seriesDisplay: car.series?.displayValue,
        image: car.images?.small || car.images?.large || null,
        featuredImage: car.images?.large || car.images?.small || null,
      });
    }

    for (const inst of instruments) {
      allSubItems.push({
        id: inst.id || inst.name,
        name: inst.name || 'Instrument',
        description: inst.description || null,
        typeValue: inst.type?.value || 'instrument',
        typeDisplay: inst.type?.displayValue || 'Instrument',
        fallbackCategory: 'instrument',
        rarityValue: inst.rarity?.value,
        rarityDisplay: inst.rarity?.displayValue,
        seriesValue: inst.series?.value,
        seriesDisplay: inst.series?.displayValue,
        image: inst.images?.small || inst.images?.large || null,
        featuredImage: inst.images?.large || inst.images?.small || null,
      });
    }

    for (const kit of legoKits) {
      allSubItems.push({
        id: kit.id || kit.name,
        name: kit.name || 'LEGO Kit',
        description: null,
        typeValue: kit.type?.value || 'lego',
        typeDisplay: kit.type?.displayValue || 'LEGO Kit',
        fallbackCategory: 'other',
        rarityValue: kit.rarity?.value,
        rarityDisplay: kit.rarity?.displayValue,
        seriesValue: kit.series?.value,
        seriesDisplay: kit.series?.displayValue,
        image: kit.images?.small || kit.images?.large || kit.images?.wide || null,
        featuredImage: kit.images?.large || kit.images?.wide || kit.images?.small || null,
      });
    }

    for (const track of tracks) {
      allSubItems.push({
        id: track.id || track.devName || track.title,
        name: track.title || 'Jam Track',
        description: track.artist ? `${track.artist}${track.releaseYear ? ` (${track.releaseYear})` : ''}` : null,
        typeValue: 'track',
        typeDisplay: 'Jam Track',
        fallbackCategory: 'track',
        rarityValue: 'uncommon',
        rarityDisplay: 'Jam Track',
        image: track.albumArt || null,
        featuredImage: track.albumArt || null,
      });
    }

    const primarySub = allSubItems[0];
    const renderImg = entry.newDisplayAsset?.renderImages?.[0]?.image || null;
    const bundleImg = entry.bundle?.image || null;
    const image =
      renderImg ||
      bundleImg ||
      primarySub?.featuredImage ||
      primarySub?.image ||
      allSubItems.find(s => s.featuredImage || s.image)?.featuredImage ||
      '/images/hero/characters/fortnite.webp';

    const isExplicitBundle = Boolean(entry.bundle?.name);
    const isMultiItem = allSubItems.length > 1;
    const isBundle = isExplicitBundle || isMultiItem;

    const name =
      entry.bundle?.name ||
      primarySub?.name ||
      cleanDevName(entry.devName);

    const description =
      primarySub?.description ||
      (entry.bundle?.info && entry.bundle.info !== 'Bundle' ? entry.bundle.info : null);

    const cardBgColor = normalizeHexColor(entry.colors?.color1);
    const rarity = resolveRarity(
      primarySub?.rarityValue,
      primarySub?.rarityDisplay,
      primarySub?.seriesValue,
      primarySub?.seriesDisplay,
      cardBgColor,
    );

    const resolvedType = resolveType(
      primarySub?.typeValue,
      primarySub?.typeDisplay,
      isExplicitBundle,
      primarySub?.fallbackCategory,
    );

    // Deduplicate bundle items by name+type so vehicle paint variants don't repeat 12 identical rows
    const seenSubKeys = new Set<string>();
    const bundleItems: ShopBundleItem[] = [];
    for (const sub of allSubItems) {
      const subType = resolveType(sub.typeValue, sub.typeDisplay, false, sub.fallbackCategory);
      const dedupeKey = `${sub.name.toLowerCase()}::${subType.en.toLowerCase()}`;
      if (seenSubKeys.has(dedupeKey)) continue;
      seenSubKeys.add(dedupeKey);
      const subRarity = resolveRarity(
        sub.rarityValue,
        sub.rarityDisplay,
        sub.seriesValue,
        sub.seriesDisplay,
        cardBgColor,
      );
      bundleItems.push({
        id: sub.id,
        name: sub.name,
        typeEn: subType.en,
        typeFa: subType.fa,
        rarityKey: subRarity.key,
        rarityColor: subRarity.color,
        image: sub.image || sub.featuredImage,
      });
    }

    const regularPrice = Number(entry.regularPrice ?? entry.finalPrice ?? 0);
    const finalPrice = Number(entry.finalPrice ?? regularPrice);
    const discountAmount = Math.max(0, regularPrice - finalPrice);
    const discountPercent =
      regularPrice > 0 && discountAmount > 0
        ? Math.round((discountAmount / regularPrice) * 100)
        : 0;

    const sectionId = entry.layout?.id || (entry.layoutId ? String(entry.layoutId).split('.')[0] : 'featured');
    const sectionName =
      entry.layout?.name?.trim() ||
      (sectionId === 'alc' ? 'Featured & Daily' : sectionId);
    const sectionRank = typeof entry.layout?.rank === 'number' ? entry.layout.rank : 0;
    const sectionIndex = typeof entry.layout?.index === 'number' ? entry.layout.index : 999;

    let section = sectionMap.get(sectionId);
    if (!section) {
      section = {
        id: sectionId,
        name: sectionName,
        nameFa: translateSectionName(sectionName),
        rank: sectionRank,
        index: sectionIndex,
        entries: [],
      };
      sectionMap.set(sectionId, section);
    }

    section.entries.push({
      id: entry.offerId || `${sectionId}-${section.entries.length}`,
      name,
      description,
      image,
      category: isExplicitBundle ? 'bundle' : resolvedType.category,
      typeEn: resolvedType.en,
      typeFa: resolvedType.fa,
      rarityKey: rarity.key,
      rarityEn: rarity.en,
      rarityFa: rarity.fa,
      rarityColor: rarity.color,
      cardBgColor,
      cardColors: resolveCardColors(entry.colors),
      regularPrice,
      finalPrice,
      discountAmount,
      discountPercent,
      banner: entry.banner?.value || null,
      isBundle,
      bundleItems,
      giftable: Boolean(entry.giftable),
      inDate: entry.inDate || null,
      outDate: entry.outDate || null,
      tileSize: entry.tileSize || null,
      sectionName,
    });
  }

  const sections = Array.from(sectionMap.values())
    .map(sec => ({
      ...sec,
      // Sort: 1. Bundles, 2. Outfits, 3. Other items
      entries: sec.entries.sort(compareShopEntries),
    }))
    .sort((a, b) => {
      const aIsTracks = a.name.toLowerCase().includes('jam track');
      const bIsTracks = b.name.toLowerCase().includes('jam track');
      if (aIsTracks !== bIsTracks) return aIsTracks ? 1 : -1;
      // Prioritize sections that contain bundles or outfits over sections that only have cars/tracks
      const aHasTopCosmetic = a.entries.some(e => e.category === 'bundle' || e.category === 'outfit');
      const bHasTopCosmetic = b.entries.some(e => e.category === 'bundle' || e.category === 'outfit');
      if (aHasTopCosmetic !== bHasTopCosmetic) return aHasTopCosmetic ? -1 : 1;
      if (b.rank !== a.rank) return b.rank - a.rank;
      return a.index - b.index;
    });

  const totalEntries = sections.reduce((sum, s) => sum + s.entries.length, 0);

  return {
    date: data.date || new Date().toISOString(),
    resetsAt: getNextShopResetIso(),
    vbuckIcon: data.vbuckIcon || DEFAULT_VBUCK_ICON,
    source: 'fortnite-api.com',
    totalEntries,
    sections,
  };
}

function parseFallbackApi(json: any): FortniteShopData {
  const rawEntries: any[] = Array.isArray(json?.data) ? json.data : [];
  const sectionMap = new Map<string, ShopSection>();

  for (const entry of rawEntries) {
    const items: any[] = Array.isArray(entry.items) ? entry.items : [];
    const primaryItem = items.find(i => i.images?.render || i.images?.featured || i.images?.icon) || items[0];

    const isExplicitBundle = Boolean(entry.bundle?.name) || entry.offerType === 'DynamicBundle';
    const isBundle = isExplicitBundle || items.length > 1;

    const name =
      entry.bundle?.name ||
      primaryItem?.name ||
      cleanDevName(entry.devName);

    const image =
      entry.images?.featured ||
      entry.images?.render ||
      entry.images?.icon ||
      primaryItem?.images?.render ||
      primaryItem?.images?.featured ||
      primaryItem?.images?.wide ||
      primaryItem?.images?.icon ||
      primaryItem?.images?.smallIcon ||
      '/images/hero/characters/fortnite.webp';

    const cardBgColor = normalizeHexColor(entry.colors?.color1);
    const rarity = resolveRarity(
      primaryItem?.rarity?.value,
      primaryItem?.rarity?.displayValue,
      primaryItem?.series?.value,
      primaryItem?.series?.value,
      primaryItem?.rarity?.hexColors?.[0] || cardBgColor,
    );

    const resolvedType = resolveType(
      primaryItem?.cosmeticType?.value || primaryItem?.type,
      primaryItem?.cosmeticType?.displayValue || entry.mainType,
      isExplicitBundle,
      primaryItem?.category === 'cars'
        ? 'car'
        : primaryItem?.category === 'instruments'
          ? 'instrument'
          : primaryItem?.category === 'tracks'
            ? 'track'
            : undefined,
    );

    const seenSubKeys = new Set<string>();
    const bundleItems: ShopBundleItem[] = [];
    for (const sub of items) {
      const subName = sub.name || 'Cosmetic';
      const subType = resolveType(
        sub.cosmeticType?.value || sub.type,
        sub.cosmeticType?.displayValue,
        false,
      );
      const dedupeKey = `${subName.toLowerCase()}::${subType.en.toLowerCase()}`;
      if (seenSubKeys.has(dedupeKey)) continue;
      seenSubKeys.add(dedupeKey);
      const subRarity = resolveRarity(
        sub.rarity?.value,
        sub.rarity?.displayValue,
        sub.series?.value,
        sub.series?.value,
        sub.rarity?.hexColors?.[0] || cardBgColor,
      );
      bundleItems.push({
        id: sub.id || sub.templateId || subName,
        name: subName,
        typeEn: subType.en,
        typeFa: subType.fa,
        rarityKey: subRarity.key,
        rarityColor: subRarity.color,
        image: sub.images?.smallIcon || sub.images?.icon || sub.images?.render || null,
      });
    }

    const regularPrice = Number(entry.price?.regularPrice ?? entry.price?.finalPrice ?? 0);
    const finalPrice = Number(entry.price?.finalPrice ?? regularPrice);
    const discountAmount = Math.max(0, regularPrice - finalPrice);
    const discountPercent =
      regularPrice > 0 && discountAmount > 0
        ? Math.round((discountAmount / regularPrice) * 100)
        : 0;

    const sectionId = entry.section?.id || entry.layout?.id || entry.sectionId || 'featured';
    const sectionName =
      entry.section?.name?.trim() ||
      entry.layout?.name?.trim() ||
      (sectionId === 'alc' ? 'Featured & Daily' : sectionId);
    const sectionRank = typeof entry.layout?.rank === 'number' ? entry.layout.rank : (entry.layoutRank ?? 0);
    const sectionIndex = typeof entry.layout?.index === 'number' ? entry.layout.index : 999;

    let section = sectionMap.get(sectionId);
    if (!section) {
      section = {
        id: sectionId,
        name: sectionName,
        nameFa: translateSectionName(sectionName),
        rank: sectionRank,
        index: sectionIndex,
        entries: [],
      };
      sectionMap.set(sectionId, section);
    }

    section.entries.push({
      id: entry.offerId || `${sectionId}-${section.entries.length}`,
      name,
      description: primaryItem?.description || null,
      image,
      category: isExplicitBundle ? 'bundle' : resolvedType.category,
      typeEn: resolvedType.en,
      typeFa: resolvedType.fa,
      rarityKey: rarity.key,
      rarityEn: rarity.en,
      rarityFa: rarity.fa,
      rarityColor: rarity.color,
      cardBgColor,
      cardColors: resolveCardColors(entry.colors),
      regularPrice,
      finalPrice,
      discountAmount,
      discountPercent,
      banner: entry.violatorTag || null,
      isBundle,
      bundleItems,
      giftable: Boolean(entry.giftable),
      inDate: entry.inDate || null,
      outDate: entry.outDate || null,
      tileSize: entry.tileSize || null,
      sectionName,
    });
  }

  const sections = Array.from(sectionMap.values())
    .map(sec => ({
      ...sec,
      entries: sec.entries.sort(compareShopEntries),
    }))
    .sort((a, b) => {
      const aIsTracks = a.name.toLowerCase().includes('jam track');
      const bIsTracks = b.name.toLowerCase().includes('jam track');
      if (aIsTracks !== bIsTracks) return aIsTracks ? 1 : -1;
      const aHasTopCosmetic = a.entries.some(e => e.category === 'bundle' || e.category === 'outfit');
      const bHasTopCosmetic = b.entries.some(e => e.category === 'bundle' || e.category === 'outfit');
      if (aHasTopCosmetic !== bHasTopCosmetic) return aHasTopCosmetic ? -1 : 1;
      if (b.rank !== a.rank) return b.rank - a.rank;
      return a.index - b.index;
    });

  const totalEntries = sections.reduce((sum, s) => sum + s.entries.length, 0);

  return {
    date: json?.fetchedAt || new Date().toISOString(),
    resetsAt: json?.resetsAt || getNextShopResetIso(),
    vbuckIcon: DEFAULT_VBUCK_ICON,
    source: 'fn-api.cc',
    totalEntries,
    sections,
  };
}

let memoryCache: { data: FortniteShopData; expiresAt: number } | null = null;

export async function getFortniteShop(forceFresh = false): Promise<FortniteShopData | null> {
  const now = Date.now();
  if (!forceFresh && memoryCache && memoryCache.expiresAt > now) {
    return memoryCache.data;
  }

  const revalidate = getSmartRevalidateSeconds(now);
  const fetchOptions: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = forceFresh
    ? { cache: 'no-store', signal: AbortSignal.timeout(9000) }
    : {
        next: { revalidate, tags: ['fortnite-shop'] },
        signal: AbortSignal.timeout(9000),
      };

  // 1. Try Primary API: fortnite-api.com
  try {
    const res = await fetch(PRIMARY_SHOP_URL, fetchOptions);
    if (res.ok) {
      const json = await res.json();
      const parsed = parsePrimaryApi(json);
      if (parsed.totalEntries > 0) {
        memoryCache = {
          data: parsed,
          expiresAt: Math.min(now + revalidate * 1000, new Date(parsed.resetsAt).getTime()),
        };
        return parsed;
      }
    }
  } catch {
    // Primary API failed; proceed to fallback
  }

  // 2. Fallback API: prod.fn-api.cc
  try {
    const res = await fetch(FALLBACK_SHOP_URL, fetchOptions);
    if (res.ok) {
      const json = await res.json();
      const parsed = parseFallbackApi(json);
      if (parsed.totalEntries > 0) {
        memoryCache = {
          data: parsed,
          expiresAt: Math.min(now + revalidate * 1000, new Date(parsed.resetsAt).getTime()),
        };
        return parsed;
      }
    }
  } catch {
    // Fallback API also failed
  }

  // Return last known good shop if both APIs had a temporary network failure
  if (memoryCache?.data) {
    return memoryCache.data;
  }

  return null;
}

