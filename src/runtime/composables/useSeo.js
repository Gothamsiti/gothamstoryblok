const hostChecker = (array, string) => {
  for (var i in array) {
    if (string?.includes(array[i])) return true
  }
  return false
}
export const useSeo = (story) => {
  const { richText } = richTextModule()
  const { host } = useRequestURL()
  const route = useRoute()
  const { defaultLanguage } = useLanguage()
  const { $__, $__img } = useNuxtApp()
  var siteName = $__('configSiteName') != '' ? `${$__('configSiteName')} - ` : ''
  const metadata
    = story.value?.content?.metadata
      || {
        title: null,
        description: $__('configSiteDescription'),
        image: $__img('configSiteImage'),
        follow: 'follow',
      }

  var { title, description, image, follow } = metadata
  title = title || story?.value?.content?.title || story?.name

  if (typeof title == 'object' && title?.type) {
    const rendered = richText(title)
    title = rendered?.replace(/<[^>]*>?/g, '')
  }
  if (!title && siteName && siteName?.includes(' - ')) {
    siteName = siteName.replace(' - ', '')
    title = ''
  }
  title = siteName + title

  description = description || story?.value?.content?.previewText || $__('configSiteDescription')

  const noFollow = follow == 'nofollow' || hostChecker(['development', 'staging'], host)
  follow = noFollow ? 'noindex, nofollow' : 'index, follow'

  const path = route.fullPath || route.path

  useHead({
    title: title,
    htmlAttrs: {
      lang: route.params.lang || defaultLanguage.value,
    },
    link: [
      { rel: 'canonical', href: 'https://' + host + path },
    ],
    meta: [
      { property: 'og:url', content: 'https://' + host + path },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image', content: image },
      { property: 'og:description', content: description },
      { property: 'og:site_name', content: $__('configSiteName') },
      { property: 'og:title', content: title },
      { property: 'og:type', content: 'article' },
      { name: 'apple-mobile-web-app-title', content: title },
      { name: 'application-name', content: $__('configSiteName') },
      { name: 'description', content: description },
      { name: 'robots', content: follow },
    ],
  })
}
