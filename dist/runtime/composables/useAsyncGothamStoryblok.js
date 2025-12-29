import { useStoryblokBridge } from '@storyblok/vue'
import { useNuxtApp, useState, useAsyncData, createError, useLanguage, onMounted } from '#imports'

export const useAsyncGothamStoryblok = async (url, options, bridgeOptions, nocomponent = false) => {
  const { $__ } = useNuxtApp()
  const uniqueKey = `${JSON.stringify(options)}${url}`
  const story = useState(`${uniqueKey}-state`)
  const stories = useState(`${uniqueKey}-stories-state`)
  const rels = useState(`${uniqueKey}-rels-state`)
  if (!nocomponent) {
    onMounted(() => {
      if (!stories.value && story.value && story.value.id) {
        useStoryblokBridge(
          story.value.id,
          evStory => (story.value = evStory),
          bridgeOptions,
        )
      }
    })
  }
  var refresh = () => {}
  if (!story.value) {
    const { data, error, refresh: refreshAsync } = await useAsyncData(uniqueKey, async () => {
      var params = {
        fullSlug: url,
      }
      if (options) params = { ...params, ...options }
      const { currentLanguage, defaultLanguage } = useLanguage()
      if (!params.language && currentLanguage.value != defaultLanguage) params.language = currentLanguage.value

      if (params.isEditor) {
        const { $__clearCache } = useNuxtApp()
        await $__clearCache(params)
      }

      return $fetch('/api/storyblok/request', { query: params })
    })
    refresh = refreshAsync

    if (error.value) throw error.value

    if (!data?.value && !nocomponent) throw createError({ statusCode: 404, statusMessage: $__('errorPageNotFound'), fatal: true })
    if (data?.value) {
      if (data.value.total) {
        stories.value = data.value.stories
        return { ...data.value }
      }
      if (Array.isArray(data.value)) {
        stories.value = data.value
      }
      else {
        story.value = data.value
      }

      if (options?.resolve_relations) {
        story.value = data.value?.story
        rels.value = data.value?.rels
      }
    }
  }
  return { story, stories, rels, refresh }
}
