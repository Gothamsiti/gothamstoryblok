import { getAll } from '../../utils/storyblok';

const config = useRuntimeConfig();
export default defineCachedEventHandler(async(event) => {
    const query = getQuery(event);
    setHeader(event,'x-origin-url',event.node.req.url);
    return await getAll(query);
}, {
    maxAge: config.maxAge,
    group: 'gothamstoryblok',
    shouldInvalidateCache : (e) => {
        const query = getQuery(e);
        const bypass = query.sbToken != undefined;
        return bypass;
    }
});