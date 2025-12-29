import { space } from './src/server/utils/storyblok'

export default defineCachedEventHandler(async () => {
  return await space()
}, {
  maxAge: process.env.DEFAULT_EXPIRE,
  group: 'storyblok',
  shouldInvalidateCache: (e) => {
    const query = getQuery(e)
    const bypass = query.sbToken != undefined
    return bypass
  },
})
