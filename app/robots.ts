import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/demo', '/terms', '/privacy'],
        disallow: ['/dashboard', '/analyze', '/report', '/settings', '/api'],
      },
    ],
  };
}
