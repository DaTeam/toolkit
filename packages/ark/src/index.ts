/* eslint-disable no-extend-native */
import { isArray, isBoolean, isDate, isDefined, isFloat, isFunction, isNull, isNumber, isObjectLike, isString, isUndefined, isValidDate, isValidNumber, NativeRegExp } from './core';
import { RegExp } from './core';

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

export const findDiff = (source: string, compareTo: string): number => {
    let sourceArray = Array.from(source);
    let compareArray = Array.from(compareTo);

    if (source.length < compareTo.length) [sourceArray, compareArray] = [compareArray, sourceArray];

    return sourceArray.findIndex((chr, idx) => chr !== compareArray[idx]);
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

// TOOD: handle this format : 2020-09-17T00:00:00Z https://www.regextester.com/97766

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

export const conditionalConcat = (...args: ConditionalParams[]): string | undefined => {
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
 ** Events
 */

export const onEvent = (obj: any, ...args: any[]) => obj.addEventListener(...args);
export const offEvent = (obj: any, ...args: any[]) => obj.removeEventListener(...args);

/**
 ** Utilities
 */

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

// [Warning] Interval is triggered after execution complete
export const setIntervalAsync = (handler: () => any, timeout?: number) => {
    let enabled = true;
    let timeoutId: any | null = null;

    const clear = () => {
        enabled = false;
        if (timeoutId) clearTimeout(timeoutId);
    };

    intervalFn();

    async function intervalFn() {
        await Promise.resolve(handler());
        if (!enabled) return;

        timeoutId = setTimeout(intervalFn, timeout!);
    }

    return clear;
};

export const noop = (): void => { };

/*
 ** Object
 */

export * from './object';

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

export class Debounce {
    protected handler: (...args: any[]) => unknown;
    protected timeout: number;
    protected timeoutId!: any;

    constructor(handler: (...args: any[]) => unknown, timeout: number) {
        this.handler = handler;
        this.timeout = timeout;
    }

    push = (...args: any[]): void => {
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

export class DebounceInterval {
    protected handler: (...args: any[]) => unknown;
    protected timeout: number;
    protected timeoutId!: any;
    protected pushAwaiting: boolean = false;
    protected lastValue: any[] = [];

    constructor(handler: (...args: any[]) => unknown, timeout: number) {
        this.handler = handler;
        this.timeout = timeout;
    }

    push = (...args: any[]): void => {
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

    notify(data: T) {
        this.subscribers.forEach(sub => sub(data));
    }
}

export type TimedNotifierCallback<T> = (
    data: T,
    resolve?: (value?: unknown) => void,
    reject?: (reason?: any) => void
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
