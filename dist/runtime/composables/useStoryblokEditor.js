export const useStoryblokEditor = () => {
  const route = useRoute()
  const sbEditor = useState('sbEditor', () => {
    return false
  })
  sbEditor.value = Object.keys(route.query)?.includes('_storyblok_tk[space_id]')
  return { sbEditor }
}
