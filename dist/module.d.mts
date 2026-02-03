import * as _nuxt_schema from '@nuxt/schema';

interface IubendaOptions {
    widgetId: undefined | string;
}
interface CloudFlareOptions {
    zoneID: string | undefined;
    apiKey: string | undefined;
}
interface AnalyticsOptions {
    trackingId: string | undefined;
    apiSecret: string | undefined;
}
interface CacheOptions {
    expire: number;
}
interface StoryblokOptions {
    version: 'draft' | 'published' | undefined;
    key?: string | undefined;
}
interface ModuleOptions {
    cache: CacheOptions;
    storyblok: StoryblokOptions | undefined;
    analytics: AnalyticsOptions | undefined;
    cloudflare: CloudFlareOptions | undefined;
    iubenda: IubendaOptions | undefined;
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

export { _default as default };
export type { ModuleOptions };
