import {
    objectDefinedPropsOnly
} from './toolkit';

describe('object functions', () => {
    describe('objectEnumerablePropsOnly', () => {
        it('should remove non enumarable props', () => {
            const internalOptions = {
                enabled: true,
                format: 'DEFAULT_FORMAT',
                invalidOption: undefined,
                ascending: true,
                predicate: null
            };
            const output = {
                enabled: true,
                format: 'DEFAULT_FORMAT',
                ascending: true,
                predicate: null
            };
            const internalOptionsBackup = { ...internalOptions };

            expect(objectDefinedPropsOnly(internalOptions)).toEqual(output);
            expect(internalOptions).toEqual(internalOptionsBackup);
        });
    });

});