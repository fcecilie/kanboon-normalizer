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
        const objectModule = new ObjectModule();
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

describe('Normalization', () => {
    test('no module found, return as is', () => {
        const arrayModule = new ArrayModule();

        const arraySupportsNormalization = jest.spyOn(arrayModule, 'supportsNormalization');

        const normalizer = new Normalizer([arrayModule]);

        const data = new Date();

        const normalizedData = normalizer.normalize(data);

        expect(arraySupportsNormalization).toHaveBeenCalled();
        expect(normalizedData).toStrictEqual(data);
    });

    test('short circuit supportsNormalization', () => {
        const arrayModule = new ArrayModule();
        const objectModule = new ObjectModule();
        const dateModule = new DateModule();

        const arraySupportsNormalization = jest.spyOn(arrayModule, 'supportsNormalization');
        const objectSupportsNormalization = jest.spyOn(objectModule, 'supportsNormalization');
        const dateSupportsNormalization = jest.spyOn(dateModule, 'supportsNormalization');

        const normalizer = new Normalizer([dateModule, objectModule, arrayModule]);

        const data = new Date();

        normalizer.normalize(data);

        expect(dateSupportsNormalization).toHaveBeenCalled();
        expect(arraySupportsNormalization).not.toHaveBeenCalled();
        expect(objectSupportsNormalization).not.toHaveBeenCalled();
    });
});

describe('Denormalization', () => {
    const arrayModule = new ArrayModule();
    const objectModule = new ObjectModule();
    const dateModule = new DateModule();

    const arraySupportsDenormalization = jest.spyOn(arrayModule, 'supportsDenormalization');
    const objectSupportsDenormalization = jest.spyOn(objectModule, 'supportsDenormalization');
    const dateSupportsDenormalization = jest.spyOn(dateModule, 'supportsDenormalization');

    const normalizer = new Normalizer([dateModule, objectModule, arrayModule]);

    beforeEach(() => {
        arraySupportsDenormalization.mockClear();
        objectSupportsDenormalization.mockClear();
        dateSupportsDenormalization.mockClear();
    });

    test('no module found, return as is', () => {
        const normalizedData = 42;
        const data = normalizer.denormalize(normalizedData);

        expect(arraySupportsDenormalization).toHaveBeenCalled();
        expect(objectSupportsDenormalization).toHaveBeenCalled();
        expect(dateSupportsDenormalization).toHaveBeenCalled();

        expect(data).toStrictEqual(normalizedData);
    });

    test('short circuit supportsDenormalization', () => {
        const normalizedData = '2025-12-15T11:22:30.000Z';
        normalizer.denormalize(normalizedData);

        expect(arraySupportsDenormalization).not.toHaveBeenCalled();
        expect(objectSupportsDenormalization).not.toHaveBeenCalled();
        expect(dateSupportsDenormalization).toHaveBeenCalled();
    });
});

describe('Markers', () => {
    test('normalization with marker', () => {
        const normalizer = new Normalizer([new DateModule(), new ObjectModule(), new ArrayModule()]);

        const data = new Date();
        const normalizedData = normalizer.normalize(data, { marker: true });

        expect(normalizedData).toStrictEqual({
            __mark__: 'DateModule',
            __value__: data.toISOString(),
        });
    });

    test('normalization with marker and custom properties', () => {
        const normalizer = new Normalizer([new DateModule(), new ObjectModule(), new ArrayModule()]);

        const data = new Date();
        const normalizedData = normalizer.normalize(data, {
            marker: true,
            markerMarkProperty: '__my_mark__',
            markerValueProperty: '__my_value__',
        });

        expect(normalizedData).toStrictEqual({
            __my_mark__: 'DateModule',
            __my_value__: data.toISOString(),
        });
    });

    test('denormalization with marker', () => {
        const normalizer = new Normalizer([new DateModule(), new ObjectModule(), new ArrayModule()]);

        const date = new Date();
        const normalizedData = {
            __mark__: 'DateModule',
            __value__: date.toISOString(),
        };

        const data = normalizer.denormalize(normalizedData, { marker: true });

        expect(data).toStrictEqual(date);
    });

    test('denormalization with marker and custom properties', () => {
        const normalizer = new Normalizer([new DateModule(), new ObjectModule(), new ArrayModule()]);

        const date = new Date();
        const normalizedData = {
            __my_mark__: 'DateModule',
            __my_value__: date.toISOString(),
        };

        const data = normalizer.denormalize(normalizedData, {
            marker: true,
            markerMarkProperty: '__my_mark__',
            markerValueProperty: '__my_value__',
        });

        expect(data).toStrictEqual(date);
    });

    test('denormalization with unknown marker (throw)', () => {
        const normalizer = new Normalizer([new DateModule(), new ObjectModule(), new ArrayModule()]);

        const normalizedData = {
            __mark__: 'UnknownModule',
            __value__: (new Date()).toISOString(),
        };

        expect(() => {
            normalizer.denormalize(normalizedData, { marker: true });
        }).toThrow('No module "UnknownModule" found.');
    });

    test('denormalization with unknown marker (ignore_raw)', () => {
        const normalizer = new Normalizer([new DateModule(), new ObjectModule(), new ArrayModule()]);

        const normalizedData = {
            __mark__: 'UnknownModule',
            __value__: (new Date()).toISOString(),
        };

        const data = normalizer.denormalize(normalizedData, { marker: true, markerUnknownMark: 'ignore_raw' });

        expect(data).toStrictEqual(normalizedData);
    });

    test('denormalization with unknown marker (ignore)', () => {
        const normalizer = new Normalizer([new DateModule(), new ObjectModule(), new ArrayModule()]);

        const normalizedData = {
            __mark__: 'UnknownModule',
            __value__: (new Date()).toISOString(),
        };

        const data = normalizer.denormalize(normalizedData, { marker: true, markerUnknownMark: 'ignore' });

        expect(data).toStrictEqual(normalizedData['__value__']);
    });

    test('denormalization with unknown marker (fallback)', () => {
        const normalizer = new Normalizer([new DateModule(), new ObjectModule(), new ArrayModule()]);

        const date = new Date();
        const normalizedData = {
            __mark__: 'UnknownModule',
            __value__: date.toISOString(),
        };

        const data = normalizer.denormalize(normalizedData, { marker: true, markerUnknownMark: 'fallback' });

        expect(data).toStrictEqual(date);
    });
});
