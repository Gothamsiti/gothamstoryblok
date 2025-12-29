// https://developers.cloudflare.com/workers/examples/aggregate-requests/

import { defineCachedEventHandler, useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()
export default defineCachedEventHandler(async () => {
  try {
    let arr = []
    const cv = Date.now()
    const { datasources } = await fetch('https://api.storyblok.com/v2/cdn/datasources?' + new URLSearchParams({ token: config.gothamstoryblok.key, per_page: 100, cv }), { headers: { 'Content-Type': 'application/json' } }).then(response => response.json())

    const promiseArr = []
    datasources.map((d) => {
      promiseArr.push(
        fetch('https://api.storyblok.com/v2/cdn/datasource_entries?' + new URLSearchParams({ token: config.gothamstoryblok.key, per_page: 100, cv, datasource: d.slug }, { headers: { 'Content-Type': 'application/json' } })),
      )
    })

    const responses = await Promise.all(promiseArr)
    const response = await Promise.all(responses.map(r => r.json()))

    for (var i in response) {
      response[i].datasource_entries = response[i].datasource_entries.map(e => ({ ...e, datasource: datasources[i].slug }))
      arr = arr.concat(response[i].datasource_entries)
    }

    return arr
  }
  catch (error) {
    console.log(error)
    throw createError({ statusCode: 500, statusMessage: 'Error building datasources' })
  }
}, {
  maxAge: process.env.DEFAULT_EXPIRE,
  group: 'storyblok',
  shouldInvalidateCache: (e) => {
    const query = getQuery(e)
    const bypass = query.sbToken != undefined
    return bypass
  },
})
