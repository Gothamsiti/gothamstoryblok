import { useRuntimeConfig, useHead } from '#imports'

export const useIubenda = () => {
  if (import.meta.server) {
    const config = useRuntimeConfig()
    const { iubenda } = config.gothamstoryblok
    if (iubenda) {
      const { widgetId } = iubenda
      if (widgetId) {
        useHead({
          script: [
            {
              type: 'text/javascript',
              src: `https://embeds.iubenda.com/widgets/${widgetId}.js`,
              body: true,
            },
          ],
        })
      }
    }
  }
  const iubendaInit = () => {
    var s = document.createElement('script'),
      tag = document.getElementsByTagName('script')[0]
    s.src = 'https://cdn.iubenda.com/iubenda.js'
    tag.parentNode.insertBefore(s, tag)
  }
  return { iubendaInit }
}
