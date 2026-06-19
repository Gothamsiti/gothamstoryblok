export function useAsyncGothamStoryblok(url: any, options: any, bridgeOptions: any, nocomponent?: boolean): Promise<{
    story?: undefined;
    stories?: undefined;
    rels?: undefined;
    refresh?: undefined;
} | {
    story: import("vue").Ref<any, any>;
    stories: import("vue").Ref<any, any>;
    rels: import("vue").Ref<any, any>;
    refresh: () => void;
}>;
