export const DEFAULT_CONTEXT: NormalizerContext = {
    marker: false,
    markerMarkProperty: '__mark__',
    markerValueProperty: '__value__',
    markerUnknownMark: 'throw',
};

export interface NormalizerContext {
    marker: boolean,
    markerMarkProperty: string,
    markerValueProperty: string,
    markerUnknownMark: 'throw' | 'ignore' | 'ignore_raw' | 'fallback',
}
