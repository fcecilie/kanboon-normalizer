import { NormalizerModule } from '../normalizerModule';

export class DateModule extends NormalizerModule {
    constructor({
        marker = 'DateModule',
    }: Record<any, any> = {}) {
        super({ marker });
    }

    supportsNormalization(data: any): boolean {
        return data instanceof Date;
    }

    supportsDenormalization(data: any): boolean {
        return typeof data === 'string' && !isNaN(Date.parse(data));
    }

    normalize(data: Date): string {
        return data.toISOString();
    }

    denormalize(data: string): Date {
        return new Date(Date.parse(data));
    }
}
