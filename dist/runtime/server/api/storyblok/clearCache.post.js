import { clearLinks } from '../../utils/storyblok.js'
import { defineEventHandler } from '#imports'
import { useStorage } from '#app'

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
