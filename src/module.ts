import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineNuxtModule, addPlugin, createResolver, addServerHandler, addImportsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  expire: number
  version: 'draft' | 'published'
  key: string
  analyticsID: string | undefined
  analyticsApiSecret: string | undefined
  cloudflare: {
    zoneID: string | undefined
    email: string | undefined
    apiKey: string | undefined
  }
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
    expire: 1,
    version: 'draft',
    key: '',
    analyticsID: undefined,
    analyticsApiSecret: undefined,
    cloudflare: {
      zoneID: undefined,
      email: undefined,
      apiKey: undefined,
    },
  },
  setup(_options, _nuxt) {
    _nuxt.options.runtimeConfig.gothamstoryblok = { ..._options }
    const resolver = createResolver(import.meta.url)
    addPlugins(resolver)
    addServerRoutes(resolver)
    addComposables(resolver)
  },
})
