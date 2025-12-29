import { request } from '../../utils/storyblok'
import { defineCachedEventHandler, getQuery, setHeader } from '#imports'

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  setHeader(event, 'x-origin-url', event.node.req.url)
  return await request(query)
}, {
  maxAge: process.env.DEFAULT_EXPIRE,
  group: 'storyblok',
  shouldInvalidateCache: (e) => {
    const query = getQuery(e)
    const bypass = query.sbToken != undefined
    return bypass
  },

})
