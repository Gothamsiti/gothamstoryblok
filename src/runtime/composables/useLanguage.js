import { useState } from '#app'

export const useLanguage = () => {
  const languages = useState('languages', () => undefined)
  const currentLanguage = useState('currentLanguage', () => undefined)
  const defaultLanguage = useState('defaultLanguage', () => undefined)
  const slugList = useState('slugList', () => [])

  return {
    languages,
    currentLanguage,
    defaultLanguage,
    slugList,
  }
}
