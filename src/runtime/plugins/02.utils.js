import { defineNuxtPlugin } from '#app'
import { useLanguage, useRoute, useRuntimeConfig, useStoryblokEditor } from '#imports'

const config = useRuntimeConfig()
const { storyblok } = config.gothamstoryblok
const {version} = storyblok
export default defineNuxtPlugin({
  dependsOn: ['labels', 'images'],
  async setup() {
    return {
      provide: {
        __url: (u) => {
          if (!u) return undefined
          if (u == '#' || u.substring(0, 4) == 'http') return u
          const { languages, currentLanguage, slugList } = useLanguage()
          u = u.substring(0, 1) == '/' ? u : '/' + u
          if (languages.value.length < 2) return u
          u = u.replace(/([^:])\/\//g, '$1/')
          const founded = slugList.value.find(s => (u == s.fullslug || u == '/' + s.fullslug))
          if (founded?.slugs) {
            const sp = u.split('/')
            sp[sp.length - 1] = founded?.slugs[currentLanguage.value]
            u = sp.join('/')
          }
          const prefix = '/' + currentLanguage.value + '/'
          const startString = u.substring(0, 4)
          if (prefix != startString) u = prefix + u
          u = u.replace(/([^:])\/\//g, '$1/')
          return u
        },
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
        },
        __filename: (str) => {
          return str.replace(/^.*[\\/]/, '')
        },
        __formatDate: d => (new Date(d)).toLocaleDateString('IT-it', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        __clearCache: async (query) => {
          const { sbEditor } = useStoryblokEditor()
          if (sbEditor.value) {
            await $fetch('/api/storyblok/clearCache', { query })
          }
        },
      },
    }
  },
})
