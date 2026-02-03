export function useSizes(): {
    reference: any;
    sizes: any;
    scroll: any;
    observe: (el: any, fn: any) => void;
    mw: (size: any) => number;
    mh: (size: any) => number;
    init: () => void;
};
