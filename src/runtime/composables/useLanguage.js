import { useState } from '#app';
export const useLanguage = () => {
    const languages = useState('languages', () => { return undefined })
    const currentLanguage = useState('currentLanguage', () => { return undefined })
    const defaultLanguage = useState('defaultLanguage', () => { return undefined })
    const slugList = useState('slugList',() => []);

    return {
        languages,
        currentLanguage,
        defaultLanguage,
        slugList
    }
}