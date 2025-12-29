import { storyblokInit, apiPlugin } from '@storyblok/js'
import { defineCachedEventHandler } from '#imports'

const config = useRuntimeConfig()
const { storyblokApi } = storyblokInit({
  accessToken: config.gothamstoryblok.key,
  use: [apiPlugin],
})

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  delete query.sbToken
  const params = {
    ...query,
    version: config.gothamstoryblok.version,
  }
  storyblokApi.flushCache()
  const { data: { stories } } = await storyblokApi.get('cdn/stories', params)

  return stories
}, {
  maxAge: 60 * 60 * 12,
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
