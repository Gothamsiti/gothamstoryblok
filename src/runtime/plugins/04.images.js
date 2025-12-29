import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin({
  name: 'images',
  parallel: true,
  async setup() {
    var images = {}
    const { data: stories } = await useFetch('/api/storyblok/request', {
      query: {
        starts_with: 'system/images',
      },
    })
    if (stories?.value?.length) {
      for (var story of stories.value) {
        if (story.content?.items?.length) {
          for (var image of story.content.items) {
            images[image.key] = image.asset
          }
        }
      }
    }
    return {
      provide: {
        __img: (key) => {
          return images[key]
        },
        __svg: async (svgUrl) => {
          if (!svgUrl) return null
          const extension = svgUrl.split('.').pop()
          if (!extension?.includes('svg')) return null
          svgUrl = svgUrl.replace('https://', 'https://s3.amazonaws.com/')
          const response = await $fetch(svgUrl)
          const data = await response.text()
          return data
        },
      },
    }
  },
})
