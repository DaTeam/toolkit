import {
    addRange,
    clearCollection,
    removeAt
} from './toolkit';

describe('array functions', () => {
    describe('addRange', () => {
        it('should have the source array concatenated with the new range', () => {
            const src1 = [1, 2, 3];
            const src2: any[] = [];
            const range = [4, 5, 6];
            const expectedResult1 = [...src1, ...range];
            const expectedResult2 = [...src2, ...range];

            addRange(src1, range);
            addRange(src2, range);
            expect(src1).toEqual(expectedResult1);
            expect(src2).toEqual(expectedResult2);
        });
        it('should throw if passed anything else than an array', () => {
            const typelessAddRange: any = addRange;

            expect(() => addRange([], '' as any)).toThrow();
            expect(() => addRange('' as any, [])).toThrow();
            expect(() => typelessAddRange()).toThrow();
            expect(() => typelessAddRange([])).toThrow();
        });
    });
    describe('clearCollection', () => {
        it('should empty any array provided', () => {
            const src1 = [1, 2, 3];
            const src2: any[] = [];

            clearCollection(src1);
            clearCollection(src2);
            expect(src1.length).toBe(0);
            expect(src2.length).toBe(0);
        });
        it('should throw if passed anything else than an array', () => {
            const typelessClearCollection: any = clearCollection;

            expect(() => typelessClearCollection()).toThrow();
            expect(() => typelessClearCollection({})).toThrow();
            expect(() => typelessClearCollection('')).toThrow();
            expect(() => typelessClearCollection(2)).toThrow();
        });
    });

    // diffCollection
    // compareCollection
    // findIndex
    // find
    // orderBy
    // sortByProperty
    // countCollection
    // removeFromCollection
    // removeAt
    // replaceAt
    // replaceCollectionItem

    describe('removeAt', () => {
        it('should empty any array provided', () => {
            const src1 = [1, 2, 3];
            const src2 = [1, 2, 3];
            const src3: any[] = [];

            removeAt(src1, 0);
            removeAt(src2, 2);
            removeAt(src3, 1);
            expect(src1).toEqual([2, 3]);
            expect(src2).toEqual([1, 2]);
            expect(src3).toEqual([]);
        });
        it('should throw if passed anything else than an array', () => {
            const typelessRemoveAt: any = removeAt;

            expect(() => typelessRemoveAt()).toThrow();
            expect(() => typelessRemoveAt({})).toThrow();
            expect(() => typelessRemoveAt('')).toThrow();
            expect(() => typelessRemoveAt(2)).toThrow();
        });
        it('should throw if a valid index is not provided', () => {
            const typelessRemoveAt: any = removeAt;

            expect(() => typelessRemoveAt([1, 2, 3])).toThrow();
            expect(() => typelessRemoveAt([1, 2, 3], '')).toThrow();
            expect(() => typelessRemoveAt([1, 2, 3], null)).toThrow();
        });
    });
});