import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/siteConfig';

export default function robots(): MetadataRoute.Robots {
  const isNonProdEnv =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
    process.env.NEXT_PUBLIC_NOINDEX === 'true';

  if (isNonProdEnv) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/manage-titan/',
          '/dashboard/',
          '/desk/',
          '/cart',
          '/cart/',
          '/checkout',
          '/checkout/',
          '/payment/',
          '/invite/',
          '/login',
          '/api/',
          '/*?*ordering=',
          '/*?*sort=',
          '/*?*price_min=',
          '/*?*price_max=',
          '/*?*search=',
          '/*?*q=',
          '/*?*utm_',
          '/*?*fbclid=',
          '/*?*gclid=',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
