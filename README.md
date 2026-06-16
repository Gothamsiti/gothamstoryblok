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
- `sbToken` - Token di Storyblok (bypass cache)

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

Svuota la cache (solo in modalità draft).

```typescript
await $fetch('/api/storyblok/clearCache')
```

### POST `/api/storyblok/clearCache`

Endpoint POST per svuotare cache.

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

- **Cache Duration:** Configurabile tramite `cache.expire` (in ore)
- **Cache Group:** Tutti gli endpoint usano il gruppo `'storyblok'` per gestione centralizzata
- **Cache Bypass:** Passa `sbToken` come query parameter per forzare il bypass della cache (utile per l'editor)

```typescript
// Forza bypass del cache
const story = await $fetch('/api/storyblok/request', {
  query: {
    fullSlug: 'home',
    sbToken: 'editor-token', // Bypassa cache
  },
})
```

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

### Cache non aggiornato

- Usa il query parameter `sbToken` per byppassare la cache
- O accedi a `/api/storyblok/clearCache` per svuotare manualmente

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
