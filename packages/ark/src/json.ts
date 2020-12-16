import { isArray, isDate, isFunction, isString, RegExp } from './core';
// import { safeParseIsoDate } from 'src';

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