import {
    getPropertySafe,
    isArray,
    isDefined,
    isFunction,
    isObjectLike,
    isString,
    isValidNumber
} from './core';

const ArrayProto = Array.prototype;

type DiffOptions = {
    objectKey?: string;
    predicate?: (item: any, array: any[]) => boolean;
    format?: (item: any) => any;
    alternativeFormat?: (item: any) => any;
};

export const addRange = (src: any[], newElements: any[]) => {
    if (!isArray(src)) throw new TypeError('src param is not valid');
    if (!isArray(newElements)) throw new TypeError('newElements param is not valid');

    ArrayProto.push.apply(src, newElements);
};

export const clearCollection = (collection: any[]) => {
    if (!isArray(collection)) throw new TypeError('collection is not valid');

    collection.splice(0, collection.length);
};

export const diffCollection = (
    array: any[],
    values: any[],
    options?: DiffOptions
): any[] => {
    const result: any[] = [];

    if (!isArray(array) || !isArray(values) || !array.length) return result;

    const internalOptions = options || {};
    const {
        objectKey,
        predicate,
        format,
        alternativeFormat
    } = internalOptions;

    let comparator: (item: any, array: any[]) => boolean;

    if (isFunction(predicate)) comparator = predicate;
    else comparator = (item, collection) => collection.includes(item);

    array.forEach(obj => {
        let transformedValue = obj;
        if (isString(objectKey)) transformedValue = transformedValue[objectKey];

        if (isFunction(format)) transformedValue = format(transformedValue);

        if (comparator(transformedValue, values) === false) {
            if (isFunction(alternativeFormat)) {
                transformedValue = obj;
                if (isString(objectKey)) transformedValue = transformedValue[objectKey];

                transformedValue = alternativeFormat(transformedValue);

                if (comparator(transformedValue, values)) return;
            }

            result.push(obj);
        }
    });

    return result;
};

export const compareCollection = (
    array: any[],
    values: any[],
    options?: DiffOptions
): any[] => {
    const result: any[] = [];

    result.push(...diffCollection(array, values, options));
    result.push(...diffCollection(values, array, options));

    return result;
};

export const findIndex = <T>(array: T[], predicate: (item: T, index: number) => boolean) => {
    if (!isArray(array)) return -1;

    for (let idx = 0; idx < array.length; idx++) {
        if (predicate(array[idx], idx) === true) return idx;
    }

    return -1;
};

export const find = <T>(array: T[], predicate: (item: T, index: number) => boolean) => {
    if (!isArray(array)) return null;

    for (let idx = 0; idx < array.length; idx++) {
        if (predicate(array[idx], idx) === true) return array[idx];
    }

    return null;
};

export const orderBy = <T>(
    array: T[],
    propertyAccessor: string,
    options?: { nullFirst?: boolean; ascending?: boolean }
): void => {
    if (!isArray(array) || !isString(propertyAccessor)) {
        throw new Error(`Toolkit -> ${orderBy.name}: invalid parameters.`);
    }

    const internalOptions = { nullFirst: false, ascending: true };
    if (isDefined(options) && isObjectLike(options)) {
        if (options.nullFirst === true) internalOptions.nullFirst = true;
        if (options.ascending === false) internalOptions.ascending = false;
    }

    const nullOrderValue = internalOptions.nullFirst ? -1 : 1;
    const ascOrderValue = internalOptions.ascending ? 1 : -1;

    array.sort((itemA, itemB) => {
        const aProperty = getPropertySafe(itemA, propertyAccessor);
        const bProperty = getPropertySafe(itemB, propertyAccessor);

        if (aProperty === null) return nullOrderValue * 1;
        if (bProperty === null) return nullOrderValue * -1;
        if (aProperty < bProperty) return ascOrderValue * -1;
        if (aProperty > bProperty) return ascOrderValue * 1;

        return 0;
    });
};

export const sortByProperty = <T = any, PropertyT = any>(
    array: T[],
    propertyAccessor: string,
    compareFn: (a: PropertyT, b: PropertyT) => number,
    options?: { nullFirst?: boolean, ascending?: boolean }
): void => {
    if (!isArray(array) || !isString(propertyAccessor) || !isFunction(compareFn)) {
        throw new Error(`Toolkit -> ${sortByProperty.name}: invalid parameters.`);
    }

    const internalOptions = { nullFirst: false, ascending: true };
    if (isDefined(options) && isObjectLike(options)) {
        if (options.nullFirst === true) internalOptions.nullFirst = true;
        if (options.ascending === false) internalOptions.ascending = false;
    }

    const nullOrderValue = internalOptions.nullFirst ? -1 : 1;
    const ascOrderValue = internalOptions.ascending ? 1 : -1;

    array.sort((aItem, bItem) => {
        const aProperty = getPropertySafe(aItem, propertyAccessor);
        const bProperty = getPropertySafe(bItem, propertyAccessor);

        if (aProperty === null) return nullOrderValue * 1;
        if (bProperty === null) return nullOrderValue * -1;

        return ascOrderValue * compareFn(aProperty, bProperty);
    });
};

export const countCollection = <T>(
    array: T[],
    predicate: (item: T, index: number) => boolean
): number => {
    if (!isArray(array)) return -1;

    if (!isFunction(predicate)) return array.length;

    let count = 0;
    for (let idx = 0; idx < array.length; idx++) {
        if (predicate(array[idx], idx) === true) count += 1;
    }

    return count;
};

export const removeFromCollection = <T>(
    array: T[],
    predicate: (item: T, index: number) => boolean
): boolean => {
    if (!isArray(array)) return false;
    if (!isFunction(predicate)) return false;

    for (let idx = 0; idx < array.length;) {
        if (predicate(array[idx], idx) === true) array.splice(idx, 1);
        else idx += 1;
    }

    return true;
};

export const removeAt = <T>(array: T[], index: number): void => {
    if (!isArray(array)) throw new TypeError('array is not valid');
    if (!isValidNumber(index)) throw new TypeError('index is not valid');

    array.splice(index, 1);
};

export const insertAt = <T>(array: T[], index: number, item: T): void => {
    if (!isArray(array)) return;

    array.splice(index, 0, item);
};

export const replaceAt = <T>(array: T[], index: number, item: T): void => {
    if (!isArray(array)) return;

    array.splice(index, 1, item);
};

export const replaceCollectionItem = <T>(array: T[], item: T, predicate: (item: T, index: number) => boolean): void => {
    if (!isArray(array)) return;
    if (!isFunction(predicate)) return;

    const indexToReplace = array.reduce((acc, value, index) => {
        if (predicate(value, index)) acc.push(index);

        return acc;
    }, [] as number[]);

    indexToReplace.forEach(index => array.splice(index, 1, item));
};

export const take = <T>(array: T[], count: number, from: number = 0): T[] => {
    if (!isArray(array)) throw new TypeError('array is not valid');
    if (!isValidNumber(count)) throw new TypeError('count is not valid');
    if (!isValidNumber(from)) throw new TypeError('from is not valid');

    return array.slice(from, from + count);
};

export const filterDefined = <T>(array: T[]): T[] => {
    if (!isArray(array)) throw new TypeError('array is not valid');

    return array.filter(isDefined);
};

export const unique = <T>(array: T[]): T[] => {
    if (!isArray(array) || !array.length) return [];

    return array.filter((item, idx, src) => src.indexOf(item) === idx);
};