import { Validator } from 'prop-types';
import { isFunction } from '@dateam/ark';

export const propTypeNullable = <T>(checkCallback: (propValue: any) => propValue is T): Validator<T | null> => (
    props: { [key: string]: any },
    propName: string,
    componentName: string,
    location: string,
    propFullName: string
): Error | null => {
    if (props[propName] === null) return null;

    if (!isFunction(checkCallback)) {
        return new Error(`Missing propType callback for '${propFullName}' attached to ${componentName}`);
    }

    if (!checkCallback(props[propName])) {
        return new Error(`Invalid ${location} '${propFullName}' supplied to ${componentName} doesn't match the check (${checkCallback.name})`);
    }

    return null;
};

export const propTypeAllowUndefined = <T>(checkCallback: (propValue: any) => propValue is T): Validator<T | undefined> => (
    props: { [key: string]: any },
    propName: string,
    componentName: string,
    location: string,
    propFullName: string
): Error | null => {
    if (props[propName] === undefined) return null;

    if (!isFunction(checkCallback)) {
        return new Error(`Missing propType callback for '${propFullName}' attached to ${componentName}`);
    }

    if (!checkCallback(props[propName])) {
        return new Error(`Invalid ${location} '${propFullName}' supplied to ${componentName} doesn't match the check (${checkCallback.name})`);
    }

    return null;
};