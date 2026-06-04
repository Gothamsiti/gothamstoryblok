import { defineNuxtPlugin } from '#app'
import { useLanguage, useRoute, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  async setup() {
    const config = useRuntimeConfig()
    const version = config.public?.gothamstoryblok?.storyblok?.version || config.gothamstoryblok?.storyblok?.version || 'public'
    return {
      provide: {
        __parseEndpoint: () => {
          const route = useRoute()
          const { languages, currentLanguage, defaultLanguage, slugList } = useLanguage()

          let language
          let fullslug

          if (route?.params?.fullslug && route?.params?.fullslug.length > 0) {
            fullslug = JSON.parse(JSON.stringify(route?.params?.fullslug))
            const availableLanguages = languages.value
            if (availableLanguages?.includes(fullslug[0])) {
              language = fullslug[0] != defaultLanguage.value ? fullslug[0] : undefined
              fullslug.shift()
            }
            if (fullslug[0] == '' || !fullslug[0]) fullslug = undefined
          }
          const endpoint = fullslug || ['homepage']
          // ECCEZIONE PER I TRANSLATED SLUGS
          if (!route.query['_storyblok_tk[token]'] && slugList.value?.length > 0) {
            let slug = endpoint.pop()
            const founded = slugList.value.find(s => s.slugs[currentLanguage.value] == slug)
            if (!founded?.slug) {
              return { endpoint: undefined }
            }
            else {
              endpoint.push(founded?.slug)
            }
          }
          return { endpoint: endpoint.join('/'), language, version }
        }
      },
    }
  },
})
