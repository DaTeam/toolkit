import { checkType, isArray, isDefined, isFunction, isNativeTypeObject, isNull, isNumber, isObjectLike, isString, isUndefined, isValidNumber, undef } from 'src/core';
import { Type } from 'src/types';

export const keysOfObject = <Source extends Object>(obj: Source): (keyof Source)[] => Object.keys(obj) as (keyof Source)[];

export const forEachProperty = <Source extends Object>(
    obj: Source,
    callbackfn: (value: any, key: keyof Source) => void
): void => keysOfObject(obj).forEach(key => callbackfn(obj[key], key));

export const mapEachProperty = <Source extends Object, MapItem>(
    obj: Source,
    callbackfn: (value: any, key: keyof Source) => MapItem
): Record<keyof Source, MapItem> => {
    const copy: Record<keyof Source, any> = { ...obj };

    keysOfObject(copy).forEach(key => { copy[key] = callbackfn(copy[key], key); });

    return copy;
};

export const mapProperties = <Source extends Object, MapItem>(
    obj: Source,
    callbackfn: (value: any, key: keyof Source) => MapItem
): MapItem[] => keysOfObject(obj).map(key => callbackfn(obj[key], key));


export const hasProperty = <T>(obj: T, prop: any): prop is keyof T => {
    if (!isObjectLike(obj)) throw new TypeError('obj is not valid');
    if (!isString(prop) && !isNumber(prop)) throw new TypeError('prop is not valid');

    return Object.prototype.hasOwnProperty.call(obj, prop);
};

export const propertyIsEnumerable = <T, K extends keyof T>(obj: T, prop: K): boolean => {
    if (!isObjectLike(obj)) throw new TypeError('obj is not valid');
    if (!isString(prop) && !isValidNumber(prop)) throw new TypeError('prop is not valid');

    return Object.prototype.propertyIsEnumerable.call(obj, prop);
};

// Encapsulate the idea of passing a new object as the first parameter
// to Object.assign to ensure we correctly copy data instead of mutating
export const pureObjectAssign = (...values: any[]): any | null => {
    if (!isArray(values)) return null;

    const actualObjects = values.reduce((acc, val) => {
        if (isObjectLike(val)) acc.push(val);

        return acc;
    }, []);

    if (actualObjects.length === 0) return null;

    return Object.assign({}, ...actualObjects);
};

// An alternative version of pureObjectAssign which ignores undefined values
// It only applys to object's first level properties
export const pureObjectExtend = (...values: any[]): any | null => {
    if (!isArray(values)) return null;

    const actualObjects = values.reduce((acc, val) => {
        if (isObjectLike(val)) acc.push(objectDefinedPropsOnly(val));

        return acc;
    }, []);

    if (actualObjects.length === 0) return null;

    // actualObjects.forEach((obj: Object) => {
    //     (obj as Object).forEachProperty((value, key) => {
    //         if (value === undef) delete (obj as Record<string, any>)[key];
    //     });
    // });

    return pureObjectAssign(...actualObjects);
};

export const objectDefinedPropsOnly = <T>(obj: T): Partial<T> => {
    if (!isObjectLike(obj)) throw new TypeError('obj is not valid');

    return Object.defineProperties(
        {},
        Object.assign(
            {},
            ...(Object.keys(obj) as (keyof T)[])
                .filter(key => propertyIsEnumerable(obj, key) && !isUndefined(obj[key]))
                .map(key => ({ [key]: Object.getOwnPropertyDescriptor(obj, key) }))
        )
    );
};

export const objectPick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    if (!isObjectLike(obj)) throw new TypeError('obj is not valid');
    if (!isArray(keys)) throw new TypeError('keys ares not valid');

    return Object.defineProperties(
        {},
        Object.assign(
            {},
            ...keys
                .filter(key => propertyIsEnumerable(obj, key))
                .map(key => ({ [key]: Object.getOwnPropertyDescriptor(obj, key) }))
        )
    );
};

export const objectPickStrict = <Shape, T>(
    model: Shape,
    obj: T
): T extends Shape ? Exclude<keyof T, keyof Shape> extends never ? T : never : never => {
    if (!isObjectLike(model)) throw new TypeError('model is not valid');
    if (!isObjectLike(obj)) throw new TypeError('obj is not valid');

    const mismatchProperties = compareCollection(getObjectKeysDeep(model), getObjectKeysDeep(obj));
    if (mismatchProperties.length > 0) {
        throw new Error(`Toolkit -> ${objectPickStrict.name}: source object's and target's properties don't match : ${mismatchProperties.join(', ')}`);
    }

    return Object.defineProperties(
        {},
        Object.assign(
            {},
            ...Object.keys(model)
                .filter(key => hasProperty(obj, key) && propertyIsEnumerable(obj, key))
                .map(key => ({ [key]: Object.getOwnPropertyDescriptor(obj, key) }))
        )
    );
};

export const objectOmit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    if (!isObjectLike(obj)) throw new TypeError('obj is not valid');
    if (!isArray(keys)) throw new TypeError('keys ares not valid');

    return Object.defineProperties(
        {},
        Object.assign(
            {},
            ...(Object.keys(obj) as K[])
                .filter(key => !keys.includes(key) && propertyIsEnumerable(obj, key))
                .map(key => ({ [key]: Object.getOwnPropertyDescriptor(obj, key) }))
        )
    );
};

/*
 ** Maps each level of a deep object
 ** > an object, to navigate through
 ** > a function, called to compute the next level and the current value
 **     should return the following format as an array: [nextLevel, currentValue]
 ** > [Optional] a number, limit of level to process
 ** > [Optional] a boolean, setting wether the returned array should be filled with null value until reaching the limit or not
 ** => Returns an array containing all the mapped values
 ** [Usage]
 **     const data = { id: '1', parent: { id: '2', parent: { id: '3', parent: null } } };
 **     objectDeepMap(data, obj => [obj.parent, obj.id]);
 */
export const objectDeepMap = <T extends any, R extends any>(
    obj: T,
    computeFn: (obj: T) => [T, R],
    limit?: number,
    autoFill?: boolean
): R[] => {
    if (!isObjectLike(obj) || !isFunction(computeFn)) return [];
    if (!checkType(limit, Type.Undefined | Type.Number | Type.Valid)) throw new TypeError('limit is not valid');

    const result = [];
    let nbLevelLeft = limit ?? -1;
    let current = obj;
    let value;

    do {
        [current, value] = computeFn(current);
        result.push(value);
        nbLevelLeft -= 1;
    } while (isObjectLike(current) && nbLevelLeft !== 0);

    if (autoFill === true) result.push(...Array(nbLevelLeft).fill(null));

    return result;
};

const innerMapToDeepObject = (target: any, src: any, options: MapOptions): void => {
    if (!isObjectLike(target) || !isObjectLike(src)) return;

    const srcKeys = Object.keys(src);
    const targetKeys = Object.keys(target);

    targetKeys
        .filter(key => srcKeys.includes(key))
        .reduce((obj, key) => {
            if (options.transformIsoToDate === true && isString(src[key])) {
                const date = parseDate(src[key]);

                obj[key] = isNull(date) ? src[key] : date;
                return obj;
            }

            if (isNativeTypeObject(src[key]) ||
                (!isObjectLike(src[key])) ||
                (isObjectLike(src[key]) && options.allowDynamicObjects && Object.keys(obj[key]).length === 0)) {
                obj[key] = src[key];
            }
            else innerMapToDeepObject(obj[key], src[key], options);

            return obj;
        }, target);
};

type MapOptions = {
    transformIsoToDate?: boolean;
    strictMapping?: boolean;
    ignoreStrictMappingWhenNull?: boolean;
    allowDynamicObjects?: boolean;
};

export const getObjectKeysDeep = (object: any, prefix: string = ''): string[] => {
    if (isNativeTypeObject(object) || !isObjectLike(object)) return [];

    const keys: string[] = [];
    let internalPrefix = prefix;
    if (internalPrefix.length > 0) internalPrefix += '.';

    Object.keys(object).forEach((prop: string) => {
        const propName = internalPrefix + prop;
        keys.push(propName);
        if (!isNativeTypeObject(object[prop]) && isObjectLike(object)) {
            keys.push(...getObjectKeysDeep(object[prop], propName));
        }
    });

    return keys;
};

export const mapToShallowObject =
    (target: any, src: any, filterPredicate?: (key: string, value: any) => boolean): void => {
        if (!isObjectLike(target) || !isObjectLike(src)) return;

        let predicate = (() => true) as (key: string, value: any) => boolean;
        if (isFunction(filterPredicate)) predicate = filterPredicate as (key: string, value: any) => boolean;

        Object.keys(src)
            .filter(key => Object.keys(target).includes(key))
            .reduce((obj, key) => {
                if (predicate(key, obj)) obj[key] = src[key];

                return obj;
            }, target);
    };

export const mapToDeepObject = (target: any, src: any, options: MapOptions = {
    transformIsoToDate: false,
    strictMapping: false,
    ignoreStrictMappingWhenNull: true,
    allowDynamicObjects: false
}): void => {
    if (!isObjectLike(target) || !isObjectLike(src)) return;

    const defaultOptions = {
        transformIsoToDate: false,
        strictMapping: false,
        ignoreStrictMappingWhenNull: true,
        allowDynamicObjects: false
    };
    const internalOptions = options || defaultOptions;

    if (!isDefined(options.transformIsoToDate)) {
        internalOptions.transformIsoToDate = defaultOptions.transformIsoToDate;
    }
    if (!isDefined(options.strictMapping)) {
        internalOptions.strictMapping = defaultOptions.strictMapping;
    }
    if (!isDefined(options.ignoreStrictMappingWhenNull)) {
        internalOptions.ignoreStrictMappingWhenNull =
            defaultOptions.ignoreStrictMappingWhenNull;
    }

    if (!isDefined(options.allowDynamicObjects)) {
        internalOptions.allowDynamicObjects = defaultOptions.allowDynamicObjects;
    }

    if (internalOptions.strictMapping === true) {
        const diffOptions =
            internalOptions.ignoreStrictMappingWhenNull === true
                ? {
                    alternativeFormat: (item: any) => {
                        if (isString(item)) return item.split('.')[0];
                        return item;
                    }
                }
                : undef;
        const missingProperties = diffCollection(
            getObjectKeysDeep(target),
            getObjectKeysDeep(src),
            diffOptions
        );
        if (missingProperties.length > 0) {
            throw new Error(`Toolkit -> ${mapToDeepObject.name}: source object's properties doen't match the target object: ${missingProperties.join(', ')}.`);
        }
    }

    innerMapToDeepObject(target, src, internalOptions);
};

export const compareShallowObject = (obj: any, withObj: any): boolean => {
    if (!isObjectLike(obj)) throw new TypeError('obj is not valid');
    if (!isObjectLike(withObj)) throw new TypeError('withObj is not valid');

    const enumarableObj = objectDefinedPropsOnly(obj);
    const enumarableWithObj = objectDefinedPropsOnly(withObj);

    const objKeys = Object.keys(enumarableObj);
    const withObjKeys = Object.keys(enumarableWithObj);

    if (compareCollection(objKeys, withObjKeys).length > 0) return false;

    return !objKeys.some(key => obj[key] !== withObj[key]);
};

export const quickClone = <T>(arg: T): T | null => {
    try {
        return JSON.parse(JSON.stringify(arg, safeJsonReplacer), safeJsonReviver);
    }
    catch (error) {
        return null;
    }
};