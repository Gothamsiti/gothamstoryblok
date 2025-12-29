import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineNuxtModule, addPlugin, createResolver, addServerHandler } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {}
const currentDir = dirname(fileURLToPath(import.meta.url))


const addServerRoutes = (resolver : any) => {
    // tutto quello che segue è stato fatto perche le dynamic route come da documentazione non funzionano.
    const basePath = '/api/storyblok';
    const sourcePath = './runtime/server/api/storyblok';
    const targetDir = join(currentDir,sourcePath)
    const files = readdirSync(targetDir);
    const cleanedFiles = files.filter(e => e.includes(".js") || e.includes(".ts")).map(e => e.replace(".js","").replace(".ts",""));
    console.log(cleanedFiles);
    cleanedFiles.forEach(handler => {
      const [route,method] = handler.split(".");
      addServerHandler({ 
        route: `${basePath}/${route}`, 
        handler: resolver.resolve(`${sourcePath}/${route}.${method}`), 
      });
    })
}
const addPlugins = (resolver:any) => {
    addPlugin(resolver.resolve('./runtime/plugins/test'));
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'gothamstoryblok',
    configKey: 'gothamstoryblok',
  },
  defaults: {
    expire : 1,
    version : 'draft',
    key : ''
  },
  setup(_options, _nuxt) {
    _nuxt.options.runtimeConfig.gothamstoryblok = {..._options};
    const resolver = createResolver(import.meta.url)
    addServerRoutes(resolver);
  },
})
