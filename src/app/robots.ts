import type { MetadataRoute } from 'next';
import { SITE_URL, IS_STAGING_ENV } from '@/lib/siteConfig';

export default function robots(): MetadataRoute.Robots {
  const isNonProdEnv = IS_STAGING_ENV;

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
