import { clearLinks } from '../../utils/storyblok'
import { defineEventHandler } from '#imports'

export default defineEventHandler(async () => {
  // Clear cache Nitro
  const cacheStorage = useStorage('cache:storyblok:_')
  const cachedKeys = await cacheStorage.getKeys()
  let promiseArr = []
  for (var i in cachedKeys) promiseArr.push(cacheStorage.removeItem(cachedKeys[i]))
  await Promise.all(promiseArr)

  await clearLinks()

  return true
})
