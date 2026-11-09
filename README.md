# Gotham Storyblok Module

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Un modulo Nuxt completo per integrare **Storyblok CMS** nelle tue applicazioni, fornendo composables, plugin e API server per una gestione fluida dei contenuti. Supporta il multi-lingua, cache configurabile, e l'editor live di Storyblok.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)

## Caratteristiche

- 🎯 **Integrazione Storyblok completa** - Accesso ai contenuti via API con caching
- 🌍 **Multi-lingua** - Supporto integrato per più lingue con gestione automatica
- ⚡ **Cache intelligente** - Cache lato server per performance ottimali
- 🏷️ **Sistema di etichette** - Gestione centralizzata delle traduzioni tramite Storyblok
- 🖼️ **Gestione immagini** - Sistema per recuperare e servire immagini da Storyblok
- 📊 **Datasources** - Accesso ai datasources configurati in Storyblok
- ✏️ **Editor Live** - Supporto per l'editor visuale di Storyblok in modalità draft
- 🔌 **API Server** - Endpoints pronti per interagire con Storyblok

## Installazione

Installa il modulo nella tua applicazione Nuxt:

```bash
npm install gothamstoryblok
# oppure
pnpm add gothamstoryblok
```

## Configurazione

Aggiungi il modulo al file `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['gothamstoryblok'],
  gothamstoryblok: {
    // Token API di Storyblok (obbligatorio)
    storyblok: {
      key: 'YOUR_STORYBLOK_API_KEY',
      version: 'draft', // 'draft' o 'published'
    },
    // Configurazione del cache (in ore)
    cache: {
      expire: 1, // Cache di 1 ora
    },
    // Configurazione Cache cloudflare
    cloudflare: {
      zoneID: 'YOUR_CLOUDFLARE_ZONE_ID',
      apiKey: 'YOUR_CLOUDFLARE_API_KEY'
    },
    // Configurazione sitemap (opzionale)
    sitemap: {
      excludeFromSitemap: ['system'], // Slug da escludere
    },
  },
})
```

### Dipendenze

Questo modulo dipende da [Gothamutils](https://github.com/Gothamsiti/GothamUtils), assicurati che sia configurato correttamente per il multi-lingua e le altre options gestite dal modulo:

```typescript
export default defineNuxtConfig({
  gothamutils: {
    multiLang: true,
    // ... altre opzioni
  },
})
```

## Utilizzo

### Composable: useAsyncGothamStoryblok

Il composable principale per recuperare storie da Storyblok.

#### Parametri

```typescript
useAsyncGothamStoryblok(
  url,           // string: slug della storia
  options,       // object (opzionale): opzioni di query Storyblok
  bridgeOptions, // object (opzionale): opzioni per Storyblok Bridge
  nocomponent    // boolean (opzionale): disabilita Storyblok Bridge
)
```

#### Esempio: Recuperare una singola storia

```vue
<script setup>
import { useAsyncGothamStoryblok } from '#imports'

const { story, refresh } = await useAsyncGothamStoryblok('about-us')
</script>

<template>
  <div>
    <h1>{{ story.name }}</h1>
    <p>{{ story.content.description }}</p>
  </div>
</template>
```

#### Esempio: Recuperare più storie

```vue
<script setup>
import { useAsyncGothamStoryblok } from '#imports'

const { stories } = await useAsyncGothamStoryblok(
  'blog',
  { starts_with: 'blog/' }
)
</script>

<template>
  <div>
    <div v-for="story in stories" :key="story.id">
      <h2>{{ story.name }}</h2>
    </div>
  </div>
</template>
```

#### Esempio: Recuperare storia con relazioni

```typescript
const { story, rels } = await useAsyncGothamStoryblok(
  'product-detail',
  {
    resolve_relations: 'product.related_products', // Specify relations
  }
)

// rels contiene gli oggetti correlati caricati
```

#### Esempio: Multi-lingua

Il modulo rileva automaticamente la lingua corrente da `useLanguage()`:

```typescript
// Se l'utente è in lingua diversa da quella di default,
// il modulo recupererà automaticamente il contenuto nella lingua corrente
const { story } = await useAsyncGothamStoryblok('home')
```

#### Aggiornamento dinamico

```typescript
const { story, refresh } = await useAsyncGothamStoryblok('home')

// Ricarica il contenuto
await refresh()
```

#### Opzioni di Query Storyblok

Puoi passare qualsiasi parametro supportato dall'API di Storyblok:

```typescript
const { stories } = await useAsyncGothamStoryblok(
  '',
  {
    starts_with: 'blog/',
    sort_by: 'created_at:desc',
    per_page: 10,
    page: 1,
  }
)
```

### Composable: useStoryblokEditor

Rileva se l'utente è nell'editor visuale di Storyblok.

```vue
<script setup>
import { useStoryblokEditor } from '#imports'

const { sbEditor } = useStoryblokEditor()
</script>

<template>
  <div v-if="sbEditor" class="editor-mode">
    In modalità editor
  </div>
</template>
```

### Plugin: Labels (Traduzioni)

Accedi alle etichette/traduzioni gestite in Storyblok.

**Struttura in Storyblok:** Crea una storia in `system/labels` con componente contenente un array di items con campi `key` e `text`.

```vue
<template>
  <!-- Accesso semplice -->
  <button>{{ $__('submit_button') }}</button>
  
  <!-- Con sostituzione di parametri -->
  <p>{{ $__('welcome_message', 'John') }}</p>
  
  <!-- Con prefisso (namespace) -->
  <label>{{ $__('email', undefined, 'form') }}</label>
  <!-- Cerca: form_email -->
</template>
```

**Utilizzo in script:**

```typescript
const { $__ } = useNuxtApp()
const label = $__('submit_button')
```

### Plugin: Images

Gestione centralizzata delle immagini.

**Struttura in Storyblok:** Crea una storia in `system/images` con componente contenente un array di items con campi `key` e `asset` (URL dell'immagine).

```vue
<template>
  <!-- Recupera URL immagine -->
  <img :src="$__img('logo')" alt="Logo" />
  
  <!-- Carica SVG inline -->
  <div v-html="await $__svg('https://example.com/icon.svg')"></div>
</template>
```

### Plugin: Datasources

Accedi ai datasources configurati in Storyblok.

```vue
<template>
  <!-- Recupera un singolo datasource per valore -->
  <div>{{ $__datasource('category_1') }}</div>
  
  <!-- Recupera tutti i datasources di un tipo -->
  <select>
    <option
      v-for="option in $__datasources('categories')"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>
```

### Plugin: Utils

Utility interne per il parsing degli endpoint e la gestione delle slugs tradotte.

**`$__parseEndpoint()`** - Estrae automaticamente endpoint e lingua dalla route:

```typescript
const { endpoint, language, version } = $__parseEndpoint()
```

Usa questa funzione per convertire i parametri dinamici di Nuxt nei valori Storyblok.

## API Endpoints

Il modulo registra automaticamente gli endpoint server:

### GET `/api/storyblok/request`

Recupera storie da Storyblok con caching.

**Query Parameters:**
- `fullSlug` - Slug completo della storia
- `starts_with` - Filtra storie che iniziano con questo valore
- `language` - Lingua specifica (default: lingua corrente)
- `resolve_relations` - Relazioni da risolvere
- `sort_by` - Campo per ordinamento
- `per_page` - Numero risultati per pagina
- `page` - Numero pagina
- `isEditor` - Booleano (true bypass cache)

**Esempio:**

```typescript
const story = await $fetch('/api/storyblok/request', {
  query: {
    fullSlug: 'about-us',
  },
})
```

### GET `/api/storyblok/all`

Recupera tutte le storie con parametri specifici (pagination automatica).

```typescript
const allStories = await $fetch('/api/storyblok/all', {
  query: {
    starts_with: 'blog/',
  },
})
```

### GET `/api/storyblok/space`

Recupera informazioni dello spazio Storyblok.

```typescript
const space = await $fetch('/api/storyblok/space')
```

### GET `/api/storyblok/datasources`

Recupera tutti i datasources dello spazio.

```typescript
const datasources = await $fetch('/api/storyblok/datasources')
```

### GET `/api/storyblok/links`

Recupera tutti gli slug disponibili.

```typescript
const links = await $fetch('/api/storyblok/links')
```

### GET `/api/storyblok/cache`

Recupera informazioni sulla cache.

```typescript
const cacheInfo = await $fetch('/api/storyblok/cache')
```

### GET `/api/storyblok/clearCache`

Svuota la cache Nitro e lancia un purge completo della cache Cloudflare (se `cloudflare.zoneID` e `cloudflare.apiKey` sono configurati). L'endpoint non richiede autenticazione: vedi [Svuotamento della cache](#svuotamento-della-cache).

- senza parametri: svuota tutte le voci del gruppo `storyblok`
- `?fullSlug=...` (ed eventualmente `&language=...`): svuota solo le voci che contengono quello slug
- `?itemId=...`: svuota una singola voce (senza purge Cloudflare)

```typescript
await $fetch('/api/storyblok/clearCache')
```

### POST `/api/storyblok/clearCache`

Pensato per il webhook di Storyblok. Body vuoto: svuota tutto. Body `{ "full_slug": "..." }`: svuota solo le voci di quello slug. In entrambi i casi lancia un purge completo di Cloudflare.

### GET `/api/sitemap`

Genera sitemap XML con tutti i contenuti pubblicati.

```typescript
const sitemap = await $fetch('/api/sitemap')
```

## Pattern di Utilizzo Comuni

### Pattern: Dynamic Routes con Multi-lingua

```vue
<script setup lang="ts">
import { useAsyncGothamStoryblok } from '#imports'

const route = useRoute()
const { $__parseEndpoint } = useNuxtApp()

const { endpoint } = $__parseEndpoint()
const { story } = await useAsyncGothamStoryblok(endpoint || 'homepage')
</script>
```

### Pattern: SEO con Meta Tags

```vue
<script setup>
import { useAsyncGothamStoryblok } from '#imports'

const { story } = await useAsyncGothamStoryblok('home')

useHead({
  title: story.content.seo_title || story.name,
  meta: [
    {
      name: 'description',
      content: story.content.seo_description,
    },
  ],
})
</script>
```

### Pattern: Gestione dei Form

```vue
<script setup>
const { $__datasources } = useNuxtApp()
const categories = $__datasources('categories')
</script>

<template>
  <select>
    <option v-for="cat in categories" :key="cat.value" :value="cat.value">
      {{ cat.label }}
    </option>
  </select>
</template>
```

### Pattern: Loader Fallback

```vue
<script setup>
const { story, refresh } = await useAsyncGothamStoryblok('home')

const retry = async () => {
  await refresh()
}
</script>

<template>
  <div v-if="story">
    <h1>{{ story.name }}</h1>
  </div>
  <div v-else>
    <p>Errore nel caricamento. <button @click="retry">Riprova</button></p>
  </div>
</template>
```

## Cache e Performance

Il modulo implementa un sistema di cache lato server configurabile:

- **Cache Duration:** configurabile tramite `cache.expire`, **in secondi** (è il `maxAge` di `defineCachedEventHandler`). Il default è `1`, cioè praticamente nessuna cache: in produzione impostalo esplicitamente, ad esempio `31536000` (1 anno) e affidati a `clearCache` per l'invalidazione.
- **Cache Group:** tutti gli endpoint usano il gruppo `'storyblok'`, quindi le voci finiscono nello storage `cache` di Nitro con chiavi `storyblok:_:*`.
- **Cache Bypass:** passa `isEditor=true` come query parameter per forzare il bypass della cache (utile per l'editor).

```typescript
// Forza bypass della cache
const story = await $fetch('/api/storyblok/request', {
  query: {
    fullSlug: 'home',
    isEditor: true, // Bypassa cache
  },
})
```

```typescript
// nuxt.config.ts
gothamstoryblok: {
  cache: {
    expire: process.env.DEFAULT_EXPIRE ? parseInt(process.env.DEFAULT_EXPIRE) : 0,
  },
}
```

## Deploy su Cloudflare Pages: configurazione della cache

Questa sezione descrive come configurare un progetto che usa il modulo e gira su **Cloudflare Pages** in modo da ridurre al minimo le chiamate a Storyblok (API e traffico asset).

### I livelli di cache

Una richiesta si ferma al primo livello che ha una risposta valida:

```
Browser
  │
  ▼
[1] Cloudflare edge         cache del data center più vicino (Cache Rules)
  │ MISS
  ▼
[2] Tiered Cache            data center "upper tier", condiviso tra più edge
  │ MISS
  ▼
[3] Cache Reserve           storage persistente (opzionale, a pagamento)
  │ MISS
  ▼
[4] Worker Pages (Nitro)    cache Nitro → in memoria oppure su KV
  │ MISS
  ▼
[5] API Storyblok
```

Cose da sapere:

- **Ogni data center ha la sua cache.** Una pagina in HIT a Milano può essere in MISS a Zurigo. Lo vedi dal suffisso dell'header `cf-ray` (`-MXP`, `-ZRH`, …).
- **L'Edge TTL è un massimo, non una garanzia.** Sui piani Free e Pro i contenuti poco richiesti vengono scartati prima della scadenza (anche dopo pochi minuti). Per questo un MISS dopo mezz'ora è normale su siti con poco traffico.
- **Un MISS su Cloudflare non è per forza una chiamata a Storyblok:** la richiesta arriva al Worker, che prima guarda la cache Nitro. È per questo che la cache Nitro deve essere persistente (KV, vedi sotto): senza KV ogni istanza del Worker parte con la cache vuota.

### 1. Cache Nitro persistente con Workers KV

Su Cloudflare Pages il filesystem non è disponibile, quindi senza configurazione la cache Nitro resta **in memoria per singola istanza** del Worker e si perde ogni volta che l'istanza viene spenta. Con un namespace KV la cache diventa persistente e condivisa da tutte le istanze, in tutti i data center: ogni risposta di Storyblok viene richiesta una volta sola fino al successivo `clearCache`.

**Su Cloudflare**

1. **Storage & Databases → Workers KV → Create**: crea un namespace, ad esempio `<progetto>-nitro-cache`.
2. **Workers & Pages → progetto → Settings → Bindings → Add → KV namespace**, ambiente **Production**:
   - Variable name: `NITRO_CACHE`
   - KV namespace: `<progetto>-nitro-cache`

   ⚠️ Va aggiunto come **binding**, non come variabile d'ambiente in *Settings → Variables*. Una variabile di testo chiamata `NITRO_CACHE` non funziona: Nitro non scrive nulla e il namespace resta vuoto.
3. **Settings → Variables**:
   - Production: `ENVIROMENT=production`, `DEFAULT_EXPIRE=31536000`
   - Preview: `DEFAULT_EXPIRE=0` (contenuti sempre freschi, nessun binding KV)
4. Fai un **nuovo deploy**: binding e variabili valgono solo dal deploy successivo.

Se vuoi la cache anche in Preview, crea un secondo namespace (es. `<progetto>-nitro-cache-preview`) e collegalo con lo stesso nome `NITRO_CACHE` all'ambiente Preview, così le anteprime non toccano la cache di produzione.

**Nel progetto (`nuxt.config.ts`)**

KV va attivato solo dove il binding esiste: se Nitro cerca `NITRO_CACHE` e non lo trova, il driver va in errore. La condizione viene valutata durante `nuxt build`, quindi `ENVIROMENT` deve essere disponibile come variabile di build.

```typescript
const isCloudflare = Boolean(process.env.CF_PAGES)
  || (process.env.NITRO_PRESET || '').includes('cloudflare')
const useKvCache = isCloudflare && process.env.ENVIROMENT === 'production'
const nitroCacheDir = process.env.NITRO_FS_CACHE_DIR || './.cache/nitro'

export default defineNuxtConfig({
  nitro: {
    ...(useKvCache
      ? { storage: { cache: { driver: 'cloudflare-kv-binding', binding: 'NITRO_CACHE' } } }
      : isCloudflare
        ? {}
        : { storage: { cache: { driver: 'fsLite', base: nitroCacheDir } } }),
  },
})
```

| Ambiente | Storage cache Nitro | Effetto |
|---|---|---|
| Produzione su Pages | KV | cache persistente e condivisa |
| Preview su Pages | memoria, con `DEFAULT_EXPIRE=0` | nessuna cache, contenuti sempre freschi |
| Locale | disco (`.cache/nitro`) | cache tra un riavvio e l'altro |

Non servono `wrangler.toml` né dipendenze aggiuntive: il driver `cloudflare-kv-binding` è incluso in Nitro.

**Verifica:** dopo il deploy apri qualche pagina, poi in *Workers KV → namespace → KV Pairs* devono comparire chiavi come `storyblok:_:apistoryblokrequ.<hash>.json`.

**Limiti da conoscere**

- Piano Workers Free: circa 100.000 letture, 1.000 scritture, 1.000 cancellazioni e 1.000 list al giorno. Ogni voce svuotata da `clearCache` è una cancellazione: con molte voci o molti svuotamenti al giorno serve Workers Paid (circa 5 $/mese).
- KV è *eventualmente consistente*: dopo una scrittura o una cancellazione gli altri data center possono vedere il valore vecchio per circa 60 secondi.

### 2. Cache Rules

*Domini → zona → Caching → Cache Rules.* Sostituisci un'eventuale regola generica "Cache everything" con queste quattro, **in quest'ordine** (a parità di match vince l'ultima regola, quindi il bypass deve stare in fondo).

**Regola 1 – HTML pages**
- Expression: `(not starts_with(http.request.uri.path, "/api/") and not starts_with(http.request.uri.path, "/storyblokasset/") and not starts_with(http.request.uri.path, "/_nuxt/"))`
- Cache eligibility: **Eligible for cache**
- Edge TTL: **Ignore cache-control header and use this TTL** → 30 days, con status code TTL: `400–499` → 1 minute, `500–599` → No store
- Browser TTL: **Override origin** → 1 minute
- Cache key → Query string: **Ignore query string** (così `utm_*`, `gclid`, `fbclid`… non generano un nuovo render per ogni valore)

**Regola 2 – Storyblok API**
- Expression: `(starts_with(http.request.uri.path, "/api/storyblok/"))`
- Eligible for cache, Edge TTL 30 days con gli stessi status code TTL della regola 1
- Browser TTL: Override origin → 1 minute
- Cache key: query string **inclusa** (default), perché i parametri distinguono le richieste

**Regola 3 – Storyblok images**
- Expression: `(starts_with(http.request.uri.path, "/storyblokasset/"))`
- Eligible for cache, Edge TTL 1 year, Browser TTL 1 year

**Regola 4 – Bypass editor and admin** (sempre ultima)
- Expression: `(http.request.uri.query contains "_storyblok") or (http.request.uri.query contains "isEditor=true") or starts_with(http.request.uri.path, "/api/storyblok/clearCache") or starts_with(http.request.uri.path, "/api/storyblok/cache") or starts_with(http.request.uri.path, "/api/form")`
- Cache eligibility: **Bypass cache**

Adatta i percorsi della regola 4 agli endpoint del progetto che non devono mai essere messi in cache (form, webhook, API private).

La regola 3 presuppone che le immagini passino dal proxy Nitro, ad esempio con `@nuxt/image`:

```typescript
// nuxt.config.ts
image: {
  provider: 'storyblok',
  storyblok: { baseURL: '/storyblokasset/' },
},
nitro: {
  routeRules: {
    '/storyblokasset/**': { proxy: 'https://a.storyblok.com/**' },
  },
},
```

<details>
<summary>Le stesse regole in JSON (API Rulesets, fase <code>http_request_cache_settings</code>)</summary>

```json
{
  "rules": [
    {
      "description": "HTML pages",
      "expression": "(not starts_with(http.request.uri.path, \"/api/\") and not starts_with(http.request.uri.path, \"/storyblokasset/\") and not starts_with(http.request.uri.path, \"/_nuxt/\"))",
      "action": "set_cache_settings",
      "action_parameters": {
        "cache": true,
        "edge_ttl": {
          "mode": "override_origin",
          "default": 2592000,
          "status_code_ttl": [
            { "status_code_range": { "from": 400, "to": 499 }, "value": 60 },
            { "status_code_range": { "from": 500, "to": 599 }, "value": -1 }
          ]
        },
        "browser_ttl": { "mode": "override_origin", "default": 60 },
        "cache_key": { "custom_key": { "query_string": { "exclude": { "all": true } } } }
      },
      "enabled": true
    },
    {
      "description": "Storyblok API",
      "expression": "(starts_with(http.request.uri.path, \"/api/storyblok/\"))",
      "action": "set_cache_settings",
      "action_parameters": {
        "cache": true,
        "edge_ttl": {
          "mode": "override_origin",
          "default": 2592000,
          "status_code_ttl": [
            { "status_code_range": { "from": 400, "to": 499 }, "value": 60 },
            { "status_code_range": { "from": 500, "to": 599 }, "value": -1 }
          ]
        },
        "browser_ttl": { "mode": "override_origin", "default": 60 }
      },
      "enabled": true
    },
    {
      "description": "Storyblok images",
      "expression": "(starts_with(http.request.uri.path, \"/storyblokasset/\"))",
      "action": "set_cache_settings",
      "action_parameters": {
        "cache": true,
        "edge_ttl": { "mode": "override_origin", "default": 31536000 },
        "browser_ttl": { "mode": "override_origin", "default": 31536000 }
      },
      "enabled": true
    },
    {
      "description": "Bypass editor and admin",
      "expression": "(http.request.uri.query contains \"_storyblok\") or (http.request.uri.query contains \"isEditor=true\") or starts_with(http.request.uri.path, \"/api/storyblok/clearCache\") or starts_with(http.request.uri.path, \"/api/storyblok/cache\") or starts_with(http.request.uri.path, \"/api/form\")",
      "action": "set_cache_settings",
      "action_parameters": { "cache": false },
      "enabled": true
    }
  ]
}
```

Si applicano con `PUT /zones/{zone_id}/rulesets/phases/http_request_cache_settings/entrypoint` e un token con permesso **Zone → Cache Rules → Edit**. Il `PUT` sostituisce tutte le regole esistenti: salva prima quelle attuali con un `GET` sullo stesso endpoint.

</details>

> **Browser TTL e API:** Cloudflare non abbassa un `cache-control` dell'origin più lungo del Browser TTL della regola. Gli endpoint del modulo rispondono con `max-age` pari a `cache.expire`, quindi con `DEFAULT_EXPIRE=31536000` il browser tiene le risposte delle API per un anno, a prescindere dalla regola 2.

### 3. Tiered Cache e Cache Reserve

- **Tiered Cache** (*Caching → Tiered Cache*): attiva **Smart Tiered Cache**, è gratuita. In caso di MISS il data center chiede prima a un data center "superiore" invece di andare direttamente al Worker.
- **Cache Reserve** (*Caching → Cache Reserve*): storage persistente a pagamento. Conserva solo risposte con TTL di almeno 10 ore e header `Content-Length`. Le pagine HTML renderizzate da Nuxt vengono inviate a chunk, senza `Content-Length`, quindi **non entrano** in Cache Reserve; le risposte di `/api/storyblok/*` e le immagini sì. Con la cache Nitro su KV il beneficio è limitato: valuta se tenerlo attivo.

### 4. Token API per il purge

Il modulo usa `cloudflare.zoneID` e `cloudflare.apiKey` per il purge della cache in `clearCache`. Crea un token dedicato (*My Profile → API Tokens → Create Token → Custom token*) con:

- Permesso: **Zone → Cache Purge → Purge**
- Zone resources: solo la zona del sito

```typescript
// nuxt.config.ts
gothamstoryblok: {
  cloudflare: {
    zoneID: process.env.CLOUDFLARE_ZONE_ID,
    apiKey: process.env.CLOUDFLARE_API_KEY,
  },
}
```

Queste variabili vanno impostate anche nelle *Variables* del progetto Pages.

### 5. Webhook Storyblok

In Storyblok, *Settings → Webhooks*, crea un webhook sull'evento **Story published** (ed eventualmente *unpublished* / *deleted*) verso:

```
POST https://<dominio>/api/storyblok/clearCache
```

Storyblok invia `full_slug` nel body, quindi da KV vengono cancellate solo le voci di quella storia; la cache Cloudflare viene invece svuotata per intero.

### 6. Dopo ogni deploy: purge

Con l'Edge TTL di 30 giorni sull'HTML, dopo un deploy la cache edge continua a servire le pagine generate dalla versione precedente. **Dopo ogni deploy di produzione** svuota la cache: *Caching → Configuration → Purge Everything*, oppure chiama `GET /api/storyblok/clearCache` (svuota anche KV).

### Svuotamento della cache

| Chiamata | Cache Nitro / KV | Cache Cloudflare |
|---|---|---|
| `GET /api/storyblok/clearCache` | tutte le voci `storyblok:_:*` e i link | purge completo |
| `GET /api/storyblok/clearCache?fullSlug=...` | solo le voci che contengono lo slug | purge completo |
| `GET /api/storyblok/clearCache?itemId=...` | una singola voce | nessun purge |
| `POST /api/storyblok/clearCache` (body vuoto) | tutte le voci e i link | purge completo |
| `POST /api/storyblok/clearCache` (`{ "full_slug": "..." }`) | solo le voci di quello slug, e i link | purge completo |

Da tenere presente:

- **Ritardo di KV:** per circa 60 secondi dopo lo svuotamento alcuni data center possono leggere ancora il dato vecchio, e una pagina generata in quel momento torna nella cache edge con il contenuto vecchio. Se dopo una pubblicazione vedi ancora la versione precedente, attendi un minuto e richiama `clearCache`.
- **Elenco dei link in memoria:** `clearLinks` azzera l'elenco solo nell'istanza del Worker che riceve la chiamata. Le altre istanze lo tengono finché non si riavviano, quindi una pagina **appena creata** può rispondere 422 per qualche minuto su alcune istanze.
- **La sitemap** (`/api/sitemap`) ha una cache propria di 100 minuti e non viene svuotata da `clearCache`.
- **L'endpoint è pubblico:** chiunque conosca l'URL può svuotare KV e Cloudflare. Il bypass della regola 4 fa sì che la chiamata arrivi sempre al Worker.

### Verifica

```bash
# due richieste di fila: la seconda deve essere HIT
curl -sI https://<dominio>/ | grep -iE 'cf-cache-status|cf-ray|age|cache-control'
curl -sI https://<dominio>/ | grep -iE 'cf-cache-status|cf-ray|age|cache-control'

# query string ignorata sull'HTML: deve essere HIT già alla prima richiesta
curl -sI "https://<dominio>/?utm_source=test$RANDOM" | grep -i cf-cache-status

# editor e clearCache non devono mai essere in cache: DYNAMIC
curl -sI "https://<dominio>/?_storyblok=1" | grep -i cf-cache-status
```

| `cf-cache-status` | Significato |
|---|---|
| `HIT` | servito dalla cache Cloudflare |
| `MISS` / `EXPIRED` | richiesto al Worker (che può comunque rispondere dalla cache Nitro) |
| `DYNAMIC` / `BYPASS` | non messo in cache per regola |

Sul piano Free la pagina *Caching → Overview* non mostra statistiche (Cache Analytics è disponibile solo dai piani a pagamento): richieste totali e richieste servite dalla cache si vedono in *Analytics & Logs → Traffic*.

## Gestione degli Errori

```vue
<script setup>
import { useAsyncGothamStoryblok } from '#imports'

try {
  const { story } = await useAsyncGothamStoryblok('home')
} catch (error) {
  console.error('Errore nel caricamento della storia:', error)
  // Gestione dell'errore
}
</script>
```

## Sviluppo Locale

```bash
# Installa dipendenze
pnpm install

# Prepara il modulo
pnpm run dev:prepare

# Avvia playground
pnpm run dev

# Build playground
pnpm run dev:build

# Lint
pnpm run lint

# Test
pnpm run test
pnpm run test:watch

# Release patch automatico
pnpm run release:patch:auto

# Release manuale
pnpm run release
```

## Struttura del Progetto

```
gothamstoryblok/
├── src/
│   ├── module.ts                 # Configurazione del modulo
│   └── runtime/
│       ├── composables/          # Composables auto-importati
│       ├── plugins/              # Plugin per labels, immagini, datasources
│       └── server/
│           ├── api/              # Endpoints server
│           └── utils/            # Utilities server
├── test/                         # Test suite
└── playground/                   # Applicazione di esempio
```

## Troubleshooting

### Le storie non si caricano

- Verifica che `storyblok.key` sia corretto in `nuxt.config.ts`
- Controlla che lo slug esista in Storyblok
- Assicurati che `storyblok.version` sia corretto (draft vs published)

### Le traduzioni non appaiono

- Crea una storia in `system/labels` con i tuoi labels
- Verifica che gothamutils sia configurato con `multiLang: true`
- Controlla la lingua corrente con `useLanguage()`

### Cache non aggiornata

- Usa il query parameter `isEditor` per bypassare la cache
- O accedi a `/api/storyblok/clearCache` per svuotare manualmente
- Su Cloudflare, dopo un deploy, fai un purge (vedi [Dopo ogni deploy: purge](#6-dopo-ogni-deploy-purge))

### Il namespace KV resta vuoto

- Controlla che `NITRO_CACHE` sia in *Settings → Bindings* come **KV namespace**, non in *Settings → Variables*
- Controlla che `ENVIROMENT=production` sia impostata in Production: senza, `useKvCache` è falso al momento della build
- Fai un nuovo deploy dopo aver aggiunto il binding
- Verifica che le richieste arrivino davvero al Worker: se la cache edge risponde HIT, il Worker non viene eseguito e KV non viene scritto

### Le pagine tornano in MISS dopo un po'

È il comportamento normale della cache edge sui piani Free/Pro (vedi [I livelli di cache](#i-livelli-di-cache)). Controlla il suffisso di `cf-ray`: richieste successive possono arrivare a data center diversi. Con la cache Nitro su KV questi MISS non generano chiamate a Storyblok.

## License

MIT


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/my-module/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/my-module

[npm-downloads-src]: https://img.shields.io/npm/dm/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/my-module

[license-src]: https://img.shields.io/npm/l/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/my-module

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
