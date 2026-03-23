import { useRuntimeConfig, defineCachedEventHandler } from '#imports'

export default defineCachedEventHandler(async () => {
  const config = useRuntimeConfig()
  const { storyblok, sitemap } = config.gothamstoryblok
  const { version, key: token } = storyblok
  const { excludeFromSitemap } = sitemap || {}

  const getStories = async (page) => {
    try {
      const res = await $fetch('https://api.storyblok.com/v2/cdn/stories', {
        params: {
          token: token,
          version: version,
          per_page: 100,
          page: page || 1,
        },
      })

      const urls = res.stories
        .filter(story => story.content?.metadata?.follow !== 'nofollow')
        .map(story => story.full_slug)

      console.log('Fetching stories from Storyblok for sitemap...', page, urls.length)
      return {
        urls,
        total: res.total,
        perPage: res.per_page,
      }
    }
    catch (err) {
      console.error('Error fetching stories:', err)
      return { urls: [], total: 0, perPage: 100 }
    }
  }
  const filterUrls = (urls) => {
    return urls.filter(url => !excludeFromSitemap.some(ex => url.includes(ex)))
  }

  let storiesUrls = []
  let page = 1
  let totalStories = 0
  let perPage = 100

  while (true) {
    const result = await getStories(page)
    if (result.urls.length === 0) break

    storiesUrls = storiesUrls.concat(result.urls)

    // Prendi il totale dalla prima risposta
    if (page === 1) {
      totalStories = result.total
      perPage = result.perPage
    }

    // Calcola il numero massimo di pagine necessarie
    const maxPages = Math.ceil(totalStories / perPage)
    if (page >= maxPages) break

    page++
  }

  storiesUrls = filterUrls(storiesUrls)
  return storiesUrls.map(url => ({ loc: url }))
}, {
  name: 'sitemap-dynamic-urls',
  maxAge: 60 * 100, // cache URLs for 100 minutes
})
