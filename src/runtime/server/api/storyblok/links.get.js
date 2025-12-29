import { links } from '../../utils/storyblok';

export default defineCachedEventHandler(async(event) => {
    const query = getQuery(event);
    setHeader(event,'x-origin-url',event.node.req.url);
    return await links(query);
}, {
    maxAge: process.env.DEFAULT_EXPIRE,
    group: 'gothamstoryblok',
    shouldInvalidateCache : (e) => {
        const query = getQuery(e);
        const bypass = query.sbToken != undefined;
        return bypass;
    },
});