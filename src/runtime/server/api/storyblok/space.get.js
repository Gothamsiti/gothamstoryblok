import { space } from '../../utils/storyblok';
const config = useRuntimeConfig();
export default defineCachedEventHandler(async (event) => {
    return await space();
},{
    maxAge: config.maxAge,
    group: 'gothamstoryblok',
    shouldInvalidateCache : (e) => {
        const query = getQuery(e);
        const bypass = query.sbToken != undefined;
        return bypass;
    }
})