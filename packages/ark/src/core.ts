import { Type } from './types';

const fnObjectToString = Object.prototype.toString;
const ArrayProto = Array.prototype;
const stringTag = '[object String]';
const numberTag = '[object Number]';
const dateTag = '[object Date]';
const arrayTag = '[object Array]';
const boolTag = '[object Boolean]';

export let undef: undefined;

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
export const isObjectLike = (arg: any): boolean => !!arg && typeof arg === 'object'; // eslint-disable-line eqeqeq
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
 ** RegExp
 */

export type NativeRegExp = globalThis.RegExp;
export const isRegExp = (arg: any): arg is RegExp => typeof arg === 'object' && arg.constructor === RegExp;
export class RegExp {
    public static readonly EscapedIsoDate = /^\$\{DATE_(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\}$/;
    public static readonly IsoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    public static readonly DateFormat = /^((?:[0-3])(?:(?<=[0-2])[0-9]|(?<=3)[01]))[-\/]((?:[01])(?:(?<=0)[0-9]|(?<=1)[0-2]))[-\/](\d{4})(?: ([0-2](?:(?<=[0-1])[0-9]|(?<=2)[0-4])):([0-5][0-9])(?:[:]([0-5][0-9]))?)?$/; // eslint-disable-line no-useless-escape, max-len
    public static readonly DateInputPattern = /^(\d{1,2})?(\/)?(\d{1,2})?(\/)?(\d{1,4})?$/; // eslint-disable-line no-useless-escape
    public static readonly DateAutoSlash = /^((?:\d{2})(?:(?<=\d{2})\/(?:\d{2}))?)$/;
    public static readonly TimeFormat = /^(?:([0-2](?:(?<=[0-1])[0-9]|(?<=2)[0-4])):([0-5][0-9])(?:[:]([0-5][0-9]))?)?$/; // eslint-disable-line max-len
    public static readonly TimeInputPattern = /^(\d{1,2})?(:)?(\d{1,2})?$/; // eslint-disable-line no-useless-escape
    public static readonly TimeAutoColon = /^(\d{2})$/;
    public static readonly DateTimeFormat = /^((?:[0-3])(?:(?<=[0-2])[0-9]|(?<=3)[01]))[-\/]((?:[01])(?:(?<=0)[0-9]|(?<=1)[0-2]))[-\/](\d{4})(?: ([0-2](?:(?<=[0-1])[0-9]|(?<=2)[0-4])):([0-5][0-9]))$/; // eslint-disable-line no-useless-escape, max-len
    public static readonly DateTimeInputPattern = /^(\d{1,2})?(?:\/)?(\d{1,2})?(?:\/)?(\d{1,4})?(?: )?(\d{1,2})?(?::)?(\d{1,2})?$/; // eslint-disable-line no-useless-escape, max-len
    public static readonly DateTimeAutoColon = /^(\d{2}\/\d{2}\/\d{4} \d{2})$/;
    public static readonly DateTimeAutoSpace = /^(\d{2}\/\d{2}\/\d{4})$/;
    public static readonly StringFormat = /{(\d+)}/g;
    public static readonly LocalIP = /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;
}