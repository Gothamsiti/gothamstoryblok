declare const _default: import("#app").Plugin<{
    __url: (u: any) => any;
    __parseEndpoint: () => {
        endpoint: undefined;
        language?: undefined;
        version?: undefined;
    } | {
        endpoint: any;
        language: any;
        version: any;
    };
    __filename: (str: any) => any;
    __formatDate: (d: any) => string;
    __clearCache: (query: any) => Promise<void>;
}> & import("#app").ObjectPlugin<{
    __url: (u: any) => any;
    __parseEndpoint: () => {
        endpoint: undefined;
        language?: undefined;
        version?: undefined;
    } | {
        endpoint: any;
        language: any;
        version: any;
    };
    __filename: (str: any) => any;
    __formatDate: (d: any) => string;
    __clearCache: (query: any) => Promise<void>;
}>;
export default _default;
