import { defineNuxtPlugin, useFetch } from '#app'

export default defineNuxtPlugin({
  async setup() {
    const { data: datasources } = await useFetch('/api/storyblok/datasources')
    return {
      provide: {
        __datasource: (key) => {
          return datasources.value.find(d => d?.value == key)
        },
        __datasources: (key) => {
          if (key) return datasources.value.filter(d => d?.datasource == key)

          return datasources
        },
      },
    }
  },
})
