import { space } from '../../utils/storyblok'
import { storyblokCacheKey } from '../../utils/cacheKey'
import { defineCachedEventHandler, getQuery, useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()
const { cache } = config.gothamstoryblok

export default defineCachedEventHandler(async () => {
  return await space()
}, {
  maxAge: cache.expire,
  group: 'storyblok',
  getKey: storyblokCacheKey('space'),
  shouldBypassCache: (e) => {
    const query = getQuery(e)
    const bypass = query.isEditor == 'true' || query.isEditor === true
    return bypass
  },
})
