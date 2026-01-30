import * as _nuxt_schema from '@nuxt/schema';

interface ModuleOptions {
    expire: number;
    version: 'draft' | 'published';
    key: string;
    analyticsID: string | undefined;
    analyticsApiSecret: string | undefined;
    cloudflare: {
        zoneID: string | undefined;
        email: string | undefined;
        apiKey: string | undefined;
    };
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

export { _default as default };
export type { ModuleOptions };
