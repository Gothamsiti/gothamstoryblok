export default defineNuxtConfig({
  modules: [
    '../src/module',
  ],
  runtimeConfig: {
    defaultLanguage: 'it',
  },
  gothamstoryblok: {
    storyblok: {
      version: process.env.STORYBLOK_VERSION as 'draft' | 'published',
      key: process.env.STORYBLOK_API_KEY,
    },
    analytics: {
      trackingId: process.env.ANALYTICS_ID,
      apiSecret: process.env.ANALYTICS_API_SECRET,
    },
    cloudflare: {
      zoneID: process.env.CLOUDFLARE_ZONE_ID,
      apiKey: process.env.CLOUDFLARE_API_KEY,
    },
    sitemap: {
      excludeFromSitemap: ['system', 'collections', 'references'],
    },
  },
})
