import { useRuntimeConfig } from "#imports";
export const purgeCloudflareCache = async (purgeEverything = true, files) => {
  const config = useRuntimeConfig();
  const { zoneID, apiKey } = config?.gothamstoryblok?.cloudflare || {};
  if (!zoneID || !apiKey) {
    console.log("Cloudflare cache purge skipped: missing zoneID/apiKey");
    return null;
  }
  try {
    const body = purgeEverything ? { purge_everything: true } : { files };
    return await $fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneID}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        body
      }
    );
  } catch (error) {
    console.error("Error purging Cloudflare cache", error);
    return null;
  }
};
