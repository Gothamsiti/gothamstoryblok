import { defineNuxtPlugin, useFetch } from '#app'

export default defineNuxtPlugin({
  name: 'labels',
  parallel: true,
  async setup() {
    const { params } = useRoute()
    const { defaultLanguage, languages } = useLanguage()

    var labels = {}
    let language = defaultLanguage.value
    if (params?.fullslug && params?.fullslug.length > 0) {
      const fullslug = JSON.parse(JSON.stringify(params?.fullslug))
      if (languages.value?.includes(fullslug[0])) {
        language = fullslug[0]
      }
    }
    const query = {
      starts_with: 'system/labels',
      language,
    }
    const { data: stories } = await useFetch('/api/storyblok/request', {
      query,
    })
    if (stories?.value?.length) {
      for (var story of stories.value) {
        if (story?.content?.items?.length) {
          for (var label of story.content.items) {
            labels[label.key] = label.text
          }
        }
      }
    }
    return {
      provide: {
        __: (...args) => {
          var s = args[0]
          var prefix = args[2]
          const key = prefix ? prefix + '_' + s : s
          s = labels[key] || labels[key] === '' ? labels[key] : s
          for (var i = 1; i < args.length; i++) {
            s = s.replace('%s', args[i])
          }
          return s || ''
        },
      },
    }
  },
})
