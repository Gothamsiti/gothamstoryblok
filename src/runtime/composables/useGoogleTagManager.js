import { useRuntimeConfig, useHead } from '#imports'

export const useGoogleTagManager = () => {
  if (import.meta.server) {
    const config = useRuntimeConfig()
    const { analytics } = config.gothamstoryblok
    if (analytics) {
      const { trackingId } = analytics
      if (trackingId) {
        useHead({
          script: [
            {
              src: `https://www.googletagmanager.com/gtag/js?id=${trackingId}`,
              type: 'text/javascript',
              async: true,
              body: true,
              'data-cookieconsent': 'statistics',
            },
            {
              innerHTML: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${trackingId}');
                window.gtag = gtag;
              `,
              type: 'text/javascript',
              'data-cookieconsent': 'statistics',
            },

          ],
        })
      }
    }
  }
}
