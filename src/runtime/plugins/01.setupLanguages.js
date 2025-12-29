export default defineNuxtPlugin({
    name : 'setuplanguages',
    parallel : false,
    async setup(nuxtApp){
        const { languages, currentLanguage, defaultLanguage, slugList } = useLanguage();
        const route = useRoute();
        const {fullslug} = route.params;
        currentLanguage.value = fullslug && fullslug[0] ? fullslug[0] : undefined;
        if(import.meta.server){
            try {
                const space = await $fetch('/api/storyblok/space');
                languages.value = space.available_languages;
                defaultLanguage.value = space.default_language;
                if(currentLanguage.value?.length != 2) currentLanguage.value = defaultLanguage.value;
            } catch (error) {
                console.log(error);
                throw createError({ statusCode: 500, statusMessage: 'Error setupLanguage plugin'});
            }
        }
        if(currentLanguage.value?.length != 2) currentLanguage.value = defaultLanguage.value;
    }
})