import { getQuery, useRuntimeConfig } from '#imports'

// chiavi KV fino a 512 byte, nomi file fino a 255: la parte leggibile viene troncata oltre questa soglia
const MAX_KEY_LENGTH = 180

// FNV-1a 32 bit, calcolato sulla chiave completa prima della conversione
const shortHash = (value) => {
  let h = 0x811C9DC5
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

// defineCachedEventHandler di Nitro tiene solo [A-Za-z0-9_] della chiave (escapeKey): tutto il resto diventa "_"
const toWord = value => String(value).replace(/\W+/g, '_').replace(/^_+|_+$/g, '')

const normalizeSlug = value => String(value).trim().replace(/^\/+|\/+$/g, '')

/**
 * Chiave di cache leggibile per gli handler del gruppo "storyblok".
 * Formato: <tipo>__<lingua>__<slug>__<parametro>_<valore>__...__<hash>
 * Slash, trattini e altri simboli diventano "_", es.:
 * - story__it__casi_d_uso_banco_prova__resolve_relations_page_items__1x2y3z
 * - stories__it__casi_d_uso__excluding_slugs_casi_d_uso_banco_prova__is_startpage_0__4k5l6m
 * - all__it__all__excluding_slugs_system__7n8o9p
 * - links__it__per_page_1000__0a1b2c
 * - space, datasources
 * Il tipo "request" si risolve in "story" (con fullSlug) o "stories" (senza).
 * Tutti i parametri entrano nella chiave perché vengono inoltrati a Storyblok e cambiano la risposta;
 * l'hash finale distingue i casi che la conversione renderebbe uguali (es. "a-b" e "a_b").
 * space e datasources ignorano la query, quindi la chiave è fissa.
 */
export const storyblokCacheKey = type => (event) => {
  if (type === 'space' || type === 'datasources') return type
  const { defaultLanguage } = useRuntimeConfig()
  // isEditor resta fuori dalla chiave: con true la cache viene bypassata, con false la risposta è la stessa
  const { language, fullSlug, starts_with, ...rest } = getQuery(event)
  delete rest.isEditor
  const lang = language || defaultLanguage || 'default'
  let name = type
  let slug

  if (type === 'request') {
    name = fullSlug ? 'story' : 'stories'
    slug = fullSlug || starts_with || 'all'
    if (fullSlug && starts_with) rest.starts_with = starts_with
  }
  else if (type === 'all') {
    slug = starts_with || 'all'
    if (fullSlug) rest.fullSlug = fullSlug
  }
  else {
    if (fullSlug) rest.fullSlug = fullSlug
    if (starts_with) rest.starts_with = starts_with
  }

  const params = Object.keys(rest)
    .filter(k => rest[k] !== undefined && rest[k] !== null && rest[k] !== '')
    .sort()
    .map(k => [k, Array.isArray(rest[k]) ? rest[k].join(',') : String(rest[k])])

  const raw = JSON.stringify([name, lang, slug && normalizeSlug(slug), params])
  const readable = [name, lang, slug && normalizeSlug(slug), ...params.map(([k, v]) => `${k}_${v}`)]
    .filter(Boolean)
    .map(toWord)
    .filter(Boolean)
    .join('__')
    .slice(0, MAX_KEY_LENGTH)

  return `${readable}__${shortHash(raw)}`
}
