import { request } from '../../utils/storyblok'
import { storyblokCacheKey } from '../../utils/cacheKey'
import { defineCachedEventHandler, getQuery, setHeader, useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()
const { cache } = config.gothamstoryblok

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  setHeader(event, 'x-origin-url', event.node.req.url)
  return await request(query)
}, {
  maxAge: cache.expire,
  group: 'storyblok',
  getKey: storyblokCacheKey('request'),
  shouldBypassCache: (e) => {
    const query = getQuery(e)
    return query.isEditor === 'true' || query.isEditor === true
  },
})
