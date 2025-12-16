import { Normalizer } from './normalizer';

export abstract class NormalizerModule {
    marker: string | undefined

    constructor({
        marker = undefined,
    }: Record<any, any> = {}) {
        this.marker = marker;
    }

    abstract supportsNormalization(data: any, context: Record<string, any>, normalizer: Normalizer): boolean;
    abstract supportsDenormalization(data: any, context: Record<string, any>, normalizer: Normalizer): boolean;

    abstract normalize(data: any, context: Record<string, any>, normalizer: Normalizer): any;
    abstract denormalize(data: any, context: Record<string, any>, normalizer: Normalizer): any;
}
