export default defineEventHandler(async event => {
    const cacheStorage = useStorage('cache:gothamstoryblok:_');
    const cachedKeys = await cacheStorage.getKeys();
	const promises = cachedKeys.map(async c => {
		const item = await cacheStorage.getItem(c);
		return {
			name: c,
			...item
		}
	})
	const items = await Promise.all(promises);
	return items;
})