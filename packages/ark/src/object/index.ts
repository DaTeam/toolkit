/*
 ** Object Helpers
 */

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