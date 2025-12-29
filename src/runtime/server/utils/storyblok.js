import { createError } from 'h3'
const config = useRuntimeConfig();
const request = async (query) => {
    try {
        const defaultLanguage = config.defaultLanguage || 'it';
        const cv = Date.now();
        const { find_by, returntotal, isEditor } = query;
        if(returntotal) delete query.returntotal;
        if(isEditor) delete query.isEditor;
        const params = {
            cv,
            version: config.gothamstoryblok.version,
            token: config.gothamstoryblok.key,
            find_by
        }
        if(query.language && query.language != defaultLanguage){
            params.language = query.language;
        }  
        if(query.resolve_relations){
            params.resolve_relations = query.resolve_relations
        }
        if(query.fullSlug){
            await checkFullSlug(query.fullSlug)

            const data = await $fetch(`https://api.storyblok.com/v2/cdn/stories/${query.fullSlug}`,{method:'GET',query:params});

            const { story, rels } = data;
            
            if(params.resolve_relations) return { story, rels };
            return story;
        }
    
        let {_data:data,headers} = await $fetch.raw('https://api.storyblok.com/v2/cdn/stories',{
            query: {
                cv,
                version: config.gothamstoryblok.version,
                token: config.gothamstoryblok.key,
                ...query
            }
        });
        const perPage = parseInt(headers.get('per-page'))
        const total = parseInt(headers.get('total'))
        let { stories, rels } = data;
        if(!isEditor || isEditor === 'false') stories = stories.filter(s => !s?.content?.metadata?.disbledforlanguage);
    
        let res = stories;
        if(returntotal) res = { stories, perPage, total }
        if(rels.length){
            if(returntotal){
                res.rels = rels;
            }else{
                res = { stories, rels }
            }
        }

        return res;
    } catch (error) {
        throw error;
    }

}

const space = async () => {
    const data = await $fetch(`https://api.storyblok.com/v2/cdn/spaces/me`,{
        query:{
            token:config.gothamstoryblok.key
        }
    });

    const {space} = data;
    const available_languages = [...space.language_codes, config.defaultLanguage || 'it']
    space.available_languages = available_languages;
    space.default_language = config.defaultLanguage || 'it'
    delete space.language_codes;
    return space;
}

const getAll = async (params, entity, ignoreFlush = false) => {
    const allStories = [];
    const requestParams = {
        ...params,
        returntotal: true,
        per_page: 100
    }

    const getStories = async (page = 1, allStories = []) => {
        try {
            const { stories, total } = await request(requestParams);
            allStories.push(...stories)
            if (allStories.length  === 100) {
                return getStories(page + 1, allStories)
            }
            return allStories
        } catch (error) {
            return error
        }
    }
    
    try {
        return await getStories();
    } catch (error) {
        return error
    }
}

const links = async (query) => {
    const cv = Date.now();
    try {
        const {links} = await $fetch('https://api.storyblok.com/v2/cdn/links',{
                query : {
                    cv,
                    version: config.gothamstoryblok.version,
                    token: config.gothamstoryblok.key,
                    ...query
                }
            })
        return links;
    }catch(error){
        throw error;
    }
}

let linksList = undefined;
let linksListPromise = null;
const loadLinksList = async () => {
    if(linksList) return linksList;
    // Se un'altra richiesta la sta già caricando, aspetta quella
    if (!linksListPromise) {
        linksListPromise = (async () => {
            const result = {
                slug: {},
                uuid: {},
                id: {}
            };

            const links = await $fetch('/api/storyblok/links', { query: { per_page: 1000 } });
            for (const i in links) {
                const link = links[i];
                const slugParts = link.slug.split('/');
                const slug = slugParts[slugParts.length - 1];

                if (!result.slug[slug]) result.slug[slug] = link;
                if (!result.uuid[link.uuid]) result.uuid[link.uuid] = link;
                if (!result.id[link.id]) result.id[link.id] = link;
            }

            linksList = result;
            linksListPromise = null; // reset per richieste future
            return result;
        })();
    }

    return linksListPromise;
}


const checkFullSlug = async (fullSlug) => {
    const cachedLinks = await loadLinksList();

    const slugs = fullSlug.split('/');
    const slug = slugs[slugs.length - 1];
    if (!(cachedLinks.slug[slug] || cachedLinks.id[slug] || cachedLinks.uuid[slug])) {
        throw createError({ statusCode: 404, message: 'Not found (fullSlug)' });
    }
}

const clearLinks = () => {
    linksList = undefined;
    linksListPromise = null;
}

export { request, space, getAll, links, clearLinks }