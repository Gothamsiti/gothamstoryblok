import { space } from '../../utils/storyblok';
export default defineCachedEventHandler(async (event) => {
    
    return await space();
},{
    maxAge: process.env.DEFAULT_EXPIRE,
    group: 'gothamstoryblok',
    shouldInvalidateCache : (e) => {
        const query = getQuery(e);
        const bypass = query.sbToken != undefined;
        return bypass;
    }
})