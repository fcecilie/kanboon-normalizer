import { DateModule } from './modules/dateModule';
import { ArrayModule } from './modules/arrayModule';
import { ObjectModule } from './modules/objectModule';
import { Normalizer } from './normalizer';

export { Normalizer } from './normalizer';
export { ArrayModule } from './modules/arrayModule';
export { ObjectModule } from './modules/objectModule';
export { DateModule } from './modules/dateModule';
export { NormalizerModule } from './normalizerModule';
export type { NormalizerContext } from './normalizerContext';

export const normalizer = new Normalizer({
    '-100': [new ArrayModule(), new ObjectModule()],
    '-50': [new DateModule()],
});
