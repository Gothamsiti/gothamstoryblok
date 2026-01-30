import { useRuntimeConfig } from '#imports';
export const useGoogleTagManager = () => {
    if(import.meta.server){
		const config = useRuntimeConfig();
		const { analyticsID } = config?.gothamstoryblok;
		if(analyticsID){
			useHead({
				script : [
					{
						src:`https://www.googletagmanager.com/gtag/js?id=${analyticsID}`,
						type: 'text/javascript',
						async:true,
						body:true,
					},
					{
						innerHTML:`
							window.dataLayer = window.dataLayer || [];
							function gtag(){dataLayer.push(arguments);}
							gtag('js', new Date());
							gtag('config', '${analyticsID}');
						`,
						type: 'text/javascript',
					},
					
				]
			})
		}
    }
}