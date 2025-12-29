import { clearLinks } from '../../utils/storyblok.js'
import { defineEventHandler, useStorage } from '#imports'

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
