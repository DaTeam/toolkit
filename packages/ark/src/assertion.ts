import {
    checkType,
    isArray,
    isBoolean,
    isDate,
    isDefined,
    isFloat,
    isFunction,
    isNull,
    isNumber,
    isString,
    isUndefined,
    isValidDate,
    isValidNumber
} from './core';
import { Type } from './types';

export type Assertion<T> = (value: Readonly<T>, msg?: Readonly<string>) => asserts value is T;
export class AssertionError extends Error {
    constructor(msg?: string) {
        super(msg ?? 'Assertion failed');
    }
}

export const assert: (condition: Readonly<unknown>, msg?: Readonly<string>) => asserts condition = (condition, msg) => {
    if (!condition) throw new AssertionError(msg);
};

export const assertType = (arg: Readonly<unknown>, type: Readonly<Type>, msg?: Readonly<string>): void => {
    if (!checkType(arg, type)) throw new AssertionError(msg);
};

export const assertIsDefined: <T>(value: Readonly<T>, msg?: Readonly<string>) => asserts value is NonNullable<T> = (value, msg) => {
    if (!isDefined(value)) throw new AssertionError(msg);
};

export const assertIsString: Assertion<string> = (value, msg) => {
    if (!isString(value)) throw new AssertionError(msg);
};

export const assertIsFunction: Assertion<Function> = (value, msg) => {
    if (!isFunction(value)) throw new AssertionError(msg);
};

export const assertIsArray: Assertion<Array<any>> = (value, msg) => {
    if (!isArray(value)) throw new AssertionError(msg);
};

export const assertIsBoolean: Assertion<boolean> = (value, msg) => {
    if (!isBoolean(value)) throw new AssertionError(msg);
};

export const assertIsNumber: Assertion<number> = (value, msg) => {
    if (!isNumber(value)) throw new AssertionError(msg);
};

export const assertIsValidNumber: Assertion<number> = (value, msg) => {
    if (!isValidNumber(value)) throw new AssertionError(msg);
};

export const assertIsFloat: Assertion<number> = (value, msg) => {
    if (!isFloat(value)) throw new AssertionError(msg);
};

export const assertIsDate: Assertion<Date> = (value, msg) => {
    if (!isDate(value)) throw new AssertionError(msg);
};

export const assertIsValidDate: Assertion<Date> = (value, msg) => {
    if (!isValidDate(value)) throw new AssertionError(msg);
};

export const assertIsUndefined: Assertion<undefined> = (value, msg) => {
    if (!isUndefined(value)) throw new AssertionError(msg);
};

export const assertIsNull: Assertion<null> = (value, msg) => {
    if (!isNull(value)) throw new AssertionError(msg);
};