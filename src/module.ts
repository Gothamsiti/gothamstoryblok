import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineNuxtModule, addPlugin, createResolver, addServerHandler, addImportsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

// Module options TypeScript interface definition
interface CloudFlareOptions {
  zoneID: string | undefined
  apiKey: string | undefined
}
interface CacheOptions {
  expire: number
}
interface StoryblokOptions {
  version: 'draft' | 'published' | undefined
  key?: string | undefined
}
interface SitemapOptions {
  excludeFromSitemap?: string[]
}
export interface ModuleOptions {
  cache: CacheOptions
  sitemap?: SitemapOptions | undefined
  storyblok: StoryblokOptions | undefined
  cloudflare: CloudFlareOptions | undefined
}
const currentDir = dirname(fileURLToPath(import.meta.url))

const addServerRoutes = (resolver: Resolver) => {
  // tutto quello che segue è stato fatto perche le dynamic route come da documentazione non funzionano.
  const basePath = '/api/storyblok'
  const sourcePath = './runtime/server/api/storyblok'
  const targetDir = join(currentDir, sourcePath)
  const files = readdirSync(targetDir)
  const cleanedFiles = files.filter(e => e.includes('.js') || e.includes('.ts')).map(e => e.replace('.js', '').replace('.ts', ''))
  cleanedFiles.forEach((handler) => {
    const [route, method] = handler.split('.')
    addServerHandler({
      route: `${basePath}/${route}`,
      handler: resolver.resolve(`${sourcePath}/${route}.${method}`),
    })
  })
}
const addPlugins = (resolver: Resolver) => {
  addPlugin(resolver.resolve('./runtime/plugins/utils'))
  addPlugin(resolver.resolve('./runtime/plugins/labels'))
  addPlugin(resolver.resolve('./runtime/plugins/images'))
  addPlugin(resolver.resolve('./runtime/plugins/datasources'))
}
const addComposables = (resolver: Resolver) => {
  addImportsDir(resolver.resolve('runtime/composables'))
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'gothamstoryblok',
    configKey: 'gothamstoryblok',
  },
  defaults: {
    cache: {
      expire: 1,
    },
    sitemap: {
      excludeFromSitemap: ['system'],
    },
    storyblok: {
      version: 'draft',
    },
  },
  moduleDependencies: {
    // https://github.com/cernymatej/nuxt/blob/main/docs/3.guide/4.modules/2.module-anatomy.md
    // https://github.com/cernymatej/nuxt/blob/04347e0ca74e85c27ceb86d81a74eef80b41725a/docs/3.guide/4.modules/4.module-dependencies.md
    gothamutils: {
      defaults: {
        multiLang: false,
        analytics: undefined,
        iubenda: undefined
      }
    }
  },
  setup(_options, _nuxt) {
    _nuxt.options.runtimeConfig.gothamstoryblok = { ..._options }
    _nuxt.options.runtimeConfig.public.gothamstoryblok = { storyblok: { version: _options.storyblok?.version || 'draft' } }
    const resolver = createResolver(import.meta.url)

    addServerRoutes(resolver)
    addServerHandler({
      route: '/api/sitemap',
      handler: resolver.resolve('./runtime/server/api/sitemap.js'),
    })
    addComposables(resolver)
    addPlugins(resolver)
  },
})
