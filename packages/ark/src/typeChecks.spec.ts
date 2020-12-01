import {
    isDefined,
    isArray,
    isObject,
    isString,
    isFunction,
    isBoolean
} from './toolkit';

describe('type checks', () => {
    describe('isDefined', () => {
        it('should return false if passed undefined', () => {
            expect(isDefined(undefined)).toBe(false);
        });
        it('should return false if passed null', () => {
            expect(isDefined(null)).toBe(false);
        });
        it('should return true if passed anything else', () => {
            expect(isDefined('I am a string !')).toBe(true);
            expect(isDefined(2)).toBe(true);
            expect(isDefined({})).toBe(true);
            expect(isDefined(new Date())).toBe(true);
            expect(isDefined([])).toBe(true);
            expect(isDefined(() => { })).toBe(true);
            expect(isDefined(true)).toBe(true);
        });
    });

    describe('isObject', () => {
        it('should return true if passed an object literal', () => {
            expect(isObject({})).toBe(true);
        });
        it('should return true if passed an Object instance', () => {
            expect(isObject(new Object())).toBe(true);
        });
        it('should return false if passed anything else', () => {
            expect(isObject('I am a string !')).toBe(false);
            expect(isObject(2)).toBe(false);
            expect(isObject(new Date())).toBe(false);
            expect(isObject(null)).toBe(false);
            expect(isObject(undefined)).toBe(false);
            expect(isObject([])).toBe(false);
            expect(isObject(() => { })).toBe(false);
            expect(isObject(true)).toBe(false);
        });
    });

    describe('isString', () => {
        it('should return true if passed a string', () => {
            expect(isString('I am a string !')).toBe(true);
        });
        it('should return false if passed anything else', () => {
            expect(isString({})).toBe(false);
            expect(isString(2)).toBe(false);
            expect(isString(new Date())).toBe(false);
            expect(isString(null)).toBe(false);
            expect(isString(undefined)).toBe(false);
            expect(isString([])).toBe(false);
            expect(isString(() => { })).toBe(false);
            expect(isString(true)).toBe(false);
        });
    });

    describe('isFunction', () => {
        it('should return true if passed a function', () => {
            expect(isFunction(function () { })).toBe(true);
        });
        it('should return true if passed an arrow function', () => {
            expect(isFunction(() => { })).toBe(true);
        });
        it('should return true if passed an async function', () => {
            expect(isFunction(async () => { })).toBe(true);
        });
        it('should return false if passed anything else', () => {
            expect(isFunction('I am a string !')).toBe(false);
            expect(isFunction(2)).toBe(false);
            expect(isFunction({})).toBe(false);
            expect(isFunction(new Date())).toBe(false);
            expect(isFunction(null)).toBe(false);
            expect(isFunction(undefined)).toBe(false);
            expect(isFunction([])).toBe(false);
            expect(isFunction(true)).toBe(false);
        });
    });

    describe('isArray', () => {
        it('should return true if passed an empty array', () => {
            expect(isArray([])).toBe(true);
        });
        it('should return true if passed a filled array', () => {
            expect(isArray([1, 2, 3, 4])).toBe(true);
        });
        it('should return true if passed an instance of array', () => {
            expect(isArray(new Array(5))).toBe(true);
        });
        it('should return false if passed anything else', () => {
            expect(isArray('I am a string !')).toBe(false);
            expect(isArray(2)).toBe(false);
            expect(isArray({})).toBe(false);
            expect(isArray(new Date())).toBe(false);
            expect(isArray(null)).toBe(false);
            expect(isArray(undefined)).toBe(false);
            expect(isArray(() => { })).toBe(false);
            expect(isArray(true)).toBe(false);
        });
    });

    describe('isBoolean', () => {
        it('should return true if passed true', () => {
            expect(isBoolean(true)).toBe(true);
        });
        it('should return true if passed false', () => {
            expect(isBoolean(false)).toBe(true);
        });
        it('should return true if passed an instance of Boolean', () => {
            expect(isBoolean(new Boolean())).toBe(true);
        });
        it('should return false if passed anything else', () => {
            expect(isBoolean('I am a string !')).toBe(false);
            expect(isBoolean(2)).toBe(false);
            expect(isBoolean({})).toBe(false);
            expect(isBoolean(new Date())).toBe(false);
            expect(isBoolean(null)).toBe(false);
            expect(isBoolean(undefined)).toBe(false);
            expect(isBoolean(() => { })).toBe(false);
            expect(isBoolean([])).toBe(false);
        });
    });
});
