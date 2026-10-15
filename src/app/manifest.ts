import type { MetadataRoute } from 'next';
import { SITE_NAME, SITE_DEFAULT_DESCRIPTION } from '@/lib/siteConfig';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'تایتان | پلتفرم گیمینگ و اسپورت',
    short_name: SITE_NAME,
    description: SITE_DEFAULT_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#0e0b16',
    theme_color: '#2a0b12',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icons/home.webp',
        sizes: '192x192',
        type: 'image/webp',
      },
      {
        src: '/titan-logo.webp',
        sizes: '512x512',
        type: 'image/webp',
      },
    ],
  };
}

