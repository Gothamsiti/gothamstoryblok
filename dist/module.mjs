import { createJiti } from "file:///Users/umbe/projects/gothamstoryblok/node_modules/.pnpm/jiti@2.6.1/node_modules/jiti/lib/jiti.mjs";

const jiti = createJiti(import.meta.url, {
  "interopDefault": true,
  "alias": {
    "gothamstoryblok": "/Users/umbe/projects/gothamstoryblok"
  },
  "transformOptions": {
    "babel": {
      "plugins": []
    }
  }
})

/** @type {import("/Users/umbe/projects/gothamstoryblok/src/module.js")} */
const _module = await jiti.import("/Users/umbe/projects/gothamstoryblok/src/module.ts");

export default _module?.default ?? _module;