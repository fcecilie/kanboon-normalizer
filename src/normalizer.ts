import { NormalizerModule } from './normalizerModule';
import { DEFAULT_CONTEXT } from './normalizerContext';

export class Normalizer {
    modules: Record<number, NormalizerModule[]>;

    constructor(modules: NormalizerModule[] | Record<number, NormalizerModule[]> = []) {
        this.modules = {};
        if (Array.isArray(modules)) {
            modules.forEach((module) => this.addModule(module));
        } else if (typeof modules === 'object') {
            for (const modulesPriority in modules) {
                modules[modulesPriority].forEach((module) => this.addModule(module, Number(modulesPriority)));
            }
        } else {
            throw new Error('Invalid parameter "modules".');
        }
    }

    addModule(module: NormalizerModule, priority: number = 0): this {
        if (!this.modules[priority]) {
            this.modules[priority] = [];
        }

        this.modules[priority].push(module);
        return this;
    }

    normalize<T = any>(data: any, context: Record<string, any> = {}): T {
        const currentContext = Object.assign({}, DEFAULT_CONTEXT, context);
        const priorities = Object.keys(this.modules).map((stringKey) => Number(stringKey)).sort((a, b) => b - a);

        let module: NormalizerModule | undefined = undefined;
        for (let i = 0; !module && i < priorities.length; i++) {
            const priority = priorities[i];
            module = this.modules[priority].find((module: NormalizerModule) => module.supportsNormalization(data, currentContext, this));
        }

        if (!(module instanceof NormalizerModule)) {
            return data as T;
        }

        const value = module.normalize(data, currentContext, this);

        if (currentContext.marker) {
            return {
                [currentContext.markerMarkProperty]: module.marker,
                [currentContext.markerValueProperty]: value,
            } as T;
        }

        return value as T;
    }

    denormalize<T = any>(data: any, context: Record<string, any> = {}): T {
        const currentContext = Object.assign({}, DEFAULT_CONTEXT, context);
        const priorities = Object.keys(this.modules).map((stringKey) => Number(stringKey)).sort((a, b) => b - a);

        let value = data;
        let marker = undefined;
        if (currentContext.marker) {
            marker = data[currentContext.markerMarkProperty];
            if (marker) {
                value = data[currentContext.markerValueProperty];
            }
        }

        let module: NormalizerModule | undefined = undefined;

        if (marker) {
            for (let i = 0; !module && i < priorities.length; i++) {
                const priority = priorities[i];
                module = this.modules[priority].find((module: NormalizerModule) => module.marker === marker);
            }

            if (!module && currentContext.markerUnknownMark === 'throw') {
                throw new Error(`No module "${marker}" found.`);
            } else if (!module && currentContext.markerUnknownMark === 'ignore_raw') {
                return data;
            } else if (!module && currentContext.markerUnknownMark === 'ignore') {
                return value;
            }
        }

        if (module instanceof NormalizerModule) {
            return module.denormalize(value, currentContext, this) as T;
        }

        for (let i = 0; !module && i < priorities.length; i++) {
            const priority = priorities[i];
            module = this.modules[priority].find((module: NormalizerModule) => module.supportsDenormalization(value, currentContext, this));
        }

        if (module instanceof NormalizerModule) {
            return module.denormalize(value, currentContext, this) as T;
        }

        return value as T;
    }
}
