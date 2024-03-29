/* eslint-disable no-extend-native */

import { forEachProperty, ObjectAccessor, ObjectAccessorValue } from './object';
import { strRemoveDiacritics } from './string';

export enum Type {
    Null = 1 << 0,
    Number = 1 << 1,
    String = 1 << 2,
    Boolean = 1 << 3,
    Date = 1 << 4,
    Object = 1 << 5,
    Array = 1 << 6,
    Function = 1 << 7,
    NonEmpty = 1 << 8,
    Valid = 1 << 9,
    Undefined = 1 << 10
}

/*
** Mapped types
*/
export type Nullable<T> = T | null;
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };
export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
export type Required<T> = { [P in keyof T]-?: T[P] };
export type ValuesOf<T extends readonly any[]> = T[number];
export type NonEmptyArray<T> = [T, ...T[]];
export type ArrayType<T extends Array<any>> = T extends (infer U)[] ? U : never;
export type Maybe<T> = T | null | undefined;
export type AnyFunctionReturning<T> = (...args: any[]) => T;

/*
 ** Common Types
 */
export type CustomRange<S = any, E = any> = { start: S, end: E };
export type RefLabel<T = number> = {
    id: T;
    label: string;
};

type NativeRegExp = globalThis.RegExp;

const fnObjectToString = Object.prototype.toString;
const ArrayProto = Array.prototype;
const objectTag = '[object Object]';
const stringTag = '[object String]';
const numberTag = '[object Number]';
const dateTag = '[object Date]';
const arrayTag = '[object Array]';
const boolTag = '[object Boolean]';

export let undef: undefined;

export const requireExtendedPrototypes = (): void => { };

export class RegExp {
    public static readonly EscapedIsoDate = /^\$\{DATE_(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\}$/;
    public static readonly IsoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    public static readonly DateFormat = /^([0-3][0-9])[-\/]([01][0-9])[-\/](\d{4})(?: ([0-2][0-9]):([0-5][0-9])(?:[:]([0-5][0-9]))?)?$/; // eslint-disable-line no-useless-escape, max-len
    public static readonly DateInputPattern = /^(\d{1,2})?(\/)?(\d{1,2})?(\/)?(\d{1,4})?$/; // eslint-disable-line no-useless-escape
    public static readonly DateAutoSlash = /^(\d{2}(?:\/\d{2})?)$/;
    public static readonly TimeFormat = /^([0-2][0-9]):([0-5][0-9])(?:[:]([0-5][0-9]))?$/; // eslint-disable-line max-len
    public static readonly TimeInputPattern = /^(\d{1,2})?(:)?(\d{1,2})?$/; // eslint-disable-line no-useless-escape
    public static readonly TimeAutoColon = /^(\d{2})$/;
    // Complete Regexp with lookbehind (not fully supported by browsers)
    // public static readonly DateFormat = /^((?:[0-3])(?:(?<=[0-2])[0-9]|(?<=3)[01]))[-\/]((?:[01])(?:(?<=0)[0-9]|(?<=1)[0-2]))[-\/](\d{4})(?: ([0-2](?:(?<=[0-1])[0-9]|(?<=2)[0-4])):([0-5][0-9])(?:[:]([0-5][0-9]))?)?$/; // eslint-disable-line no-useless-escape, max-len
    // public static readonly TimeFormat = /^(?:([0-2](?:(?<=[0-1])[0-9]|(?<=2)[0-4])):([0-5][0-9])(?:[:]([0-5][0-9]))?)?$/; // eslint-disable-line max-len
    // public static readonly DateTimeFormat = /^((?:[0-3])(?:(?<=[0-2])[0-9]|(?<=3)[01]))[-\/]((?:[01])(?:(?<=0)[0-9]|(?<=1)[0-2]))[-\/](\d{4})(?: ([0-2](?:(?<=[0-1])[0-9]|(?<=2)[0-4])):([0-5][0-9]))$/; // eslint-disable-line no-useless-escape, max-len
    // public static readonly DateAutoSlash = /^((?:\d{2})(?:(?<=\d{2})\/(?:\d{2}))?)$/;
    public static readonly DateTimeFormat = /^^([0-3][0-9])[-\/]([01][0-9])[-\/](\d{4}) ([0-2][0-9]):([0-5][0-9])$/; // eslint-disable-line no-useless-escape, max-len
    public static readonly DateTimeInputPattern = /^(\d{1,2})?(?:\/)?(\d{1,2})?(?:\/)?(\d{1,4})?(?: )?(\d{1,2})?(?::)?(\d{1,2})?$/; // eslint-disable-line no-useless-escape, max-len
    public static readonly DateTimeAutoColon = /^(\d{2}\/\d{2}\/\d{4} \d{2})$/;
    public static readonly DateTimeAutoSpace = /^(\d{2}\/\d{2}\/\d{4})$/;
    public static readonly StringFormat = /{(\d+)}/g;
    public static readonly LocalIP = /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;
    public static readonly Email = /^((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(?:2(?:5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(?:2(?:5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))$/i; // eslint-disable-line max-len
}

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

type DiffOptions = {
    objectKey?: string;
    predicate?: (item: any, array: any[]) => boolean;
    format?: (item: any) => any;
    alternativeFormat?: (item: any) => any;
};

/**
 ** Type checks
 */

export const isDefined = <T>(arg: T): arg is NonNullable<T> => arg !== undef && arg !== null;
export const isObject = (arg: any): arg is Object => !!arg && typeof arg === 'object' && arg.constructor === Object;
export const isString = (arg: any): arg is string => (
    typeof arg === 'string' ||
    arg instanceof String ||
    (isObjectLike(arg) && fnObjectToString.call(arg) === stringTag)
);

export const isFunction = (arg: any): arg is Function => ['[object Function]', '[object AsyncFunction]'].indexOf(fnObjectToString.call(arg)) >= 0;

export const isArray = (arg: any): arg is any[] => {
    if (Array.isArray) return Array.isArray(arg);

    return typeof arg === 'object' && (fnObjectToString.call(arg) === arrayTag || arg.constructor === Array);
};

export const isBoolean = (arg: any): arg is boolean =>
    arg === true ||
    arg === false ||
    (isObjectLike(arg) && fnObjectToString.call(arg) === boolTag);

export const isNumber = (arg: any): arg is number =>
    typeof arg === 'number' ||
    (isObjectLike(arg) && fnObjectToString.call(arg) === numberTag);

export const isValidNumber = (arg: any): arg is number => isNumber(arg) && Number.isFinite(arg);
export const isNaN = (arg: any): boolean => isNumber(arg) && arg != +arg; // eslint-disable-line eqeqeq
export const isFloat = (value: number): boolean => isValidNumber(value) && value % 1 !== 0;
export const isDate = (arg: any): arg is Date =>
    (isObjectLike(arg) && fnObjectToString.call(arg) === dateTag) || false;

export const isValidDate = (arg: any): arg is Date => isDate(arg) && !isNaN(arg.getTime());
export const isUndefined = (arg: any): arg is undefined => arg === undef;
export const isNull = (arg: any): arg is null => arg === null;
export const isObjectLike = (arg: any): arg is Record<any, any> => !!arg && typeof arg === 'object'; // eslint-disable-line eqeqeq
export const isPlainObject = (arg: any): arg is Record<any, any> => {
    if (!hasObjectPrototype(arg)) return false;

    // If has modified constructor
    const ctor = arg.constructor;
    if (typeof ctor === 'undefined') {
        return true;
    }

    // If has modified prototype
    const prot = ctor.prototype;
    if (!hasObjectPrototype(prot)) return false;

    // If constructor does not have an Object-specific method
    if (!hasProperty(prot, 'isPrototypeOf')) return false;

    // Most likely a plain Object
    return true;
};
function hasObjectPrototype(arg: any): boolean {
    return fnObjectToString.call(arg) === objectTag;
}

export const isNativeTypeObject = (arg: any): boolean =>
    isUndefined(arg) ||
    isNull(arg) ||
    isDate(arg) ||
    isBoolean(arg) ||
    isNumber(arg) ||
    isString(arg) ||
    isArray(arg) ||
    isFunction(arg);
export const isRegExp = (arg: any): arg is RegExp => typeof arg === 'object' && arg.constructor === RegExp;
export const isEmpty = <T extends string | any[]>(arg: T): boolean => {
    if (!isString(arg) && !isArray(arg)) throw new TypeError('arg is not of a valid type');

    return arg.length === 0;
};

export const checkType = <T = any>(arg: any, type: Type): arg is T => {
    if (type & Type.Undefined && isUndefined(arg)) return true;
    if (type & Type.Null && isNull(arg)) return true;
    if (type & Type.Boolean && isBoolean(arg)) return true;
    if (type & Type.Function && isFunction(arg)) return true;

    if (type & Type.Number && isNumber(arg)) {
        if (type & Type.Valid) return !isNaN(arg);
        return true;
    }

    if (type & Type.String && isString(arg)) {
        if (type & Type.NonEmpty) return arg.length > 0;
        return true;
    }

    if (type & Type.Date && isDate(arg)) {
        if (type & Type.Valid) return isValidDate(arg);
        return true;
    }

    if (type & Type.Object && isObjectLike(arg)) {
        if (type & Type.NonEmpty) return Object.keys(arg).length > 0;
        return true;
    }

    if (type & Type.Array && isArray(arg)) {
        if (type & Type.NonEmpty) return arg.length > 0;
        return true;
    }

    return false;
};

export const assertType = <T = any>(arg: T, type: Type, msg?: string): T => {
    if (!checkType<T>(arg, type)) throw new AssertionError(msg);

    return arg;
};

export const computeForType = <InputType, ComputeResult, DefaultValue extends any>(
    arg: InputType,
    condition: Type,
    computeFn: (arg: InputType) => ComputeResult,
    defaultValue: DefaultValue
): ComputeResult | DefaultValue => {
    if (!checkType<InputType>(arg, condition)) return defaultValue;

    return computeFn(arg);
};

export const ternaryOfType = <InputType, DefaultValue extends any>(
    arg: InputType,
    condition: Type,
    defaultValue: DefaultValue
): InputType | DefaultValue => {
    if (!checkType<InputType>(arg, condition)) return defaultValue;

    return arg;
};

/**
 ** Asserts
 */

export const assert: (condition: unknown, msg?: string) => asserts condition = (condition, msg) => {
    if (!condition) throw new AssertionError(msg);
};
export const assertIsDefined: <T>(value: T, msg?: string) => asserts value is NonNullable<T> = (value, msg) => {
    if (!isDefined(value)) throw new AssertionError(msg);
};
export const assertIsString: (value: any, msg?: string) => asserts value is string = (value, msg) => {
    if (!isString(value)) throw new AssertionError(msg);
};
export const assertIsFunction: (value: any, msg?: string) => asserts value is Function = (value, msg) => {
    if (!isFunction(value)) throw new AssertionError(msg);
};
export const assertIsArray: (value: any, msg?: string) => asserts value is Array<any> = (value, msg) => {
    if (!isArray(value)) throw new AssertionError(msg);
};
export const assertIsBoolean: (value: any, msg?: string) => asserts value is boolean = (value, msg) => {
    if (!isBoolean(value)) throw new AssertionError(msg);
};
export const assertIsNumber: (value: any, msg?: string) => asserts value is number = (value, msg) => {
    if (!isNumber(value)) throw new AssertionError(msg);
};
export const assertIsValidNumber: (value: any, msg?: string) => asserts value is number = (value, msg) => {
    if (!isValidNumber(value)) throw new AssertionError(msg);
};
export const assertIsFloat: (value: any, msg?: string) => asserts value is number = (value, msg) => {
    if (!isFloat(value)) throw new AssertionError(msg);
};
export const assertIsDate: (value: any, msg?: string) => asserts value is Date = (value, msg) => {
    if (!isDate(value)) throw new AssertionError(msg);
};
export const assertIsValidDate: (value: any, msg?: string) => asserts value is Date = (value, msg) => {
    if (!isValidDate(value)) throw new AssertionError(msg);
};
export const assertIsUndefined: (value: any, msg?: string) => asserts value is undefined = (value, msg) => {
    if (!isUndefined(value)) throw new AssertionError(msg);
};
export const assertIsNull: (value: any, msg?: string) => asserts value is null = (value, msg) => {
    if (!isNull(value)) throw new AssertionError(msg);
};

/**
 ** Array
 */

export const ensureArray = <T>(value: T | T[]): T[] => {
    return isArray(value) ? value : [value];
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

const basicDiff = (array1: any[], array2: any[]): any[] => array1.filter(x => array2.indexOf(x) === -1);

export const diffCollection = (
    array: any[],
    values: any[],
    options?: DiffOptions
): any[] => {
    if (!isArray(array) || !isArray(values) || !array.length) return [];
    if (options == null) return basicDiff(array, values);

    const result: any[] = [];
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
    propertyAccessor: ObjectAccessor<T>,
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

        if (aProperty === bProperty) return 0;
        if (aProperty == null) return nullOrderValue * 1;
        if (bProperty == null) return nullOrderValue * -1;
        if (aProperty < bProperty) return ascOrderValue * -1;
        if (aProperty > bProperty) return ascOrderValue * 1;

        return 0;
    });
};

export const sortByProperty = <T, A extends ObjectAccessor<T>>(
    array: T[],
    propertyAccessor: A,
    compareFn: (a: ObjectAccessorValue<T, A> | undefined, b: ObjectAccessorValue<T, A> | undefined) => number,
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

        if (aProperty === bProperty) return 0;
        if (aProperty == null) return nullOrderValue * 1;
        if (bProperty == null) return nullOrderValue * -1;

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
    removeFrom(array, index, 1);
};

export const removeFrom = <T>(array: T[], index: number, count?: number): void => {
    if (!isArray(array)) throw new TypeError('array is not valid');
    if (!isValidNumber(index)) throw new TypeError('index is not valid');

    array.splice(index, count ?? array.length - index);
};

export const insertAt = <T>(array: T[], index: number, item: T): void => {
    if (!isArray(array)) return;

    array.splice(index, 0, item);
};

export const replaceAt = <T>(array: T[], index: number, item: T): void => {
    if (!isArray(array)) return;

    array.splice(index, 1, item);

    // No mutation
    // const copy = array.slice(0);
    // copy[index] = value;
    // return copy;
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

/**
 ** String
 */

export const fixedLenInteger = (value: number, length: number): string =>
    (Array(length).join('0') + value).slice(-length);

export const fixedLenString = (value: string, length: number): string =>
    (value + Array(length).join(' ')).slice(0, length);

export const toCamelCase = (value: string): string => {
    if (!isString(value)) throw new TypeError('value is not valid');

    return value
        .replace(/\s(.)/g, $1 => $1.toUpperCase())
        .replace(/\s/g, '')
        .replace(/^(.)/, $1 => $1.toLowerCase());
};

export const stringFormat = (format: string, ...formatValues: any[]): string => {
    if (!isString(format)) throw new TypeError('format is not valid');

    return format.replace(
        RegExp.StringFormat,
        (_, number) => (isUndefined(formatValues[number]) ? '' : formatValues[number])
        // Opinionated change
        // (match, number) => (isUndefined(formatValues[number]) ? match : formatValues[number])
    );
};

export const generateFormat = (value: string, expression: NativeRegExp): string => {
    let count = 0;

    return value.replace(expression, () => `{${count++}}`);
};

export const findDiff = (source: string, compareTo: string): number => {
    let sourceArray = Array.from(source);
    let compareArray = Array.from(compareTo);

    if (source.length < compareTo.length) [sourceArray, compareArray] = [compareArray, sourceArray];

    return sourceArray.findIndex((chr, idx) => chr !== compareArray[idx]);
};

type StrTransformationOptions = {
    case?: 'lower' | 'upper';
    removeDiacritics?: boolean;
};

const STR_TRANSFORM_DEFAULTS: StrTransformationOptions = {
    case: undefined,
    removeDiacritics: false
};

export const strTransform = (value: string, options?: StrTransformationOptions): string => {
    if (!isString(value)) return value;

    let transformationStr = value;

    const config = computeOptions(STR_TRANSFORM_DEFAULTS, options);

    switch (config.case) {
        case 'lower':
            transformationStr = transformationStr.toLowerCase();
            break;
        case 'upper':
            transformationStr = transformationStr.toUpperCase();
            break;
        default:
            break;
    }

    if (config.removeDiacritics === true) transformationStr = strRemoveDiacritics(transformationStr);

    return transformationStr;
};

type StrIncludesOptions = {
    startsWith?: boolean;
    caseInsensitive?: boolean;
    ignoreDiacritics?: boolean;
};

const STR_INCLUDES_DEFAULTS: StrIncludesOptions = {
    startsWith: false,
    caseInsensitive: false,
    ignoreDiacritics: false
};

export const strIncludes = (value: string, compareWith: string, options?: StrIncludesOptions): boolean => {
    if (!isString(value) || !isString(compareWith)) return false;

    const config = computeOptions(STR_INCLUDES_DEFAULTS, options);

    const transformOptions: StrTransformationOptions = {
        case: config.caseInsensitive ? 'lower' : undefined,
        removeDiacritics: !!config.ignoreDiacritics
    };

    const formattedValue = strTransform(value, transformOptions);
    const formattedCompareWith = strTransform(compareWith, transformOptions);

    const index = formattedCompareWith.indexOf(formattedValue);


    if (config.startsWith === true) return index === 0;

    return index >= 0;
};

/**
 ** Number
 */

export const randomNumber = (minValue: number, maxValue: number): number =>
    Math.floor(Math.random() * maxValue + minValue);

/**
 ** Date
 */

const HOUR_MINUTES = 60;
const MINUTE_MILLISEC = 1000;

let toJSONDateFallback = Date.prototype.toJSON;

function toJsonDateUTC(this: Date) {
    return formatDateTimeUTC(this);
};

export const overrideDateJsonAsUTC = () => {
    toJSONDateFallback = Date.prototype.toJSON;

    Date.prototype.toJSON = toJsonDateUTC;
};

export const rollbackDateJsonAsUTC = () => {
    Date.prototype.toJSON = toJSONDateFallback;
};

export const dateOnly = (date: Date): Date => {
    if (!isValidDate(date)) throw new TypeError('date is not valid');

    return new Date(date.toDateString());
};

export const formatDate: (date: Date, customFn?: (year: string, month: string, day: string) => string) => string =
    (date, customFn = (year, month, day) => `${day}/${month}/${year}`) => {
        if (!isDate(date) || !isValidDate(date)) throw new TypeError('date is not valid');
        if (!isFunction(customFn)) throw new TypeError('customFn is not valid');

        const day = fixedLenInteger(date.getDate(), 2);
        const month = fixedLenInteger(date.getMonth() + 1, 2);
        const year = fixedLenInteger(date.getFullYear(), 4);

        return customFn(year, month, day);
    };

export const formatHour: (date: Date, customFn?: (h: string, m: string, s: string) => string) => string =
    (date, customFn = (hour, minute, second) => `${hour}:${minute}:${second}`) => {
        if (!isDate(date) || !isValidDate(date)) throw new TypeError('date is not valid');
        if (!isFunction(customFn)) throw new TypeError('customFn is not valid');

        const hourStr = fixedLenInteger(date.getHours(), 2);
        const minuteStr = fixedLenInteger(date.getMinutes(), 2);
        const secondStr = fixedLenInteger(date.getSeconds(), 2);

        return customFn(hourStr, minuteStr, secondStr);
    };

export const dateToFormat: (value: Date, format?: string) => string =
    (value, format = 'dd/MM/yyyy') => {
        if (!isValidDate(value)) throw new TypeError('date is not valid');
        if (!isString(format)) throw new TypeError('format is not valid');

        try {
            let formattedDate = format;
            formattedDate =
                formatDate(value, (year, month, day) => formattedDate
                    .replace('dd', day)
                    .replace('MM', month)
                    .replace('yyyy', year));
            formattedDate =
                formatHour(value, (hour, minute, second) => formattedDate
                    .replace('HH', hour)
                    .replace('mm', minute)
                    .replace('ss', second));
            return formattedDate;
        }
        catch (err) {
            // ignore
        }

        return format;
    };

export const formatDateTimeUTC = (date: Date): string => {
    const dateStr = formatDateUTC(date);
    const timeStr = formatHourUTC(date);

    return `${dateStr} ${timeStr}`;
};

export const formatDateUTC: (date: Date, customFn?: (year: string, month: string, day: string) => string) => string =
    (date, customFn = (year, month, day) => `${day}/${month}/${year}`) => {
        if (!isValidDate(date)) throw new TypeError('date is not valid');
        if (!isFunction(customFn)) throw new TypeError('customFn is not valid');

        const day = fixedLenInteger(date.getUTCDate(), 2);
        const month = fixedLenInteger(date.getUTCMonth() + 1, 2);
        const year = fixedLenInteger(date.getUTCFullYear(), 4);

        return customFn(year, month, day);
    };

export const formatHourUTC: (date: Date, customFn?: (h: string, m: string, s: string) => string) => string =
    (date, customFn = (hour, minute, second) => `${hour}:${minute}:${second}`) => {
        if (!isDate(date) || !isValidDate(date)) throw new TypeError('date is not valid');
        if (!isFunction(customFn)) throw new TypeError('customFn is not valid');

        const hourStr = fixedLenInteger(date.getUTCHours(), 2);
        const minuteStr = fixedLenInteger(date.getUTCMinutes(), 2);
        const secondStr = fixedLenInteger(date.getUTCSeconds(), 2);

        return customFn(hourStr, minuteStr, secondStr);
    };

export const parseDate = (text: string): Date | null => {
    const matchGroups = text.match(RegExp.DateFormat);

    if (!isArray(matchGroups)) return null;

    const parseIntValue = (s: string, optional: boolean = false) => {
        if (isString(s)) {
            const value = parseInt(s, 10);

            if (isValidNumber(value)) return value;

            throw new TypeError('value is not valid');
        }

        if (!optional) throw new TypeError('value is not valid');

        return 0;
    };

    const [
        ,
        dayGroup,
        monthGroup,
        yearGroup,
        hourGroup,
        minuteGroup,
        secondGroup
    ] = matchGroups;

    try {
        const year = parseIntValue(yearGroup);
        const month = parseIntValue(monthGroup);
        const day = parseIntValue(dayGroup);
        const hour = parseIntValue(hourGroup, true);
        const minute = parseIntValue(minuteGroup, true);
        const second = parseIntValue(secondGroup, true);

        // Checking the number of days for the month
        const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const numberOfDays = startOfMonth.getEndOfMonth().getDate();

        if (day > numberOfDays) return null;

        return new Date(
            year,
            month - 1,
            day,
            hour,
            minute,
            second,
            0
        );
    }
    catch {
        return null;
    }
};

export const parseDateUTC = (text: string): Date | null => {
    const date = parseDate(text);
    if (!isValidDate(date)) return null;

    return getTimezoneOffsetDate(date);
};

export const parseTime = (text: string, defaultDate?: Date): Date | null => {
    if (!isString(text)) throw new TypeError('text is not valid');

    const matchGroups = text.match(RegExp.TimeFormat);

    if (!isArray(matchGroups)) return null;

    const parseIntValue = (s: string, optional: boolean = false) => {
        if (isString(s)) {
            const value = parseInt(s, 10);

            if (isValidNumber(value)) return value;

            throw new Error('value not valid');
        }

        if (!optional) throw new Error('value not valid');

        return 0;
    };

    const [
        ,
        hourGroup,
        minuteGroup,
        secondGroup
    ] = matchGroups;

    try {
        const hour = parseIntValue(hourGroup);
        const minute = parseIntValue(minuteGroup);
        const second = parseIntValue(secondGroup, true);

        const date = isValidDate(defaultDate) ? new Date(defaultDate) : new Date();

        date.setHours(hour);
        date.setMinutes(minute);

        if (second) date.setSeconds(second);
        else date.setSeconds(0);

        return date;
    }
    catch {
        return null;
    }
};

export const getTimezoneOffsetDate = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * HOUR_MINUTES * MINUTE_MILLISEC);

// TODO: handle this format : 2020-09-17T00:00:00Z https://www.regextester.com/97766

export const parseIsoDate = (value: string): Date => {
    if (!isString(value)) throw new TypeError('value is not valid');

    const date = new Date(value);
    const matches = value.match(RegExp.IsoDate);

    if (!isValidDate(date) || !isArray(matches)) throw new TypeError('value is not valid');

    return date;
};

export const safeParseIsoDate = <T>(value: T): Date | T => {
    if (isString(value)) {
        const date = new Date(value);
        const matches = value.match(RegExp.IsoDate);
        if (isValidDate(date) && isArray(matches)) {
            return date!;
        }
    }

    return value;
};

export const safeParseDate = <T>(value: T): Date | T => {
    if (isString(value)) {
        const date = parseDate(value);
        if (isValidDate(date)) return date!;
    }

    return value;
};

/**
 ** Classes
 */

export const getClassName = (instance: any): string | null => {
    if (isObjectLike(instance) && isFunction(instance.constructor)) return instance.constructor.name;
    if (isFunction(instance)) return instance.name;

    return null;
};

export const getClassMethodName = (instance: any, method: Function): string | null => {
    if (
        !isDefined(instance) ||
        !(isObjectLike(instance) || isFunction(instance)) ||
        !isFunction(method)
    ) return null;

    let result = null;
    [
        ...Object.getOwnPropertyNames(Object.getPrototypeOf(instance)),
        ...Object.keys(instance)
    ]
        .filter((key, index, context) =>
            context.indexOf(key) === index &&
            !['caller', 'callee', 'arguments'].includes(key))
        .some(key => {
            if (instance[key] === method) {
                result = key;
                return true;
            }

            return false;
        });

    return result;
};

export type ConditionalParams = Maybe<
    | string
    | { [key: string]: boolean }
>;

export const conditionalConcat = (...args: ConditionalParams[]): string => {
    return args.reduce((acc: string[], item) => {
        if (!isDefined(item)) return acc;

        if (isString(item)) acc.push(item);
        else if (isObjectLike(item)) {
            forEachProperty(item, ((key: string) => {
                if (item[key]) acc.push(key);
            }));
        }

        return acc;
    }, []).join(' ');
};

export const isCollectionOf = <T = any>(array: T[], instanceOf: any): boolean => {
    for (let idx = 0; idx < array.length; idx++) {
        if (!(array[idx] instanceof instanceOf)) return false;
    }

    return true;
};

/**
 ** Events
 */

export const onEvent = (obj: any, ...args: any[]) => obj.addEventListener(...args);
export const offEvent = (obj: any, ...args: any[]) => obj.removeEventListener(...args);

/**
 ** Utilities
 */

export const getObjectKeysDeep = (object: any, prefix: string = ''): string[] => {
    if (isNativeTypeObject(object) || !isObjectLike(object)) return [];

    const keys: string[] = [];
    let internalPrefix = prefix;
    if (internalPrefix.length > 0) internalPrefix += '.';

    forEachProperty(object, ((prop: string) => {
        const propName = internalPrefix + prop;

        keys.push(propName);

        if (!isNativeTypeObject(object[prop]) && isObjectLike(object)) {
            keys.push(...getObjectKeysDeep(object[prop], propName));
        }
    }));

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

export const getPropertySafe = <T, P extends ObjectAccessor<T>>(obj: T, propertyAccessor: P): ObjectAccessorValue<T, P> | undefined => {
    if (!isString(propertyAccessor) || propertyAccessor.length === 0) return undefined;

    const accessedValue = propertyAccessor
        .split('.')
        .reduce<ObjectAccessorValue<T, P> | undefined>((acc: T | ObjectAccessorValue<T, P> | undefined, part, idx, arr) => {
            if (isString(part) && part.length !== 0 && isObjectLike(acc)) {
                return (acc as Record<any, any>)[part];
            }

            removeFrom(arr, idx);
            return undefined;

        }, obj as any);

    return accessedValue;
};

export const cast = <T>(arg: any): T => arg as T;

const BIG_INT_SUPPORTED = isFunction(globalThis?.BigInt);

export const safeJsonReplacer = (_key: any, value: any) => {
    if (BIG_INT_SUPPORTED && typeof value === "bigint") return `BIGINT::${value}`;
    if (isNaN(value)) return 'NaN';
    if (value === Infinity) return 'Infinity';
    if (value === -Infinity) return '-Infinity';
    if (isValidDate(value)) {
        return `$\{DATE_${value.toISOString()}\}`; // eslint-disable-line no-useless-escape
    }
    // if (isString(value)) {
    //     const matches = value.match(RegExp.IsoDate);
    //     if (isArray(matches) && isDate(safeParseIsoDate(value))) {
    //         return `$\{DATE_${value}\}`; // eslint-disable-line no-useless-escape
    //     }
    // }

    return value;
};

export const safeJsonReviver = (_key: any, value: any) => {
    if (value === 'NaN') return NaN;
    if (value === 'Infinity') return Infinity;
    if (value === '-Infinity') return -Infinity;
    if (BIG_INT_SUPPORTED && isString(value) && value.startsWith('BIGINT::')) return globalThis?.BigInt(value.substr(8));

    if (isString(value)) {
        if (Date.prototype.toJSON === toJsonDateUTC) {
            const match = value.match(RegExp.DateFormat);
            if (isArray(match) && match.length >= 2) return parseDateUTC(value);
        }

        const match = value.match(RegExp.EscapedIsoDate);
        if (isArray(match) && match.length >= 2) return safeParseIsoDate(match[1]);
    }

    return value;
};

export const toJSON = (value: any, replacer?: (key: string, value: any) => any): string => {
    const internalReplacer = (key: string, val: any) => {
        if (isFunction(replacer)) {
            val = replacer(key, val);
        }
        return safeJsonReplacer(key, val);
    };

    return JSON.stringify(value, internalReplacer);
};

export const fromJSON = <T = any>(value: string, reviver?: (key: string, value: any) => any): T | null => {
    const internalReviver = (key: string, val: any) => {
        if (isFunction(reviver)) {
            val = reviver(key, val);
        }
        return safeJsonReviver(key, val);
    };

    try {
        return JSON.parse(value, internalReviver);
    }
    catch (error) {
        return null;
    }
};

export const quickClone = <T>(arg: T): T | null => {
    try {
        return fromJSON(toJSON(arg));
    }
    catch (error) {
        return null;
    }
};

export const computeOptions = <T>(defaultOptions: T, options: Partial<T> | undefined): T => {
    if (!isObjectLike(defaultOptions)) throw new TypeError('defaultOptions are not valid');
    if (!isObjectLike(options)) {
        if (isDefined(options)) throw new TypeError('options are not valid');

        return defaultOptions;
    }

    const keys = (Object.keys(defaultOptions) as Array<keyof T>);
    const pickedOptions = objectPick<Partial<T>, keyof T>(options!, keys);

    return pureObjectExtend(defaultOptions, pickedOptions);
};

// type Timeout

export const setTimeoutAsync = <T>(handler: () => T, timeout?: number): Promise<T> =>
    new Promise((resolve, reject) => {
        try {
            setTimeout(() => resolve(handler()), timeout!);
        }
        catch (err) {
            reject(err);
        }
    });

export const sleep = (timeout: number): Promise<void> => new Promise(resolve => setTimeout(resolve, timeout));

// [Warning] Interval is triggered after execution complete
export const setIntervalAsync = (handler: () => any, timeout?: number) => {
    let enabled = true;
    let timeoutId: any | null = null;

    const clear = () => {
        enabled = false;
        if (timeoutId) clearTimeout(timeoutId);
    };

    timeoutId = setTimeout(intervalFn, timeout);

    async function intervalFn() {
        await Promise.resolve(handler());
        if (!enabled) return;

        timeoutId = setTimeout(intervalFn, timeout);
    }

    return clear;
};

export const noop = (): void => { };

/*
 ** Object
 */

export * from './object';
export * from './string';

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

export const objectPick = <T, K extends keyof T>(obj: Readonly<T>, keys: Readonly<K[]>): Pick<T, K> => {
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
export const objectDeepMap = <T extends Record<any, any>, R extends any>(
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

/*
 ** Classes
 */

export class TimeoutPromise<T> {
    private _promise: Promise<T>;
    private _isTerminated = false;

    protected timeoutId!: any;
    protected resolve!: (value: T | PromiseLike<T>) => void;
    protected reject!: (reason?: any) => void;
    protected safeCancel: boolean;

    get promise(): Promise<T> {
        return this._promise;
    }

    get isTerminated(): boolean {
        return this._isTerminated;
    }

    constructor(handler: () => T, timeout?: number, safeCancel: boolean = false) {
        this._promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;

            try {
                this.timeoutId = setTimeout(() => {
                    this.resolve(Promise.resolve(handler()));
                    this._isTerminated = true;
                }, timeout!);
            }
            catch (err) {
                this.reject(err);
                this._isTerminated = true;
            }
        });

        if (this.safeCancel = safeCancel) this._promise.catch(() => { }); // eslint-disable-line no-cond-assign
    }

    cancel() {
        if (this._isTerminated) return;

        clearTimeout(this.timeoutId);
        this.reject(new Error('Cancelled'));
        this._isTerminated = true;
    }
}

type PromiseCancelCallback = () => unknown;

export class CancellablePromise<T> extends Promise<T> {
    private onCancel: PromiseCancelCallback = noop;

    constructor(
        executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void,
        onCancel?: () => unknown
    ) {
        super(executor);

        if (isFunction(onCancel)) this.onCancel = onCancel;
    }

    cancel() {
        this.onCancel();
    }

    static fromPromise<T>(promise: Promise<T>, onCancel?: () => unknown) {
        let cancel: typeof onCancel;

        if (promise instanceof CancellablePromise && isFunction(promise.cancel)) {
            cancel = promise.cancel;
        }
        else if (isFunction(onCancel)) {
            cancel = onCancel;
        }

        return new CancellablePromise<T>(async (resolve, reject) => {
            try {
                const result = await promise;
                return resolve(result);
            }
            catch (err) {
                return reject(err);
            }
        }, cancel);
    }

    withPromise<U>(promise: Promise<U>) {
        return new CancellablePromise<U>(async (resolve, reject) => {
            try {
                const result = await promise;
                return resolve(result);
            }
            catch (err) {
                return reject(err);
            }
        }, this.onCancel);
    }
}

export class Debounce<H extends (...args: any[]) => unknown> {
    protected handler: H;
    protected timeout: number;
    protected timeoutId!: any;

    constructor(handler: H, timeout: number) {
        this.handler = handler;
        this.timeout = timeout;
    }

    push = (...args: Parameters<H>): void => {
        clearTimeout(this.timeoutId);

        try {
            this.timeoutId = setTimeout(() => {
                this.handler(...args);
            }, this.timeout);
        }
        catch (err) {
            // Ignore
        }
    }

    clear = (): void => {
        clearTimeout(this.timeoutId);
    }
}

export class DebounceInterval<H extends (...args: any[]) => unknown> {
    protected handler: H;
    protected timeout: number;
    protected timeoutId!: any;
    protected pushAwaiting: boolean = false;
    protected lastValue: any[] = [];

    constructor(handler: H, timeout: number) {
        this.handler = handler;
        this.timeout = timeout;
    }

    push = (...args: Parameters<H>): void => {
        this.lastValue = args;

        if (this.pushAwaiting === false) {
            try {
                this.timeoutId = setTimeout(() => {
                    if (this.pushAwaiting === true) {
                        this.pushAwaiting = false;
                        this.handler(...this.lastValue);
                    }
                }, this.timeout);
                this.pushAwaiting = true;
            }
            catch (err) {
                // Ignore
            }
        }
    }

    clear = (): void => {
        clearTimeout(this.timeoutId);
    }
}

type ObserverCallback<T> = (data: T) => unknown;

export class Observer<T extends any = any, CallbackType extends Function = ObserverCallback<T>> {
    protected subscribers: CallbackType[] = [];

    subscribe(callback: CallbackType) {
        this.subscribers.push(callback);

        return () => {
            removeFromCollection(this.subscribers, sub => sub === callback);
        };
    }

    notify(data: T): void {
        this.subscribers.forEach(sub => {
            // Try/catch to contain any error thrown by subscribers
            try {
                sub(data);
            }
            catch {
                // Ignore
            }
        });
    }
}

export class MemoryObserver<T extends any = any, CallbackType extends Function = ObserverCallback<T>> extends Observer<T, CallbackType> {
    private _hasMemory = false;
    private _memory: T | undefined;

    protected get memory(): T | undefined {
        return this._memory;
    }
    protected set memory(value: T | undefined) {
        this._memory = value;
        this._hasMemory = true;
    }

    subscribe(callback: CallbackType) {
        if (this._hasMemory) {
            callback(this.memory);
        }

        return super.subscribe(callback);
    }

    notify(data: T): void {
        this.memory = data;
        super.notify(data);
    }

    forget(): void {
        this._memory = undefined;
        this._hasMemory = false;
    }
}

export type TimedNotifierCallback<T> = (
    data: T,
    resolve: (value?: unknown) => void,
    reject: (reason?: any) => void
) => unknown;

export class TimedNotifier<T extends any = any> extends Observer<T, TimedNotifierCallback<T>> {
    private maxTimeout: number;

    constructor(maxTimeout = 5000) {
        super();

        if (!isValidNumber(maxTimeout)) throw new TypeError('maxTimeout is not valid');

        this.maxTimeout = maxTimeout;
    }

    async notify(data: T) {
        return Promise.race([
            Promise.all(this.subscribers.map(sub => new Promise((resolve, reject) => sub(data, resolve, reject)))),
            new Promise(resolve => setTimeout(resolve, this.maxTimeout))
        ]);
    }
}

/*
 ** Network
 */
export type NetworkOptions = {
    endpoint?: string; // TODO: Idea - Improve by allowing multiple endpoints
    immediate?: boolean; // Default: true
};

export class NetworkConnectivity {
    private endpoint?: string;
    private pingInterval: number = 30000;
    private clearPingInterval: () => void;
    private observer: Observer<boolean, (isOnline: boolean) => void> = new Observer();
    private isMonitoring: boolean = false;

    public isSupported: boolean = true;
    public isOnline: boolean = false;

    constructor(options?: NetworkOptions) {
        const { endpoint, immediate } = options ?? {};

        this.endpoint = endpoint;

        if (globalThis == null || !('navigator' in globalThis)) {
            this.isSupported = false;
            return;
        }

        if (immediate !== false) this.startMonitoring();
    }

    subscribe(callback: (isOnline: boolean) => void): () => void {
        return this.observer.subscribe(callback);
    }

    startMonitoring(): void {
        if (!this.isSupported) return;
        if (this.isMonitoring) return;

        this.isMonitoring = true;

        this.getUpdatedStatus(globalThis?.navigator?.onLine ?? true)
            .then(statusUpdate => {
                if (statusUpdate != null) {
                    this.isOnline = statusUpdate;
                    this.observer.notify(this.isOnline);
                }
            });

        this.clearPingInterval = setIntervalAsync(async () => {
            const statusUpdate = await this.getUpdatedStatus(true);

            if (statusUpdate != null) {
                this.isOnline = statusUpdate;
                this.observer.notify(this.isOnline);
            }
        }, this.pingInterval);

        globalThis?.addEventListener('online', this.onlineHandler);
        globalThis?.addEventListener('offline', this.offlineHandler);
    }

    stopMonitoring(): void {
        if (!this.isMonitoring) return;

        globalThis?.removeEventListener('online', this.onlineHandler);
        globalThis?.removeEventListener('offline', this.offlineHandler);

        if (isFunction(this.clearPingInterval)) this.clearPingInterval();
    }

    private async pingEndpoint(): Promise<boolean> {
        if (!isString(this.endpoint)) return true;

        try {
            const response = await fetch(this.endpoint);

            // HTTP Codes 4XX and 5XX are categorized as error
            const strStatus = response.status.toString();
            const hasError = strStatus.startsWith('4') || strStatus.startsWith('5');

            if (!hasError) return true;
        }
        catch {
            // Ignore
        }

        return false;
    }

    private onlineHandler = async () => {
        const statusUpdate = await this.getUpdatedStatus(true);

        if (statusUpdate != null) {
            this.isOnline = statusUpdate;
            this.observer.notify(this.isOnline);
        }
    }

    private offlineHandler = async () => {
        const statusUpdate = await this.getUpdatedStatus(false);

        if (statusUpdate != null) {
            this.isOnline = statusUpdate;
            this.observer.notify(this.isOnline);
        }
    }

    // Used to define the new status and whether an update is required or not 
    private async getUpdatedStatus(newStatus: boolean): Promise<boolean | undefined> {
        if (newStatus === true) {
            let isOnline = false;

            try {
                isOnline = await this.pingEndpoint();
            }
            catch {
                // Ignore
            }

            if (this.isOnline === true && isOnline === true) return;
            if (this.isOnline !== isOnline) {
                return isOnline;
            }
        }
        else if (this.isOnline === true) {
            return false;
        }

        return undefined;
    }
}

/*
 ** Date Extension
 */

type Week = {
    week: number;
    start: number;
    end: number;
    monthOverlap: boolean;
};

declare global {
    interface Date {
        toUTC(): Date;
        getWeek(): number;
        getWeeks(boundToMonth?: boolean): Week[];
        getStartOfMonth(): Date;
        getEndOfMonth(): Date;
        updateTime(time: Date): void;
        clearTime(): void;
        updateDate(date: Date): void;
        newTime(time: Date): Date;
        newDate(date: Date): Date;
        newYear(year: number): Date;
        newMonth(month: number): Date;
        newDay(day: number): Date;
        newHour(hour: number): Date;
        newMinute(minute: number): Date;
        newSecond(second: number): Date;
        matchDate(compareTo: Date): boolean;
        matchTime(compareTo: Date): boolean;
        addYear(year: number): Date;
        addMonth(month: number): Date;
        addDay(day: number): Date;
        addHour(hour: number): Date;
        addMinute(minute: number): Date;
        addSecond(second: number): Date;
    }
}

Date.prototype.toUTC = Date.prototype.toUTC ||
    function toUTC(this: Date): Date {
        const offset = this.getTimezoneOffset();
        const year = this.getFullYear();
        const month = this.getMonth();
        const day = this.getDate();
        const hour = this.getHours() + (offset / 60);
        const minute = this.getMinutes();
        const second = this.getSeconds();
        const millisecond = this.getMilliseconds();

        return new Date(Date.UTC(
            year,
            month,
            day,
            hour,
            minute,
            second,
            millisecond
        ));
    };

Date.prototype.getWeek = Date.prototype.getWeek ||
    function getWeek(this: Date): number {
        const firstJan = new Date(this.getFullYear(), 0, 1);
        const weekNum = Math.ceil((((this.getTime() - firstJan.getTime()) / 86400000) + firstJan.getDay()) / 7);
        return weekNum > 52 ? weekNum - 52 : weekNum;
    };

Date.prototype.getWeeks = Date.prototype.getWeeks ||
    function getWeeks(this: Date, boundToMonth: boolean = true): Week[] {
        const weeks: Week[] = [];
        const firstOfMonth = new Date(this.getFullYear(), this.getMonth(), 1);
        const lastOfMonth = new Date(this.getFullYear(), this.getMonth() + 1, 0);
        const numDays = lastOfMonth.getDate();

        let weekNum = firstOfMonth.getWeek();
        const firstDayOfMonth = firstOfMonth.getDay();
        let end = firstDayOfMonth === 0 ? 1 : 7 - firstDayOfMonth + 1;
        let start = boundToMonth === true ? 1 : end - 6;
        let monthOverlap = start !== 1;

        while (start <= numDays) {
            weeks.push({ week: weekNum, start, end, monthOverlap });
            if (start > end) break;

            weekNum += 1;
            start = end + 1;
            end += 7;
            monthOverlap = false;
            if (end > numDays) {
                if (boundToMonth === true) end = numDays;
                else {
                    end = end - numDays;
                    monthOverlap = true;
                }
            }
        }

        return weeks;
    };

Date.prototype.getStartOfMonth = Date.prototype.getStartOfMonth ||
    function getStartOfMonth(this: Date): Date {
        return new Date(this.getFullYear(), this.getMonth(), 1);
    };

Date.prototype.getEndOfMonth = Date.prototype.getEndOfMonth ||
    function getEndOfMonth(this: Date): Date {
        return new Date(this.getFullYear(), this.getMonth() + 1, 0);
    };

Date.prototype.updateTime = Date.prototype.updateTime ||
    function updateTime(this: Date, time: Date): void {
        if (!isValidDate(this)) return;

        this.setHours(time.getHours());
        this.setMinutes(time.getMinutes());
        this.setSeconds(time.getSeconds());
        this.setMilliseconds(time.getMilliseconds());
    };

Date.prototype.clearTime = Date.prototype.clearTime ||
    function clearTime(this: Date): void {
        if (!isValidDate(this)) return;

        this.setHours(0);
        this.setMinutes(0);
        this.setSeconds(0);
        this.setMilliseconds(0);
    };

Date.prototype.updateDate = Date.prototype.updateDate ||
    function updateDate(this: Date, date: Date): void {
        if (!isValidDate(this)) return;

        this.setFullYear(date.getFullYear());
        this.setMonth(date.getMonth());
        this.setDate(date.getDate());
    };

Date.prototype.newTime = Date.prototype.newTime ||
    function newTime(this: Date, time: Date): Date | null {
        if (!isValidDate(this)) return null;

        const newDate = new Date(this);
        newDate.updateTime(time);

        return newDate;
    };

Date.prototype.newDate = Date.prototype.newDate ||
    function newDate(this: Date, date: Date): Date | null {
        if (!isValidDate(this)) return null;

        const newDate = new Date(this);
        newDate.updateDate(date);

        return newDate;
    };

Date.prototype.newYear = Date.prototype.newYear ||
    function newYear(this: Date, year: number): Date | null {
        if (!isValidDate(this)) return null;

        const newDate = new Date(this);
        newDate.setFullYear(year);

        return newDate;
    };

Date.prototype.newMonth = Date.prototype.newMonth ||
    function newMonth(this: Date, month: number): Date | null {
        if (!isValidDate(this)) return null;

        const newDate = new Date(this);
        newDate.setMonth(month);

        return newDate;
    };

Date.prototype.newDay = Date.prototype.newDay ||
    function newDay(this: Date, day: number): Date | null {
        if (!isValidDate(this)) return null;

        const newDate = new Date(this);
        newDate.setDate(day);

        return newDate;
    };

Date.prototype.newHour = Date.prototype.newHour ||
    function newHour(this: Date, hour: number): Date | null {
        if (!isValidDate(this)) return null;

        const newDate = new Date(this);
        newDate.setHours(hour);

        return newDate;
    };

Date.prototype.newMinute = Date.prototype.newMinute ||
    function newMinute(this: Date, minute: number): Date | null {
        if (!isValidDate(this)) return null;

        const newDate = new Date(this);
        newDate.setMinutes(minute);

        return newDate;
    };

Date.prototype.newSecond = Date.prototype.newSecond ||
    function newSecond(this: Date, second: number): Date | null {
        if (!isValidDate(this)) return null;

        const newDate = new Date(this);
        newDate.setSeconds(second);

        return newDate;
    };

Date.prototype.matchDate = Date.prototype.matchDate ||
    function matchDate(this: Date, compareTo: Date): boolean {
        if (!isValidDate(this) || !isValidDate(compareTo)) return false;

        const source = new Date(this);
        const target = new Date(compareTo);

        source.clearTime();
        target.clearTime();

        return source.getTime() === target.getTime();
    };

Date.prototype.matchTime = Date.prototype.matchTime ||
    function matchTime(this: Date, compareTo: Date): boolean {
        if (!isValidDate(this) || !isValidDate(compareTo)) return false;

        const target = this.newTime(compareTo);

        return this.getTime() === target.getTime();
    };

Date.prototype.addYear = Date.prototype.addYear ||
    function addYear(this: Date, year: number): Date | null {
        if (!isValidDate(this)) return null;

        const newDate = new Date(this);
        newDate.setFullYear(newDate.getFullYear() + year);

        return newDate;
    };

Date.prototype.addMonth = Date.prototype.addMonth ||
    function addMonth(this: Date, month: number): Date | null {
        if (!isValidDate(this)) return null;

        const newDate = new Date(this);
        newDate.setMonth(newDate.getMonth() + month);

        return newDate;
    };

Date.prototype.addDay = Date.prototype.addDay ||
    function addDay(this: Date, day: number): Date | null {
        if (!isValidDate(this)) return null;

        const newDate = new Date(this);
        newDate.setDate(newDate.getDate() + day);

        return newDate;
    };

Date.prototype.addHour = Date.prototype.addHour ||
    function addHour(this: Date, hour: number): Date | null {
        if (!isValidDate(this)) return null;

        const newDate = new Date(this);
        newDate.setHours(newDate.getHours() + hour);

        return newDate;
    };

Date.prototype.addMinute = Date.prototype.addMinute ||
    function addMinute(this: Date, minute: number): Date | null {
        if (!isValidDate(this)) return null;

        const newDate = new Date(this);
        newDate.setMinutes(newDate.getMinutes() + minute);

        return newDate;
    };

Date.prototype.addSecond = Date.prototype.addSecond ||
    function addSecond(this: Date, second: number): Date | null {
        if (!isValidDate(this)) return null;

        const newDate = new Date(this);
        newDate.setSeconds(newDate.getSeconds() + second);

        return newDate;
    };

/*
 ** String Extension
 */

declare global {
    interface String {
        capitalize(): string;
        toUpperSnakeCase(): string;
        insertAt(index: number, value: string): string;
    }
}

String.prototype.capitalize = String.prototype.capitalize ||
    function capitalize(this: string): string {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

String.prototype.toUpperSnakeCase = String.prototype.toUpperSnakeCase ||
    function toUpperSnakeCase(this: string): string {
        return this.replace(/[\w]([A-Z])/g, m => `${m[0]}_${m[1]}`).toUpperCase();
    };

String.prototype.insertAt = String.prototype.insertAt ||
    function insertAt(this: string, index: number, value: string): string {
        const splitDigits = Array.from(this);
        splitDigits.splice(index, 0, value);

        return splitDigits.join('');
    };

/*
 ** Array Extension
 */

declare global {
    interface Array<T> {
        take(this: T[], count: number, from?: number): T[];
        filterDefined(this: T[]): T[];
    }
}

Array.prototype.take = Array.prototype.take ||
    function takeArray<T>(this: T[], count: number, from: number = 0): T[] {
        return take(this, count, from);
    };

Array.prototype.filterDefined = Array.prototype.filterDefined ||
    function filterDefinedArray<T>(this: T[]): T[] {
        return filterDefined(this);
    };

/*
 ** Map Extension
 */

declare global {
    interface Map<K, V> {
        map<T>(callbackfn: (value: V, key: K) => T): T[];
        reduce<T>(callbackfn: (previousValue: T, currentValue: V, currentKey: K) => T, initialValue: T): T;
    }
}

Map.prototype.map = Map.prototype.map ||
    function map<T, K, V>(this: Map<K, V>, callbackfn: (value: V, key: K) => T): T[] {
        const array: T[] = [];
        this.forEach((value, key) => {
            array.push(callbackfn(value, key));
        });

        return array;
    };

Map.prototype.reduce = Map.prototype.reduce ||
    function reduce<T, K, V>(
        this: Map<K, V>,
        callbackfn: (previousValue: T, currentValue: V, currentKey: K) => T, initialValue: T
    ): T {
        let buffer = initialValue;
        this.forEach((value, key) => {
            buffer = callbackfn(buffer, value, key);
        });

        return buffer;
    };

/*
 ** Custom Errors
 */

export class AssertionError extends Error {
    constructor(msg?: string) {
        super(msg ?? 'Assertion failed');
    }
}

export class ServiceError extends Error {
    readonly code: string;
    readonly data?: any;

    constructor(code: string, msg?: string, data?: any) {
        super(msg);

        this.name = 'ServiceError';
        this.code = code;
        this.data = data;
    }
}

type HttpErrorExtraData = {
    msg?: string;
    data?: any;
    code?: string;
};

export enum HttpStatusCode {
    Ok = 200,
    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,
    Conflict = 409,
    InternalError = 500,
    Forbidden = 403
}

export class HttpError extends Error {
    readonly statusCode: number;
    readonly data?: any;

    code?: string;

    constructor(statusCode: number, extraData?: HttpErrorExtraData) {
        super(extraData?.msg);

        this.statusCode = statusCode;
        this.code = extraData?.code;
        this.data = extraData?.data;
    }
}

export class BadRequestError extends HttpError {
    constructor(msg?: string, data?: any) {
        super(HttpStatusCode.BadRequest, { msg, data });
    }
}

export class UnauthorizedError extends HttpError {
    constructor(msg?: string, data?: any) {
        super(HttpStatusCode.Unauthorized, { msg, data });
    }
}

export class NotFoundError extends HttpError {
    constructor(msg?: string, data?: any) {
        super(HttpStatusCode.NotFound, { msg, data });
    }
}

export class InternalServerError extends HttpError {
    constructor(msg?: string, data?: any) {
        super(HttpStatusCode.InternalError, { msg, data });
    }
}
