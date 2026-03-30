import { space } from '../../utils/storyblok'
import { defineCachedEventHandler, getQuery, useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()
const { cache } = config.gothamstoryblok

export default defineCachedEventHandler(async () => {
  return await space()
}, {
  maxAge: cache.expire,
  group: 'storyblok',
  shouldInvalidateCache: (e) => {
    const query = getQuery(e)
    const bypass = query.sbToken != undefined
    return bypass
  },
})
