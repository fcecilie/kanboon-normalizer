import { ArrayModule, DateModule, Normalizer, ObjectModule } from '../../src';

describe('Normalizer passing modules', () => {
    test('constructor modules array', () => {
        const modules = [new ObjectModule(), new ArrayModule()];
        const normalizer = new Normalizer(modules);

        expect(normalizer.modules).toStrictEqual({
            '0': modules,
        });
    });

    test('constructor modules object', () => {
        const modules = {
            '-100': [new ObjectModule()],
            0: [new ArrayModule()],
            50: [new DateModule()],
        };
        const normalizer = new Normalizer(modules);

        expect(normalizer.modules).toStrictEqual(modules);
    });

    test('addModule()', () => {
        const arrayModule = new ArrayModule();
        const objectModule = new ArrayModule();
        const dateModule = new DateModule();

        const normalizer = new Normalizer();
        normalizer
            .addModule(objectModule, -100)
            .addModule(arrayModule, -100)
            .addModule(dateModule, 50)
        ;

        expect(normalizer.modules).toStrictEqual({
            '-100': [objectModule, arrayModule],
            50: [dateModule],
        });
    });
});
