export enum Type {
    Undefined = 0,
    Null = 1 << 0,
    Number = 1 << 1,
    String = 1 << 2,
    Boolean = 1 << 3,
    Date = 1 << 4,
    Object = 1 << 5,
    Array = 1 << 6,
    Function = 1 << 7,
    NonEmpty = 1 << 8,
    Valid = 1 << 9
}

const fnObjectToString = Object.prototype.toString;
const ArrayProto = Array.prototype;
const stringTag = '[object String]';
const numberTag = '[object Number]';
const dateTag = '[object Date]';
const arrayTag = '[object Array]';
const boolTag = '[object Boolean]';

let undef: undefined;

function isObjectLike(arg: any): boolean { // eslint-disable-line func-style
    return arg != null && typeof arg === 'object'; // eslint-disable-line eqeqeq
}

function innerMapToDeepObject(target: any, src: any, options: MapOptions): void { // eslint-disable-line func-style
    if (!ToolKit.isObject(target) || !ToolKit.isObject(src)) return;

    const srcKeys = Object.keys(src);
    const targetKeys = Object.keys(target);

    targetKeys
        .filter(key => srcKeys.includes(key))
        .reduce((obj, key) => {
            if (options.transformIsoToDate === true && ToolKit.isString(src[key])) {
                const date = ToolKit.parseDate(src[key]);

                obj[key] = ToolKit.isNull(date) ? src[key] : date;
                return obj;
            }

            if (ToolKit.isNativeTypeObject(src[key]) ||
                (!isObjectLike(src[key])) ||
                (isObjectLike(src[key]) && options.allowDynamicObjects && Object.keys(obj[key]).length === 0)) {
                obj[key] = src[key];
            }
            else innerMapToDeepObject(obj[key], src[key], options);

            return obj;
        }, target);
}

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

export default class ToolKit {
    /**
     * Type checks
     */

    static isDefined(arg: any): boolean {
        return arg !== undef;
    }

    static isObject(arg: any): arg is Object {
        return fnObjectToString.call(arg) === '[object Object]';
    }

    static isObjectLike = isObjectLike;

    static isString(arg: any): arg is string {
        return (typeof arg === 'string' || (!ToolKit.isArray(arg) && isObjectLike(arg) && fnObjectToString.call(arg) == stringTag)); // eslint-disable-line eqeqeq
    }

    static isFunction(arg: any): arg is Function {
        return fnObjectToString.call(arg) === '[object Function]';
    }

    static isArray(arg: any): arg is any[] {
        if (Array.isArray) return Array.isArray(arg);

        return fnObjectToString.call(arg) === arrayTag;
    }

    static isBoolean(arg: any): arg is boolean {
        return (
            arg === true ||
            arg === false ||
            (isObjectLike(arg) && fnObjectToString.call(arg) === boolTag)
        );
    }

    static isNumber(arg: any): arg is number {
        return (
            typeof arg === 'number' ||
            (isObjectLike(arg) && fnObjectToString.call(arg) === numberTag)
        );
    }

    static isNaN(arg: any): boolean {
        return this.isNumber(arg) && arg != +arg; // eslint-disable-line eqeqeq
    }

    static isFloat(value: number): boolean {
        return this.isNumber(value) && value % 1 !== 0;
    }

    static isDate(arg: any): arg is Date {
        return (
            (isObjectLike(arg) && fnObjectToString.call(arg) === dateTag) || false
        );
    }

    static isValidDate(arg: any): boolean {
        return ToolKit.isDate(arg) && !ToolKit.isNaN(arg.getTime());
    }

    static hasValue(arg: any): boolean {
        return arg !== undef && arg !== null;
    }

    static isUndefined(arg: any): arg is undefined {
        return arg === undef;
    }

    static isNull(arg: any): arg is null {
        return arg === null;
    }

    static isUndefinedOrNull(arg: any): arg is undefined | null {
        return arg === undef || arg === null;
    }

    static isNativeTypeObject(arg: any): boolean {
        return (
            ToolKit.isUndefined(arg) ||
            ToolKit.isNull(arg) ||
            ToolKit.isDate(arg) ||
            ToolKit.isBoolean(arg) ||
            ToolKit.isNumber(arg) ||
            ToolKit.isString(arg) ||
            ToolKit.isArray(arg) ||
            ToolKit.isFunction(arg)
        );
    }

    static isEmpty<T extends string | any[]>(arg: T): boolean {
        if (!ToolKit.isString(arg) && !ToolKit.isArray(arg)) throw new TypeError('arg is not of a valid type');

        return arg.length === 0;
    }

    static checkType<T = any>(arg: any, type: Type): arg is T {
        if (type & Type.Undefined && this.isUndefined(arg)) return true;

        if (type & Type.Null && this.isNull(arg)) return true;

        if (type & Type.Number && this.isNumber(arg)) {
            if (type & ~Type.Valid) return true;
            if (type & Type.Valid && !this.isNaN(arg)) return true;
        }

        if (type & Type.String && this.isString(arg)) {
            if (type & ~Type.NonEmpty) return true;
            if (type & Type.NonEmpty && arg.length > 0) return true;
        }

        if (type & Type.Boolean && this.isBoolean(arg)) return true;

        if (type & Type.Date && this.isDate(arg)) {
            if (type & ~Type.Valid) return true;
            if (type & Type.Valid && this.isValidDate(arg)) return true;
        }

        if (type & Type.Object && this.isObject(arg)) {
            if (type & ~Type.NonEmpty) return true;
            if (type & Type.NonEmpty && Object.keys(arg).length > 0) return true;
        }

        if (type & Type.Array && this.isArray(arg)) {
            if (type & ~Type.NonEmpty) return true;
            if (type & Type.NonEmpty && arg.length > 0) return true;
        }

        if (type & Type.Function && this.isFunction(arg)) return true;

        return false;
    }

    static assertType<T = any>(arg: T, type: Type): T {
        if (!this.checkType<T>(arg, type)) throw new Error('assertion failed');

        return arg;
    }

    static computeForType<InputType, ComputeResult, DefaultResult extends any = null>(
        arg: InputType,
        condition: Type,
        computeFn: (arg: InputType) => ComputeResult,
        defaultValue: DefaultResult
    ): ComputeResult | DefaultResult {
        if (!this.checkType<InputType>(arg, condition)) return defaultValue;

        return computeFn(arg);
    }

    static noop(): void { }

    /**
   * Array
   */

    static addRange(src: any[], newElements: any[]) {
        ArrayProto.push.apply(src, newElements);
    }

    static clearCollection(collection: any[]) {
        if (ToolKit.isArray(collection)) collection.splice(0, collection.length);
    }

    static diffCollection(
        array: any[],
        values: any[],
        options?: DiffOptions
    ): any[] {
        const result: any[] = [];

        if (!ToolKit.isArray(array) || !ToolKit.isArray(values) || !array.length) return result;

        const internalOptions = options || {};
        const { objectKey, predicate, format, alternativeFormat } = internalOptions;

        let comparator: (item: any, array: any[]) => boolean;

        if (ToolKit.isFunction(predicate)) comparator = predicate;
        else comparator = (item, collection) => collection.includes(item);

        array.forEach(obj => {
            let transformedValue = obj;
            if (ToolKit.isString(objectKey)) transformedValue = transformedValue[objectKey];

            if (ToolKit.isFunction(format)) transformedValue = format(transformedValue);

            if (comparator(transformedValue, values) === false) {
                if (ToolKit.isFunction(alternativeFormat)) {
                    transformedValue = obj;
                    if (ToolKit.isString(objectKey)) transformedValue = transformedValue[objectKey];

                    transformedValue = alternativeFormat(transformedValue);

                    if (comparator(transformedValue, values)) return;
                }

                result.push(obj);
            }
        });

        return result;
    }

    static findIndex<T>(array: T[], predicate: (item: T, index: number) => boolean) {
        if (!ToolKit.isArray(array)) return -1;

        for (let idx = 0; idx < array.length; idx++) {
            if (predicate(array[idx], idx) === true) return idx;
        }

        return -1;
    }

    static find<T>(array: T[], predicate: (item: T, index: number) => boolean) {
        if (!ToolKit.isArray(array)) return null;

        for (let idx = 0; idx < array.length; idx++) {
            if (predicate(array[idx], idx) === true) return array[idx];
        }

        return null;
    }

    static orderBy<T>(
        array: T[],
        propertyAccessor: string,
        options?: { nullFirst?: boolean; ascending?: boolean }
    ): void {
        if (!ToolKit.isArray(array) || !ToolKit.isString(propertyAccessor)) {
            const className = ToolKit.getClassName(ToolKit);
            const method = ToolKit.getClassMethodName(ToolKit, ToolKit.orderBy);
            throw new Error(`${className} -> ${method}: invalid parameters.`);
        }

        const internalOptions = { nullFirst: false, ascending: true };
        if (ToolKit.hasValue(options) && ToolKit.isObject(options)) {
            if (options.nullFirst === true) internalOptions.nullFirst = true;
            if (options.ascending === false) internalOptions.ascending = false;
        }

        const nullOrderValue = internalOptions.nullFirst ? -1 : 1;
        const ascOrderValue = internalOptions.ascending ? 1 : -1;

        array.sort((itemA, itemB) => {
            const aProperty = ToolKit.getPropertySafe(itemA, propertyAccessor);
            const bProperty = ToolKit.getPropertySafe(itemB, propertyAccessor);

            if (aProperty === null) return nullOrderValue * 1;
            if (bProperty === null) return nullOrderValue * -1;
            if (aProperty < bProperty) return ascOrderValue * -1;
            if (aProperty > bProperty) return ascOrderValue * 1;

            return 0;
        });
    }

    static sortByProperty<T>(
        array: T[],
        propertyAccessor: string,
        compareFn: (a: any, b: any) => number,
        options?: { nullFirst?: boolean, ascending?: boolean }
    ): void {
        if (!ToolKit.isArray(array) || !ToolKit.isString(propertyAccessor) || !ToolKit.isFunction(compareFn)) {
            const className = ToolKit.getClassName(ToolKit);
            const method = ToolKit.getClassMethodName(ToolKit, ToolKit.sortByProperty);
            throw new Error(`${className} -> ${method}: invalid parameters.`);
        }

        const internalOptions = { nullFirst: false, ascending: true };
        if (ToolKit.hasValue(options) && ToolKit.isObject(options)) {
            if (options.nullFirst === true) internalOptions.nullFirst = true;
            if (options.ascending === false) internalOptions.ascending = false;
        }

        const nullOrderValue = internalOptions.nullFirst ? -1 : 1;
        const ascOrderValue = internalOptions.ascending ? 1 : -1;

        array.sort((aItem, bItem) => {
            const aProperty = ToolKit.getPropertySafe(aItem, propertyAccessor);
            const bProperty = ToolKit.getPropertySafe(bItem, propertyAccessor);

            if (aProperty === null) return nullOrderValue * 1;
            if (bProperty === null) return nullOrderValue * -1;

            return ascOrderValue * compareFn(aProperty, bProperty);
        });
    }

    static countCollection<T>(
        array: T[],
        predicate: (item: T, index: number) => boolean
    ): number {
        if (!ToolKit.isArray(array)) return -1;

        if (!ToolKit.isFunction(predicate)) return array.length;

        let count = 0;
        for (let idx = 0; idx < array.length; idx++) {
            if (predicate(array[idx], idx) === true) count += 1;
        }

        return count;
    }

    static removeFromCollection<T>(
        array: T[],
        predicate: (item: T, index: number) => boolean
    ): boolean {
        if (!ToolKit.isArray(array)) return false;
        if (!ToolKit.isFunction(predicate)) return false;

        for (let idx = 0; idx < array.length;) {
            if (predicate(array[idx], idx) === true) array.splice(idx, 1);
            else idx += 1;
        }

        return true;
    }

    static removeAt<T>(array: T[], index: number): boolean {
        if (!ToolKit.isArray(array)) return false;

        array.splice(index, 1);
        return true;
    }

    /**
   * String
   */

    static fixedLenInteger(value: number, length: number): string {
        return (Array(length).join('0') + value).slice(-length);
    }

    static fixedLenString(value: string, length: number): string {
        return (value + Array(length).join(' ')).slice(0, length);
    }

    static toCamelCase(value: string): string {
        if (!ToolKit.isString(value)) throw new TypeError('value is not valid');

        return value
            .replace(/\s(.)/g, $1 => $1.toUpperCase())
            .replace(/\s/g, '')
            .replace(/^(.)/, $1 => $1.toLowerCase());
    }

    /**
     * Number
     */

    static randomNumber(minValue: number, maxValue: number): number {
        return Math.floor(Math.random() * maxValue + minValue);
    }

    /**
     * Date
     */

    static dateOnly(date: Date): Date {
        if (!ToolKit.isValidDate(date)) throw new TypeError('date is not valid');

        return new Date(date.toDateString());
    }

    static formatDate: (date: Date, customFn?: (year: string, month: string, day: string) => string) => string =
        (date, customFn = (year, month, day) => `${day}/${month}/${year}`) => {
            if (!ToolKit.isValidDate(date)) throw new TypeError('date is not valid');
            if (!ToolKit.isFunction(customFn)) throw new TypeError('customFn is not valid');

            const day = ToolKit.fixedLenInteger(date.getDate(), 2);
            const month = ToolKit.fixedLenInteger(date.getMonth() + 1, 2);
            const year = ToolKit.fixedLenInteger(date.getFullYear(), 4);
            return customFn(year, month, day);
        };

    static formatHour: (value: Date | number, customFn?: (h: string, m: string, s: string) => string) => string =
        (value, customFn = (hour, minute, second) => `${hour}:${minute}:${second}`) => {
            if (ToolKit.isUndefinedOrNull(value)) throw new TypeError('value is not valid');
            if (!ToolKit.isFunction(customFn)) throw new TypeError('customFn is not valid');

            let hour;
            let minute;
            let second;

            if (ToolKit.isDate(value) && ToolKit.isValidDate(value)) {
                hour = value.getHours();
                minute = value.getMinutes();
                second = value.getSeconds();
            }

            if (ToolKit.isNumber(value) && !ToolKit.isNaN(value)) {
                hour = Math.floor(value / 3600);
                minute = Math.floor((value - hour * 3600) / 60);
                second = value - hour * 3600 - minute * 60;
            }

            if (ToolKit.isNumber(hour) && ToolKit.isNumber(minute) && ToolKit.isNumber(second)) {
                hour = ToolKit.fixedLenInteger(hour, 2);
                minute = ToolKit.fixedLenInteger(minute, 2);
                second = ToolKit.fixedLenInteger(second, 2);

                return customFn(hour, minute, second);
            }

            throw new TypeError('type not supported');
        }

    static dateToFormat: (value: Date, format?: string) => string =
        (value, format = 'dd/MM/yyyy') => {
            try {
                let formattedDate = format;
                formattedDate = ToolKit
                    .formatDate(value, (year, month, day) => formattedDate
                        .replace('dd', day)
                        .replace('MM', month)
                        .replace('yyyy', year));
                formattedDate = ToolKit
                    .formatHour(value, (hour, minute, second) => formattedDate
                        .replace('HH', hour)
                        .replace('mm', minute)
                        .replace('ss', second));
                return formattedDate;
            }
            catch (err) {
                // ignore
            }

            return format;
        }

    static parseDate(input: string): Date | null {
        const iso = /(\d{2})[-\/]{1}(\d{2})[-\/]{1}(\d{4})( (\d{2}):(\d{2})[:]?(\d{2})?)?/; // eslint-disable-line no-useless-escape
        const parts = input.match(iso);

        if (ToolKit.isArray(parts)) {
            for (let idx = parts.length - 1; idx >= 0; idx--) {
                if (!ToolKit.isString(parts[idx])) parts.pop();
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
    }

    static parseHour(input: string): Date | null {
        if (ToolKit.isUndefinedOrNull(input)) return null;

        const iso = /(\d{2}):(\d{2})[:]?(\d{2})?/;
        const parts = input.match(iso);

        if (ToolKit.isArray(parts)) {
            for (let idx = parts.length - 1; idx >= 0; idx--) {
                if (!ToolKit.isString(parts[idx])) parts.pop();
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
    }

    static safeParseIsoDate<T>(value: T): Date | T {
        if (ToolKit.isString(value)) {
            const date = new Date(value);
            if (ToolKit.isValidDate(date)) return date!;
        }

        return value;
    }

    /**
   * Classes
   */

    static getClassName(instance: any): string | null {
        if (ToolKit.isObject(instance) && ToolKit.isFunction(instance.constructor)) return instance.constructor.name;
        if (ToolKit.isFunction(instance)) return instance.name;

        return null;
    }

    static getClassMethodName(instance: any, method: Function): string | null {
        if (
            ToolKit.isUndefinedOrNull(instance) ||
            !(ToolKit.isObject(instance) || ToolKit.isFunction(instance)) ||
            !ToolKit.isFunction(method)
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
    }

    // Previously className
    static className(...args: any[]): string | undefined {
        if (!ToolKit.isArray(args)) return undef;
        const finalClassName: string[] = [];
        args.forEach(item => {
            if (ToolKit.isUndefinedOrNull(item)) return;

            if (ToolKit.isString(item)) {
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
    }

    static isCollectionOf<T = any>(array: T[], instanceOf: any): boolean {
        for (let idx = 0; idx < array.length; idx++) {
            if (!(array[idx] instanceof instanceOf)) return false;
        }

        return true;
    }

    /**
   * Utilities
   */

    static getObjectKeysDeep(object: any, prefix: string = ''): string[] {
        if (ToolKit.isNativeTypeObject(object) || !isObjectLike(object)) return [];

        const keys: string[] = [];
        let internalPrefix = prefix;
        if (internalPrefix.length > 0) internalPrefix += '.';

        Object.keys(object).forEach((prop: string) => {
            const propName = internalPrefix + prop;
            keys.push(propName);
            if (!ToolKit.isNativeTypeObject(object[prop]) && isObjectLike(object)) {
                keys.push(...ToolKit.getObjectKeysDeep(object[prop], propName));
            }
        });

        return keys;
    }

    static mapToShallowObject(target: any, src: any, filterPredicate?: (key: string, value: any) => boolean): void {
        if (!ToolKit.isObject(target) || !ToolKit.isObject(src)) return;

        let predicate = (() => true) as (key: string, value: any) => boolean;
        if (ToolKit.isFunction(filterPredicate)) predicate = filterPredicate as (key: string, value: any) => boolean;

        Object.keys(src)
            .filter(key => Object.keys(target).includes(key))
            .reduce((obj, key) => {
                if (predicate(key, obj)) obj[key] = src[key];

                return obj;
            }, target);
    }

    static mapToDeepObject(target: any, src: any, options: MapOptions = {
        transformIsoToDate: false,
        strictMapping: false,
        ignoreStrictMappingWhenNull: true,
        allowDynamicObjects: false
    }): void {
        if (!ToolKit.isObject(target) || !ToolKit.isObject(src)) return;
        const defaultOptions = {
            transformIsoToDate: false,
            strictMapping: false,
            ignoreStrictMappingWhenNull: true,
            allowDynamicObjects: false
        };
        const internalOptions = options || defaultOptions;

        if (ToolKit.isUndefinedOrNull(options.transformIsoToDate)) {
            internalOptions.transformIsoToDate = defaultOptions.transformIsoToDate;
        }
        if (ToolKit.isUndefinedOrNull(options.strictMapping)) {
            internalOptions.strictMapping = defaultOptions.strictMapping;
        }
        if (ToolKit.isUndefinedOrNull(options.ignoreStrictMappingWhenNull)) {
            internalOptions.ignoreStrictMappingWhenNull =
                defaultOptions.ignoreStrictMappingWhenNull;
        }

        if (ToolKit.isUndefinedOrNull(options.allowDynamicObjects)) {
            internalOptions.allowDynamicObjects = defaultOptions.allowDynamicObjects;
        }

        if (internalOptions.strictMapping === true) {
            const diffOptions =
                internalOptions.ignoreStrictMappingWhenNull === true
                    ? {
                        alternativeFormat: (item: any) => {
                            if (ToolKit.isString(item)) return item.split('.')[0];
                            return item;
                        }
                    }
                    : undef;
            const missingProperties = ToolKit.diffCollection(
                ToolKit.getObjectKeysDeep(target),
                ToolKit.getObjectKeysDeep(src),
                diffOptions
            );
            if (missingProperties.length > 0) {
                throw new Error(`${ToolKit.getClassName(ToolKit)} -> ${ToolKit.getClassMethodName(
                    ToolKit,
                    ToolKit.mapToDeepObject
                )}: source object's properties doen't match the target object: ${missingProperties.join(', ')}.`);
            }
        }

        innerMapToDeepObject(target, src, internalOptions);
    }

    static getPropertySafe(obj: any, propertyAccessor: string): any | undefined {
        if (!ToolKit.isString(propertyAccessor)) return null;
        const retValue = propertyAccessor
            .split('.')
            .reduce((acc, part) => acc && acc[part], obj);

        return retValue || null;
    }

    static cast<T>(arg: any): T {
        return arg as T;
    }

    static safeJsonReplacer(_key: any, value: any) {
        if (ToolKit.isNaN(value)) return 'NaN';
        if (value === Infinity) return 'Infinity';
        if (value === -Infinity) return '-Infinity';
        if (ToolKit.isString(value)) {
            const matches = value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            if (ToolKit.isArray(matches) && ToolKit.isDate(ToolKit.safeParseIsoDate(value))) {
                return `$\{DATE_${value}\}`; // eslint-disable-line no-useless-escape
            }
        }

        return value;
    }

    static safeJsonReviver(_key: any, value: any) {
        if (value === 'NaN') return NaN;
        if (value === 'Infinity') return Infinity;
        if (value === '-Infinity') return -Infinity;

        if (ToolKit.isString(value)) {
            const match = value.match(/\$\{DATE_(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\}/);
            if (ToolKit.isArray(match) && match.length >= 2) return ToolKit.safeParseIsoDate(match[1]);
        }

        return value;
    }

    static toJSON(value: any): string {
        return JSON.stringify(value, ToolKit.safeJsonReplacer);
    }

    static fromJSON<T = any>(value: string): T | null {
        try {
            return JSON.parse(value, ToolKit.safeJsonReviver);
        }
        catch (error) {
            return null;
        }
    }

    static quickClone<T>(arg: T): T | null {
        try {
            return JSON.parse(JSON.stringify(arg, ToolKit.safeJsonReplacer), ToolKit.safeJsonReviver);
        }
        catch (error) {
            return null;
        }
    }

    // type Timeout

    static setTimeout<T>(handler: () => T, timeout?: number): Promise<T> {
        return new Promise((resolve, reject) => {
            try {
                setTimeout(() => resolve(handler()), timeout!);
            }
            catch (err) {
                reject(err);
            }
        });
    }

    /*
     ** Objects
     */

    static hasProperty(obj: any, prop: string | number): boolean {
        if (!ToolKit.isObject(obj)) throw new TypeError('obj is not valid');
        if (!ToolKit.isString(prop) && !ToolKit.isNumber(prop)) throw new TypeError('prop is not valid');

        return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    // Encapsulate the idea of passing a new object as the first parameter
    // to Object.assign to ensure we correctly copy data instead of mutating
    static pureObjectAssign(...values: any[]): any | null {
        if (!ToolKit.isArray(values)) return null;
        if (values.some(val => !ToolKit.isObject(val))) return null;

        return Object.assign({}, ...values);
    }
}

export class TimeoutPromise<T> {
    private _promise: Promise<T>;
    private _isTerminated = false;

    protected timeoutId!: number;
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
                }, timeout);
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
        getWeek(): number;
        getWeeks(boundToMonth?: boolean): Week[];
        getStartOfMonth(): Date;
        getEndOfMonth(): Date;
        updateTime(time: Date): void;
        updateDate(date: Date): void;
    }
}

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

Date.prototype.updateTime = Date.prototype.updateTime || function updateTime(this: Date, time: Date): void {
    if (!ToolKit.isValidDate(this) || !ToolKit.checkType(time, Type.Date | Type.Valid)) return;

    this.setHours(time.getHours());
    this.setMinutes(time.getMinutes());
    this.setSeconds(time.getSeconds());
    this.setMilliseconds(time.getMilliseconds());
};

Date.prototype.updateDate = Date.prototype.updateDate || function updateDate(this: Date, date: Date): void {
    if (!ToolKit.isValidDate(this) || !ToolKit.checkType(date, Type.Date | Type.Valid)) return;

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
    }
}

String.prototype.capitalize = function capitalize(): string {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
