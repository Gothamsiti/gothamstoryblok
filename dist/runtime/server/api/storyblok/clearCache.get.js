import { clearLinks } from '../../utils/storyblok.js'
import { purgeCloudflareCache } from '../../utils/cloudflare.js'
import { defineEventHandler, useRuntimeConfig, getQuery, useStorage } from '#imports'

const foundSlugInBody = (body, slug) => {
  if (body?.full_slug && body?.full_slug == slug) return true
  if (!body?.full_slug && Array.isArray(body)) {
    const filtered = body.filter(e => e.full_slug == slug || e.full_slug == slug + '/')
    return filtered.length > 0
  }
  const stringbody = JSON.stringify(body)
  if (stringbody.includes(slug)) return true
  return false
}

export default defineEventHandler(async (event) => {
  // Clear cache Nitro
  const config = useRuntimeConfig()
  const { zoneID, apiKey } = config?.gothamstoryblok?.cloudflare || {}
  const query = getQuery(event)
  const { fullSlug, language, itemId } = query
  const cacheStorage = useStorage('cache:storyblok:_')
  let cachedKeys = []
  const endpoint = language && language != config.defaultLanguage ? `${language}/${fullSlug}` : fullSlug
  console.log('Clear cache Nitro - endpoint', endpoint)
  try {
    cachedKeys = await cacheStorage.getKeys()
  }
  catch (error) {
    console.log('cannot read nitro cache keys in this runtime', error)
  }
  if (itemId) {
    console.log('ITEM ID', itemId)
    try {
      return await cacheStorage.removeItem(itemId)
    }
    catch (error) {
      console.log('cannot clear nitro cache item', error)
      return { internalCache: false, reason: 'cache-storage-unavailable' }
    }
  }
  // ho rimosso il push nell'array del promise all perché per qualche ragione non svuotava correttamente in locale.
  // così è più lento ma funziona.
  for (var i in cachedKeys) {
    if (fullSlug) {
      const stored = await cacheStorage.getItem(cachedKeys[i])
      const toclear = foundSlugInBody(stored?.value?.body, endpoint)
      if (toclear) {
        console.log('clerearing', cachedKeys[i])
        try {
          await cacheStorage.removeItem(cachedKeys[i])
        }
        catch (error) {
          console.log('cannot clear nitro cache key', cachedKeys[i], error)
        }
      }
    }
    else {
      try {
        await cacheStorage.removeItem(cachedKeys[i])
      }
      catch (error) {
        console.log('cannot clear nitro cache key', cachedKeys[i], error)
      }
    }
  }
  console.log('Cleared cache Nitro - endpoint', endpoint)
  try {
    await clearLinks()
  }
  catch (error) {
    console.log('cannot clear links cache', error)
  }

  const cloudflareResponse = await purgeCloudflareCache();
  
  return { internalCache: true, cloudflareResponse }
})
