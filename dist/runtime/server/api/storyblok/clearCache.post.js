import { clearLinks } from '../../utils/storyblok.js'
import { defineEventHandler, useStorage, readBody, createError } from '#imports'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { full_slug } = body
    const store = useStorage('cache:storyblok:_')
    const cachedKeys = await store.getKeys()
    await clearLinks()

    if (full_slug) {
      const foundKeys = []
      for (const key of cachedKeys) {
        const stored = await store.getItem(key)
        const found = searchInCache(stored, full_slug)

        if (found) {
          foundKeys.push(key)
          await store.removeItem(key)
        }
      }

      return { message: 'cache cleared by full_slug', found: foundKeys.length > 0, keys: foundKeys }
    }
    else {
      let promiseArr = []
      for (var i in cachedKeys) promiseArr.push(store.removeItem(cachedKeys[i]))
      await Promise.all(promiseArr)

      return { message: 'full cache cleared' }
    }
  }
  catch (error) {
    console.log(error)
    throw createError({ statusCode: 500, statusMessage: 'Error clearing cache' })
  }
})

const searchInCache = (stored, full_slug) => {
  if (!stored || !full_slug) return false

  const body = stored?.value?.body
  if (!body) return false

  if (typeof body === 'object') {
    if (body.full_slug === full_slug) return true
  }

  if (Array.isArray(body)) {
    for (const story of body) {
      if (!story) continue
      if (story.full_slug === full_slug) return true
    }
  }
}
