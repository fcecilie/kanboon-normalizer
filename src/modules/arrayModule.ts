import { NormalizerModule } from '../normalizerModule';
import { Normalizer } from '../normalizer';

export class ArrayModule extends NormalizerModule {
    constructor({
        marker = 'ArrayModule',
    }: Record<any, any> = {}) {
        super({ marker });
    }

    supportsNormalization(data: any): boolean {
        return typeof data === 'object' && Array.isArray(data);
    }

    supportsDenormalization(data: any): boolean {
        return this.supportsNormalization(data);
    }

    normalize(data: any[], context: Record<string, any>, normalizer: Normalizer): any[] {
        return data.map((item: any) => normalizer.normalize(item, context));
    }

    denormalize(data: any[], context: Record<string, any>, normalizer: Normalizer): any[] {
        return data.map((item: any) => normalizer.denormalize(item, context));
    }
}
