import { createJiti } from "file:///Users/robertosilvestri/Sites/starkIndustries/gothamStoryblok/node_modules/.pnpm/jiti@2.7.0/node_modules/jiti/lib/jiti.mjs";

const jiti = createJiti(import.meta.url, {
  "interopDefault": true,
  "alias": {
    "gothamstoryblok": "/Users/robertosilvestri/Sites/starkIndustries/gothamStoryblok"
  },
  "transformOptions": {
    "babel": {
      "plugins": []
    }
  }
})

/** @type {import("/Users/robertosilvestri/Sites/starkIndustries/gothamStoryblok/src/module.js")} */
const _module = await jiti.import("/Users/robertosilvestri/Sites/starkIndustries/gothamStoryblok/src/module.ts");

export default _module?.default ?? _module;