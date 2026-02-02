import { storyblokInit, apiPlugin } from '@storyblok/js'
import { defineCachedEventHandler, useRuntimeConfig, getQuery } from '#imports'

const config = useRuntimeConfig()
const { stoyblok, cache } = config.gothamstoryblok
const { version, key } = stoyblok
const { storyblokApi } = storyblokInit({
  accessToken: key,
  use: [apiPlugin],
})
export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  delete query.sbToken
  const params = {
    ...query,
    version,
  }
  storyblokApi.flushCache()
  const { data: { stories } } = await storyblokApi.get('cdn/stories', params)

  return stories
}, {
  maxAge: cache.expire,
  group: 'storyblok',
  shouldInvalidateCache: async (e) => {
    const query = getQuery(e)
    const bypass = query.sbToken != undefined
    console.log('bypass', bypass)
    if (bypass) {
      storyblokApi.flushCache()
      await $fetch('/api/storyblok/clearCache')
    }
    return bypass
  },
})
