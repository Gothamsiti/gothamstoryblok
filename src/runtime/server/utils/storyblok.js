import { useRuntimeConfig, createError, useStorage } from '#imports'

const config = useRuntimeConfig()
const { storyblok } = config.gothamstoryblok
const { key: apiKey, draftKey: draftApiKey } = storyblok

const request = async (query) => {
  try {
    const { returntotal } = query
    if (returntotal) delete query.returntotal
    const { params, isEditor } = extendsParamsWithTokenAndVersion(query)
    if (query.fullSlug) {
      if (!isEditor) await checkFullSlug(query.fullSlug)
      if (params.fullSlug) delete params.fullSlug
      const data = await $fetch(`https://api.storyblok.com/v2/cdn/stories/${query.fullSlug}`, { method: 'GET', query: params })
      const { story, rels } = data
      if (params.resolve_relations) return { story, rels }
      return story
    }
    let { _data: data, headers } = await $fetch.raw('https://api.storyblok.com/v2/cdn/stories', {
      query: params,
    })
    const perPage = Number.parseInt(headers.get('per-page'))
    const total = Number.parseInt(headers.get('total'))
    let { stories, rels } = data
    if (!isEditor || isEditor === 'false') stories = stories.filter(s => !s?.content?.metadata?.disbledforlanguage)

    let res = stories
    if (returntotal) res = { stories, perPage, total }
    if (rels.length) {
      if (returntotal) {
        res.rels = rels
      }
      else {
        res = { stories, rels }
      }
    }

    return res
  }
  catch (error) {
    throw error
  }
}

const space = async () => {
  const data = await $fetch(`https://api.storyblok.com/v2/cdn/spaces/me`, {
    query: {
      token: apiKey,
    },
  })

  const { space } = data
  const available_languages = [...space.language_codes, config.defaultLanguage]
  space.available_languages = available_languages
  space.default_language = config.defaultLanguage
  delete space.language_codes
  return space
}

const getAll = async (params) => {
  const requestParams = { ...params, returntotal: true, per_page: 100 }
  const getStories = async (page = 1, allStories = []) => {
    try {
      const { stories, total, perPage } = await request({ ...requestParams, page })
      allStories.push(...stories)
      // confronto sulle pagine: request() filtra le storie disabilitate, quindi allStories.length può non raggiungere mai total
      if (page * perPage < total) return getStories(page + 1, allStories)
      return allStories
    }
    catch (error) {
      return error
    }
  }
  try {
    return await getStories()
  }
  catch (error) {
    return error
  }
}
const extendsParamsWithTokenAndVersion = (query) => {
  const isEditor = (query.isEditor == 'true' || query.isEditor === true) || false
  const version = isEditor ? 'draft' : storyblok.version
  const token = version == 'draft' ? draftApiKey || apiKey : apiKey
  if (isEditor || isEditor === false) delete query.isEditor
  const defaultLanguage = config.defaultLanguage
  if (query.language == defaultLanguage) delete query.language
  return {
    params: {
      cv: Date.now(),
      version,
      token,
      ...query,
    },
    isEditor,
  }
}

const links = async (query) => {
  const { params } = extendsParamsWithTokenAndVersion(query);
  try {
    const { links } = await $fetch('https://api.storyblok.com/v2/cdn/links', {
      query: params,
    })

    return links
  }
  catch (error) {
    throw error
  }
}

/**
 * Indice dei link condiviso tra le richieste dello stesso isolate: si condivide solo il risultato già pronto,
 * mai la promise del caricamento in corso. Sui Cloudflare Workers, quando la richiesta che ha avviato un
 * caricamento termina (client che chiude, timeout) le sue continuazioni vengono scartate: una promise condivisa
 * non si risolverebbe più e ogni richiesta successiva dell'isolate resterebbe appesa in attesa.
 * Se più richieste trovano l'indice vuoto, ognuna lo carica per conto suo (la risposta di /api/storyblok/links è in cache).
 */
let linksList = undefined
// incrementata da clearLinks: un caricamento partito prima dello svuotamento non deve ripristinare l'indice vecchio
let linksListVersion = 0

const normalizeFullSlug = (value = '') => {
  const normalized = String(value).trim().replace(/^\/+|\/+$/g, '')
  return normalized
}

const buildLinksIndex = (links) => {
  const result = {
    fullSlug: {},
    uuid: {},
    id: {},
  }

  for (const i in links) {
    const link = links[i]
    // indicizza sia slug (usato da cdn/stories) che real_path (può differire se impostato su Storyblok)
    for (const value of [link?.slug, link?.real_path]) {
      const fullSlug = normalizeFullSlug(value)
      if (fullSlug && !result.fullSlug[fullSlug]) result.fullSlug[fullSlug] = link
    }
    if (!result.uuid[link.uuid]) result.uuid[link.uuid] = link
    if (!result.id[link.id]) result.id[link.id] = link
  }

  return result
}

const loadLinksList = async () => {
  if (linksList) return linksList
  const version = linksListVersion
  const links = await $fetch('/api/storyblok/links', { query: { per_page: 1000 } })
  const result = buildLinksIndex(links)
  if (version === linksListVersion) linksList = result
  return result
}

const checkFullSlug = async (fullSlug) => {
  const cachedLinks = await loadLinksList()
  const identifier = String(fullSlug).trim()
  const normalizedFullSlug = normalizeFullSlug(fullSlug)

  if (!(cachedLinks.fullSlug[normalizedFullSlug] || cachedLinks.id[identifier] || cachedLinks.uuid[identifier])) {
    console.warn('[gothamstoryblok] fullSlug filtered by links', {
      fullSlug: normalizedFullSlug,
      requested: fullSlug,
    })
    throw createError({ statusCode: 422, message: 'Not found (fullSlug)' })
  }
}

const clearLinks = async () => {
  linksList = undefined
  linksListVersion++

  const cacheLinks = useStorage('cache:storyblok:links')
  const cachedKeys = await cacheLinks.getKeys()
  for (var i in cachedKeys) await cacheLinks.removeItem(cachedKeys[i])
}

export { request, space, getAll, links, clearLinks }
