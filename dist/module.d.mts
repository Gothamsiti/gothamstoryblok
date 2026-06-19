import * as _nuxt_schema from '@nuxt/schema';

interface CloudFlareOptions {
    zoneID: string | undefined;
    apiKey: string | undefined;
}
interface CacheOptions {
    expire: number;
}
interface StoryblokOptions {
    version: 'draft' | 'published' | undefined;
    key?: string | undefined;
}
interface SitemapOptions {
    excludeFromSitemap?: string[];
}
interface ModuleOptions {
    cache: CacheOptions;
    sitemap?: SitemapOptions | undefined;
    storyblok: StoryblokOptions | undefined;
    cloudflare: CloudFlareOptions | undefined;
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

export { _default as default };
export type { ModuleOptions };
