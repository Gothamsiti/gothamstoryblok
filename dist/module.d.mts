import * as _nuxt_schema from '@nuxt/schema';

interface ModuleOptions {
    expire: number;
    version: 'draft' | 'published';
    key: string;
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

export { _default as default };
export type { ModuleOptions };
