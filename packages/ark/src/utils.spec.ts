import { computeOptions } from './index';

describe('utils', () => {
    describe('internalOptions', () => {
        it('should return the options correctly merged', () => {
            const internalOptions = {
                enabled: true,
                format: 'DEFAULT_FORMAT',
                ascending: true,
                predicate: null
            };
            const externalOptions = {
                enabled: false,
                format: 'NEW_FORMAT'
            };
            const output = {
                enabled: false,
                format: 'NEW_FORMAT',
                ascending: true,
                predicate: null
            };
            const internalOptionsBackup = { ...internalOptions };
            const externalOptionsBackup = { ...externalOptions };

            expect(computeOptions(internalOptions, externalOptions)).toEqual(output);
            expect(internalOptions).toEqual(internalOptionsBackup);
            expect(externalOptions).toEqual(externalOptionsBackup);
        });

        it('should not return invalid options contained in external ones', () => {
            const internalOptions = {
                enabled: true,
                format: 'DEFAULT_FORMAT',
                ascending: true,
                predicate: null
            };
            const externalOptions = {
                enabled: false,
                format: 'NEW_FORMAT',
                invalidOption: true,
                wrongOption: 'yes',
                ascending: undefined
            };
            const output = {
                enabled: false,
                format: 'NEW_FORMAT',
                ascending: true,
                predicate: null
            };
            const internalOptionsBackup = { ...internalOptions };
            const externalOptionsBackup = { ...externalOptions };

            expect(computeOptions(internalOptions, externalOptions)).toEqual(output);
            expect(internalOptions).toEqual(internalOptionsBackup);
            expect(externalOptions).toEqual(externalOptionsBackup);
        });

        it('should throw if passed nothing or anything else than objects as parameters', () => {
            const typelessComputeOptions: any = computeOptions;

            expect(() => typelessComputeOptions()).toThrow();
            expect(() => typelessComputeOptions(42)).toThrow();
            expect(() => typelessComputeOptions([], '' as any)).toThrow();
        });
    });
});
