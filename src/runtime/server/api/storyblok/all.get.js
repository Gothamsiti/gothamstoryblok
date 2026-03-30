import { getAll } from '../../utils/storyblok'
import { defineCachedEventHandler, getQuery, setHeader, useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()
const { cache } = config.gothamstoryblok

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  setHeader(event, 'x-origin-url', event.node.req.url)
  return await getAll(query)
}, {
  maxAge: cache.expire,
  group: 'storyblok',
  shouldInvalidateCache: (e) => {
    const query = getQuery(e)
    const bypass = query.sbToken != undefined
    return bypass
  },
})
