/*
 ** Object Helpers
 */

type ObjectMultipleLevelAccessor<T, Key extends keyof T & string> = `${Key}.${ObjectAccessorPath<T[Key], Exclude<keyof T[Key], keyof any[]>> & string}`;
type ObjectSingleLevelAccessor<T, Key extends keyof T & string> = `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`;
type ObjectAccessorPath<T, Key extends keyof T> =
    Key extends string ? (
        T[Key] extends Record<string, any> ? (
            | ObjectMultipleLevelAccessor<T, Key>
            | ObjectSingleLevelAccessor<T, Key>
        )
        : never
    )
    : never;
type ObjectPath<T> = ObjectAccessorPath<T, keyof T> | keyof T;
export type ObjectAccessor<T> = ObjectPath<T> extends string | keyof T ? ObjectPath<T> : keyof T;
export type ObjectAccessorValue<T, P extends ObjectAccessor<T>> =
    P extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
    ? Rest extends ObjectAccessor<T[Key]>
    ? ObjectAccessorValue<T[Key], Rest>
    : never
    : never
    : P extends keyof T
    ? T[P]
    : never;

export type ObjectValues<T> = T[keyof T];
export type AssertPropDefined<T, K extends keyof T = never> = {
    [P in keyof T]: P extends K ? NonNullable<T[P]> : T[P];
};

// Lighter version but more issues due to complexity
// type ObjectMultipleLevelAccessor<T, Key extends keyof T & string> = Key | `${Key}.${ObjectAccessorPath<T[Key], Exclude<keyof T[Key], keyof any[]>>}`;
// type ObjectSingleLevelAccessor<T, Key extends keyof T & string> = Key | `${Key}.${ObjectAccessorPath<T[Key], keyof T[Key]>}`;
// type ObjectAccessorPath<T, Key extends keyof T> =
//     Key extends string ? (
//         T[Key] extends Record<string, any> ? (
//             T[Key] extends ArrayLike<any> ?
//             ObjectMultipleLevelAccessor<T, Key>
//             : ObjectSingleLevelAccessor<T, Key>
//         )
//         : Key
//     )
//     : never;
// export type ObjectAccessor<T> = ObjectAccessorPath<T, keyof T> | keyof T;

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