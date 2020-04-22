/* eslint-disable func-style */
/* eslint-disable no-extend-native */

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

const fnObjectToString = Object.prototype.toString;
const ArrayProto = Array.prototype;
const stringTag = '[object String]';
const numberTag = '[object Number]';
const dateTag = '[object Date]';
const arrayTag = '[object Array]';
const boolTag = '[object Boolean]';

let undef: undefined;

type NativeRegExp = globalThis.RegExp;

export class RegExp {
    public static readonly EscapedIsoDate = /^\$\{DATE_(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\}$/;
    public static readonly IsoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    public static readonly DateFormat = /^(\d{2})[-\/](\d{2})[-\/](\d{4})( (\d{2}):(\d{2})[:]?(\d{2})?)?$/; // eslint-disable-line no-useless-escape
    public static readonly StringFormat = /{(\d+)}/g;

    // public static readonly DateFormat = /(\d{2})[-\/]{1}(\d{2})[-\/]{1}(\d{4})( (\d{2}):(\d{2})[:]?(\d{2})?)?/;
}

const innerMapToDeepObject = (target: any, src: any, options: MapOptions): void => {
    if (!isObject(target) || !isObject(src)) return;

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
export const isObject = (arg: any): arg is Object => arg && typeof arg === 'object' && arg.constructor === Object;
export const isString = (arg: any): arg is string =>
    (typeof arg === 'string' || (!isArray(arg) && isObjectLike(arg) && fnObjectToString.call(arg) == stringTag)); // eslint-disable-line eqeqeq

export const isFunction = (arg: any): arg is Function => ['[object Function]', '[object AsyncFunction]'].indexOf(fnObjectToString.call(arg)) >= 0;

export const isArray = (arg: any): arg is any[] => {
    if (Array.isArray) return Array.isArray(arg);

    return fnObjectToString.call(arg) === arrayTag;
};

export const isBoolean = (arg: any): arg is boolean =>
    arg === true ||
    arg === false ||
    (isObjectLike(arg) && fnObjectToString.call(arg) === boolTag);

export const isNumber = (arg: any): arg is number =>
    typeof arg === 'number' ||
    (isObjectLike(arg) && fnObjectToString.call(arg) === numberTag);

export const isNaN = (arg: any): boolean => isNumber(arg) && arg != +arg; // eslint-disable-line eqeqeq
export const isFloat = (value: number): boolean => isNumber(value) && value % 1 !== 0;
export const isDate = (arg: any): arg is Date =>
    (isObjectLike(arg) && fnObjectToString.call(arg) === dateTag) || false;

export const isValidDate = (arg: any): boolean => isDate(arg) && !isNaN(arg.getTime());
export const isUndefined = (arg: any): arg is undefined => arg === undef;
export const isNull = (arg: any): arg is null => arg === null;
export const isObjectLike = (arg: any): boolean => arg && typeof arg === 'object'; // eslint-disable-line eqeqeq
export const isNativeTypeObject = (arg: any): boolean =>
    isUndefined(arg) ||
    isNull(arg) ||
    isDate(arg) ||
    isBoolean(arg) ||
    isNumber(arg) ||
    isString(arg) ||
    isArray(arg) ||
    isFunction(arg);

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

    if (type & Type.Object && isObject(arg)) {
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
    if (!isNumber(value) || isNaN(value)) throw new AssertionError(msg);
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

export const addRange = (src: any[], newElements: any[]) => {
    ArrayProto.push.apply(src, newElements);
};

export const clearCollection = (collection: any[]) => {
    if (isArray(collection)) collection.splice(0, collection.length);
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
    if (isDefined(options) && isObject(options)) {
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
    if (isDefined(options) && isObject(options)) {
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

export const removeAt = <T>(array: T[], index: number): boolean => {
    if (!isArray(array)) return false;

    array.splice(index, 1);
    return true;
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
        (match, number) => (isUndefined(formatValues[number]) ? match : formatValues[number])
    );
};

export const generateFormat = (value: string, expression: NativeRegExp): string => {
    let count = 0;

    return value.replace(expression, () => `{${count++}}`);
};

/**
 ** Number
 */

export const randomNumber = (minValue: number, maxValue: number): number =>
    Math.floor(Math.random() * maxValue + minValue);

/**
 ** Date
 */

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

export const parseDate = (input: string): Date | null => {
    const parts = input.match(RegExp.DateFormat);

    if (isArray(parts)) {
        for (let idx = parts.length - 1; idx >= 0; idx--) {
            if (!isString(parts[idx])) parts.pop();
            else break;
        }

        if (parts.length === 8) {
            return new Date(
                parseInt(parts[3], 10),
                parseInt(parts[2], 10) - 1,
                parseInt(parts[1], 10),
                parseInt(parts[5], 10),
                parseInt(parts[6], 10),
                parseInt(parts[7], 10)
            );
        }
        if (parts.length === 7) {
            return new Date(
                parseInt(parts[3], 10),
                parseInt(parts[2], 10) - 1,
                parseInt(parts[1], 10),
                parseInt(parts[5], 10),
                parseInt(parts[6], 10),
                0
            );
        }
        if (parts.length === 4) {
            return new Date(
                parseInt(parts[3], 10),
                parseInt(parts[2], 10) - 1,
                parseInt(parts[1], 10)
            );
        }
    }

    return null;
};

export const parseHour = (input: string): Date | null => {
    if (!isDefined(input)) return null;

    const iso = /(\d{2}):(\d{2})[:]?(\d{2})?/;
    const parts = input.match(iso);

    if (isArray(parts)) {
        for (let idx = parts.length - 1; idx >= 0; idx--) {
            if (!isString(parts[idx])) parts.pop();
            else break;
        }

        if (parts.length > 2) {
            const date = new Date();
            date.setHours(parseInt(parts[1], 10));
            date.setMinutes(parseInt(parts[2], 10));

            if (parts.length > 3) date.setSeconds(parseInt(parts[3], 10));
            else date.setSeconds(0);

            return date;
        }
    }

    return null;
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
    if (isObject(instance) && isFunction(instance.constructor)) return instance.constructor.name;
    if (isFunction(instance)) return instance.name;

    return null;
};

export const getClassMethodName = (instance: any, method: Function): string | null => {
    if (
        !isDefined(instance) ||
        !(isObject(instance) || isFunction(instance)) ||
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

export const conditionalConcat = (...args: (string | Record<string, boolean>)[]): string | undefined => {
    if (!isArray(args)) return undef;

    const finalClassName: string[] = [];

    args.forEach(item => {
        if (!isDefined(item)) return;

        if (isString(item)) {
            finalClassName.push(item);
        }
        else {
            Object.keys(item).forEach((key: string) => {
                if (item[key]) {
                    finalClassName.push(key);
                }
            });
        }
    });

    return finalClassName.length > 0 ? finalClassName.join(' ') : undef;
};

export const isCollectionOf = <T = any>(array: T[], instanceOf: any): boolean => {
    for (let idx = 0; idx < array.length; idx++) {
        if (!(array[idx] instanceof instanceOf)) return false;
    }

    return true;
};

/**
 ** Utilities
 */

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
        if (!isObject(target) || !isObject(src)) return;

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
    if (!isObject(target) || !isObject(src)) return;
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

export const getPropertySafe = (obj: any, propertyAccessor: string): any | undefined => {
    if (!isString(propertyAccessor)) return null;
    const retValue = propertyAccessor
        .split('.')
        .reduce((acc, part) => acc && acc[part], obj);

    return retValue || null;
};

export const cast = <T>(arg: any): T => arg as T;

export const safeJsonReplacer = (_key: any, value: any) => {
    if (isNaN(value)) return 'NaN';
    if (value === Infinity) return 'Infinity';
    if (value === -Infinity) return '-Infinity';
    if (isString(value)) {
        const matches = value.match(RegExp.IsoDate);
        if (isArray(matches) && isDate(safeParseIsoDate(value))) {
            return `$\{DATE_${value}\}`; // eslint-disable-line no-useless-escape
        }
    }

    return value;
};

export const safeJsonReviver = (_key: any, value: any) => {
    if (value === 'NaN') return NaN;
    if (value === 'Infinity') return Infinity;
    if (value === '-Infinity') return -Infinity;

    if (isString(value)) {
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
        return JSON.parse(JSON.stringify(arg, safeJsonReplacer), safeJsonReviver);
    }
    catch (error) {
        return null;
    }
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

export const noop = (): void => { };

/*
 ** Objects
 */

export const hasProperty = (obj: any, prop: string | number): boolean => {
    if (!isObject(obj)) throw new TypeError('obj is not valid');
    if (!isString(prop) && !isNumber(prop)) throw new TypeError('prop is not valid');

    return Object.prototype.hasOwnProperty.call(obj, prop);
};

// Encapsulate the idea of passing a new object as the first parameter
// to Object.assign to ensure we correctly copy data instead of mutating
export const pureObjectAssign = (...values: any[]): any | null => {
    if (!isArray(values)) return null;
    if (values.some(val => !isObjectLike(val))) return null;

    return Object.assign({}, ...values);
};

// An alternative version of pureObjectAssign which ignores undefined values
// It only applys to object's first level properties
export const pureObjectExtend = (...values: any[]): any | null => {
    const obj = pureObjectAssign(...values);
    if (obj === null) return null;
    if (isObject(obj)) {
        (obj as Object).forEachProperty((value, key) => {
            if (value === undef) delete obj[key];
        });
    }

    return obj;
};

export class TimeoutPromise<T> {
    private _promise: Promise<T>;
    private _isTerminated = false;

    protected timeoutId!: any;
    protected resolve!: (value?: T | PromiseLike<T> | undefined) => void;
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

export class Debounce<T> {
    protected handler: (value: T) => void;
    protected timeout: number;
    protected timeoutId!: any;

    constructor(handler: (value: T) => void, timeout: number) {
        this.handler = handler;
        this.timeout = timeout;
    }

    push(value: T): void {
        clearTimeout(this.timeoutId);

        try {
            this.timeoutId = setTimeout(() => {
                this.handler(value);
            }, this.timeout);
        }
        catch (err) {
            // Ignore
        }
    }
}

export class DebounceInterval<T> {
    protected handler: (value: T) => void;
    protected timeout: number;
    protected timeoutId!: any;
    protected pushAwaiting: boolean = false;
    protected lastValue!: T;

    constructor(handler: (value: T) => void, timeout: number) {
        this.handler = handler;
        this.timeout = timeout;
    }

    push(value: T): void {
        this.lastValue = value;

        if (this.pushAwaiting === false) {
            try {
                this.timeoutId = setTimeout(() => {
                    if (this.pushAwaiting === true) {
                        this.pushAwaiting = false;
                        this.handler(this.lastValue);
                    }
                }, this.timeout);
                this.pushAwaiting = true;
            }
            catch (err) {
                // Ignore
            }
        }
    }

    clear() {
        clearTimeout(this.timeoutId);
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
        updateDate(date: Date): void;
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
            weekNum += 1;
            start = end + 1;
            end += 7;
            monthOverlap = false;
            if (end > numDays) {
                if (boundToMonth === true) end = numDays;
                else monthOverlap = true;
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

Date.prototype.updateDate = Date.prototype.updateDate ||
    function updateDate(this: Date, date: Date): void {
        if (!isValidDate(this)) return;

        this.setFullYear(date.getFullYear());
        this.setMonth(date.getMonth());
        this.setDate(date.getDate());
    };

/*
 ** String Extension
 */

declare global {
    interface String {
        capitalize(): string;
        toUpperSnakeCase(): string;
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

/*
 ** Object Extension
 */

declare global {
    interface Object {
        forEachProperty(callbackfn: (value: any, key: string) => void): void;
    }
}

// 
function forEachProperty<T extends Object>(this: T, callbackfn: (value: any, key: string) => void): void {
    Object.keys(this).forEach(key => callbackfn(this[key as keyof T], key));
}

// Specific format for react-native
if (!Object.prototype.forEachProperty) {
    Object.defineProperty(Object.prototype, forEachProperty.name, {
        value: forEachProperty,
        enumerable: false,
        configurable: true,
        writable: true
    });
}

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
        super(msg || 'Assertion failed');
    }
}

export class ServiceError extends Error {
    readonly code: string;
    readonly data?: any;

    constructor(code: string, msg?: string, data?: any) {
        super(msg);

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
