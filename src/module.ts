import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineNuxtModule, addPlugin, createResolver, addServerHandler, addImportsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

// Module options TypeScript interface definition
interface IubendaOptions {
  widgetId: undefined | string
}
interface CloudFlareOptions {
  zoneID: string | undefined
  apiKey: string | undefined
}
interface AnalyticsOptions {
  trackingId: string | undefined
  apiSecret: string | undefined
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
  analytics: AnalyticsOptions | undefined
  cloudflare: CloudFlareOptions | undefined
  iubenda: IubendaOptions | undefined
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
  addPlugin(resolver.resolve('./runtime/plugins/01.setupLanguages'))
  addPlugin(resolver.resolve('./runtime/plugins/02.utils'))
  addPlugin(resolver.resolve('./runtime/plugins/03.labels'))
  addPlugin(resolver.resolve('./runtime/plugins/04.images'))
  addPlugin(resolver.resolve('./runtime/plugins/05.datasources'))
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
  setup(_options, _nuxt) {
    _nuxt.options.runtimeConfig.gothamstoryblok = { ..._options }
    _nuxt.options.runtimeConfig.public.gothamstoryblok = { storyblok: { version: _options.storyblok?.version || 'draft' } }
    const resolver = createResolver(import.meta.url)
    addPlugins(resolver)
    addServerRoutes(resolver)
    addServerHandler({
      route: '/api/sitemap',
      handler: resolver.resolve('./runtime/server/api/sitemap.js'),
    })
    addComposables(resolver)
  },
})
