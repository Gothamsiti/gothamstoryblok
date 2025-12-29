import Cloudflare from 'cloudflare'
import { clearLinks } from '../../utils/storyblok.js'
import { defineEventHandler, useRuntimeConfig, getQuery } from '#imports'
import { useStorage } from '#app'

const { cloudflare } = useRuntimeConfig()

const { zoneID, email, apiKey } = cloudflare
let cloudFlareClient
if (apiKey && email) {
  cloudFlareClient = new Cloudflare({
    apiEmail: email,
    apiKey: apiKey,
  })
}
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
  const query = getQuery(event)
  const { fullSlug, language, itemId } = query
  const cacheStorage = useStorage('cache:storyblok:_')
  const cachedKeys = await cacheStorage.getKeys()
  const endpoint = language && language != config.defaultLanguage ? `${language}/${fullSlug}` : fullSlug
  console.log('Clear cache Nitro - endpoint', endpoint)
  if (itemId) {
    console.log('ITEM ID', itemId)
    return await cacheStorage.removeItem(itemId)
  }
  // ho rimosso il push nell'array del promise all perché per qualche ragione non svuotava correttamente in locale.
  // così è più lento ma funziona.
  for (var i in cachedKeys) {
    if (fullSlug) {
      const stored = await cacheStorage.getItem(cachedKeys[i])
      const toclear = foundSlugInBody(stored?.value?.body, endpoint)
      if (toclear) {
        console.log('clerearing', cachedKeys[i])
        await cacheStorage.removeItem(cachedKeys[i])
      }
    }
    else {
      await cacheStorage.removeItem(cachedKeys[i])
    }
  }
  console.log('Cleared cache Nitro - endpoint', endpoint)
  await clearLinks()

  if (cloudFlareClient) {
    try {
      await cloudFlareClient.cache.purge({ zone_id: zoneID, purge_everything: true })
    }
    catch (error) {
      console.log('err purge cloudflare cache', error)
    }
  }
  return true
})
