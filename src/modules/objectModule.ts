import { NormalizerModule } from '../normalizerModule';
import { Normalizer } from '../normalizer';

export class ObjectModule extends NormalizerModule {
    constructor({
        marker = 'ObjectModule',
    }: Record<any, any> = {}) {
        super({ marker });
    }

    supportsNormalization(data: any): boolean {
        return data !== null && typeof data === 'object' && !Array.isArray(data);
    }

    supportsDenormalization(data: any): boolean {
        return this.supportsNormalization(data);
    }

    normalize(data: Record<string, any>, context: Record<string, any>, normalizer: Normalizer): Record<string, any> {
        return Object.keys(data).reduce<Record<string, any>>((acc, key) => {
            acc[key] = normalizer.normalize(data[key], context);
            return acc;
        }, {});
    }

    denormalize(data: Record<string, any>, context: Record<string, any>, normalizer: Normalizer): Record<string, any> {
        return Object.keys(data).reduce<Record<string, any>>((acc, key) => {
            acc[key] = normalizer.denormalize(data[key], context);
            return acc;
        }, {});
    }
}
