import React from 'react';
import {
    compareCollection,
    toJSON,
    isObjectLike,
    isString,
    isFunction,
    isArray,
    noop,
    isDefined,
    AnyFunctionReturning,
    Debounce,
    DebounceInterval,
    objectPick,
    stringFormat,
    isValidNumber,
    take
} from '@dateam/ark';
import { StateValue } from './state';

export type CallbackAnyArg = (...args: any[]) => unknown;

/*
 ** Children Helpers
 */

export const matchChildren = (
    prevChildren: React.ReactNode | undefined,
    nextChildren: React.ReactNode | undefined,
    unicityFn?: (element: React.ReactElement) => any
): boolean => {
    const previousMarkers = prevChildren ? childrenToReactElement(prevChildren) : [];
    const nextMarkers = nextChildren ? childrenToReactElement(nextChildren) : [];
    const prevMarkersKey = previousMarkers.map(child => child.key);
    const nextMarkersKey = nextMarkers.map(child => child.key);
    let diff = compareCollection(prevMarkersKey, nextMarkersKey);

    if (diff.length > 0) return false;

    const prevMarkersProps = previousMarkers.map(unicityFn ?? (child => toJSON(child.props)));
    const nextMarkersProps = nextMarkers.map(unicityFn ?? (child => toJSON(child.props)));
    diff = compareCollection(prevMarkersProps, nextMarkersProps);

    return diff.length === 0;
};

export const childrenToReactElement = (children: React.ReactNode | undefined): React.ReactElement[] =>
    React.Children
        .toArray(children)
        .filter(React.isValidElement);

/*
 ** Hooks
 */

export const useSafeState = <S extends any>(
    initialState: StateValue<S>
): [S, React.Dispatch<React.SetStateAction<S>>] => {
    const mounted = React.useRef(false);
    const [state, setState] = React.useState(initialState);
    const setter = React.useCallback((value: React.SetStateAction<S>) => {
        if (!mounted.current) return;

        setState(value);
    }, [setState, mounted]);

    React.useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
        };
    }, []);

    return [state, setter];
};

type UseAsyncResult<T> = {
    execute: (...args: unknown[]) => Promise<T | null>;
    pending: boolean;
    value: T | null;
    error: unknown | null;
};

/*
 ** Async call which can be triggered immediately or called later
 ** > async function
 ** > dependencies to update the memoized function
 ** > [Optional] boolean to define if the call should be trigger immediately or not
 ** => Returns an object containing the following properties :
 **     - execute, to trigger the call
 **     - pending, if the call is pending
 **     - value, the result of the call, default value is null
 **     - error, the error if the call has failed, default value is null
 */
export const useAsync = <T>(
    asyncFunction: (...args: any[]) => Promise<T>,
    dependencies = [],
    immediate: boolean = true
): UseAsyncResult<T> => {
    const [pending, setPending] = useSafeState(false);
    const [value, setValue] = useSafeState<T | null>(null);
    const [error, setError] = useSafeState<unknown | null>(null);

    const execute = React.useCallback(async (...args: unknown[]) => {
        setPending(true);
        setValue(null);
        setError(null);

        let fnResponse = null;

        try {
            fnResponse = await asyncFunction(...args);
            setValue(fnResponse);
        }
        catch (err) {
            setError(err);
        }

        setPending(false);

        return fnResponse;
    }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { execute, pending, value, error };
};

/*
 ** Add logging to monitore the reason a component updated by passing the suspects
 ** > key name to distinguish which instance is logging
 ** > object containing the properties to monitor
 */
export const useWhyDidYouUpdate = (name: string, props: Record<any, any>): void => {
    // Get a mutable ref object where we can store props
    // for comparison next time this hook runs.
    const previousProps = React.useRef<any>();

    React.useEffect(() => {
        if (previousProps.current) {
            const allKeys = Object.keys({ ...previousProps.current, ...props });
            const changesObj: Record<any, any> = {};

            allKeys.forEach(key => {
                // If previous is different from current
                if (previousProps.current[key] !== props[key]) {
                    // Add to changesObj
                    changesObj[key] = {
                        from: previousProps.current[key],
                        to: props[key]
                    };
                }
            });

            if (Object.keys(changesObj).length) {
                console.log('[why-did-you-update]', name, changesObj); // eslint-disable-line no-console
            }
        }

        // Finally update previousProps with current props for next hook call
        previousProps.current = props;
    });
};

/*
 ** Provide a managed state which updates if the external value passed is updated overtime
 ** > externalValue which will update the state on update
 ** > [Optional] defaultValue for state initialization
 ** In the case the external value updated with an undefined value, state will be updated with default value
 ** => Returns an array that can be destructured : [value, setState] (such as useState API)
 ** [Possible use case] Wanting to have an internal state whilst overriding it with parent props
 ** TODO: Change behavior to have undefined instead of null as fallback value
 */
export const useInternalValue = <S extends any>(
    externalValue: StateValue<S> | null,
    defaultValue: StateValue<S> | null = null
): [S | null, React.Dispatch<React.SetStateAction<S | null>>] => {
    const [internalValue, setInternalValue] = React.useState(externalValue || defaultValue);

    React.useEffect(() => {
        if (externalValue !== internalValue) {
            setInternalValue(externalValue || defaultValue);
        }
    }, [externalValue]); // eslint-disable-line react-hooks/exhaustive-deps

    return [internalValue, setInternalValue];
};

const DEFAULT_OPTIONS = {
    onEnterClass: 'component-enter',
    onTriggerClass: 'component-exit'
};

/*
 ** Triggers the application of CSS class at specific component's lifecycle events
 ** > [Optional] options which contains the onEnterClass name and the onTriggerClass name
 ** - Once the hook mounts, it applies the onEnterClass on the ref if it is defined
 ** - Each time the trigger function is called, it applies the onTriggerClass on the ref if it is defined
 ** => Returns the ref you should provide to the element you want to apply classes to
 */
export const useAnimationClass = (options?: typeof DEFAULT_OPTIONS): any => {
    const internalOptions = React.useMemo(() => {
        const opt = { ...DEFAULT_OPTIONS };

        if (isObjectLike(options)) {
            const onEnterClass = options?.onEnterClass;
            const onTriggerClass = options?.onTriggerClass;

            if (isString(onEnterClass)) opt.onEnterClass = onEnterClass;
            if (isString(onTriggerClass)) opt.onTriggerClass = onTriggerClass;
        }

        return opt;
    }, [options]);

    const ref = React.useRef<any>(null);
    const trigger = React.useCallback((cb = () => void {}) => {
        const element = ref.current;

        if (isObjectLike(element)) {
            element.classList.add(internalOptions.onTriggerClass);

            if (isFunction(cb)) {
                const onTrigger = () => {
                    if (isObjectLike(element)) {
                        element.removeEventListener('webkitAnimationEnd', onTrigger);
                        element.removeEventListener('animationend', onTrigger);
                        element.removeEventListener('oAnimationEnd', onTrigger);
                    }
                    cb();
                };
                element.addEventListener('webkitAnimationEnd', onTrigger);
                element.addEventListener('animationend', onTrigger);
                element.addEventListener('oAnimationEnd', onTrigger);
            }
        }
    }, [ref, internalOptions.onTriggerClass]);

    const clearAnimationClasses = React.useCallback(() => {
        const element = ref.current;

        if (isObjectLike(element)) {
            element.classList.remove(internalOptions.onEnterClass);
            element.classList.remove(internalOptions.onTriggerClass);
        }
    }, [internalOptions.onEnterClass, internalOptions.onTriggerClass]);

    React.useEffect(() => {
        if (isObjectLike(ref.current)) {
            ref.current.classList.add(internalOptions.onEnterClass);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        const element = ref.current;

        if (isObjectLike(element)) {
            element.addEventListener('webkitAnimationEnd', clearAnimationClasses);
            element.addEventListener('animationend', clearAnimationClasses);
            element.addEventListener('oAnimationEnd', clearAnimationClasses);
        }

        return () => {
            if (isObjectLike(element)) {
                element.removeEventListener('webkitAnimationEnd', clearAnimationClasses);
                element.removeEventListener('animationend', clearAnimationClasses);
                element.removeEventListener('oAnimationEnd', clearAnimationClasses);
            }
        };
    }, [clearAnimationClasses]);

    return [ref, trigger];
};

/*
 ** Use state async which resolves a promise once the state is updated
 ** > [Optional] initial value for the state
 ** => Returns an array that can be destructured : [value, setState] (such as useState API)
 **     - calling the setState function returns a promise that will be resolved once the state has updated
 */
export const useAsyncState = <S extends any>(
    initialState: StateValue<S>
): [S, (value: React.SetStateAction<S>) => Promise<unknown>] => {
    const [state, setState] = React.useState(initialState);
    const [resolver, setResolver] = React.useState<any>(() => noop);
    const setter = React.useCallback((value: React.SetStateAction<S>) => {
        setState(value);

        return new Promise(resolve => setResolver(() => resolve));
    }, [setState]);

    React.useEffect(() => resolver(state), [state, resolver]);

    return [state, setter];
};

/*
 ** Apply an AND operator to each condition
 ** > Each parameter is a condition to apply
 ** => Returns the result of the applied conditions
 */
export const useANDLogic = (...conditions: (boolean | AnyFunctionReturning<boolean>)[]): boolean => {
    if (!isArray(conditions)) throw new TypeError('conditions are not valid');

    return React.useMemo(
        () => conditions.reduce<boolean>((compute, condition) => {
            if (!compute) return compute;

            if (isFunction(condition)) return condition();

            return condition;
        }, true),
        conditions // eslint-disable-line react-hooks/exhaustive-deps
    );
};

/*
 ** Apply an OR operator to each condition
 ** > Each parameter is a condition to apply.
 **     Conditions can be either a boolean or a function returning one.
 ** => Returns the result of the applied conditions
 */

export const useORLogic = (...conditions: (boolean | AnyFunctionReturning<boolean>)[]): boolean => {
    if (!isArray(conditions)) throw new TypeError('conditions are not valid');

    return React.useMemo(
        () => conditions.reduce<boolean>((compute, condition) => {
            if (compute) return compute;

            if (isFunction(condition)) return condition();

            return condition;
        }, conditions.length === 0),
        conditions // eslint-disable-line react-hooks/exhaustive-deps
    );
};

/*
 ** Computes each parameter error
 ** > Each parameter is a possible error
 ** => Returns an array that can be destructured : [hasError, errors]
 **     - hasError is a boolean set to true if any parameter is *defined* (every value but null/undefined)
 **     - errors is an array containing each error
 */
export const useError = (...errors: any[]): [boolean, any[]] => {
    if (!isArray(errors)) throw new TypeError('errors are not valid');

    return React.useMemo(
        () => {
            const properErrors = errors.filter(isDefined);
            return [properErrors.length > 0, properErrors];
        },
        errors // eslint-disable-line react-hooks/exhaustive-deps
    );
};

export const useFirstEffect = (effect: React.EffectCallback, dependencies: unknown[] = []): void => {
    const occurred = React.useRef(false);

    React.useEffect(() => {
        if (occurred.current) return;

        occurred.current = true;
        return effect();
    }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
};

export const useFirstDefined = (effect: React.EffectCallback, value: unknown): void => {
    const occurred = React.useRef(false);

    React.useEffect(() => {
        if (occurred.current || !isDefined(value)) return;

        occurred.current = true;
        return effect();
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
};

export const useManInTheMiddle = (
    overrideCallback: (originalCallback: CallbackAnyArg, ...args: any[]) => unknown,
    children: React.ReactNode,
    dependencies: any[],
    methodsName: string[] = ['onChange']
): React.ReactElement[] => React.useMemo(() => childrenToReactElement(children).map(child => {
    const overridenMethods: Record<string, CallbackAnyArg> = {};

    methodsName.forEach(method => {
        const { [method]: originMethod } = child.props;

        overridenMethods[method] = (...args: any[]) => overrideCallback(originMethod, ...args);
    });

    return React.cloneElement(child, { ...overridenMethods });
}), dependencies); // eslint-disable-line react-hooks/exhaustive-deps

export const useDebounce = <Callback extends (...args: any[]) => unknown>(
    handler: Callback,
    timeout: number = 0,
    interval: boolean = false
): (...args: Parameters<Callback>) => void => {
    const debounce = React.useMemo(() => {
        if (interval === true) {
            return new DebounceInterval((...args: any[]) => handler(...args), timeout);
        }

        return new Debounce((...args: any[]) => handler(...args), timeout);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return React.useCallback((...args: Parameters<Callback>) => void debounce.push(...args), [debounce]);
};

export const useDebounceValue = <T>(input: T, timeout: number = 0, interval: boolean = false): T => {
    const [debouncedValue, setDebouncedValue] = React.useState(input);
    const debounce = React.useMemo(() => {
        if (interval === true) {
            return new DebounceInterval(value => setDebouncedValue(value), timeout);
        }

        return new Debounce(value => setDebouncedValue(value), timeout);
    }, [setDebouncedValue, timeout, interval]);

    React.useEffect(() => {
        debounce.push(input);
    }, [input]); // eslint-disable-line react-hooks/exhaustive-deps

    return debouncedValue;
};

export const usePick = <T, K extends keyof T>(obj: Readonly<T>, keys: Readonly<K[]>): Pick<T, K> =>
    React.useMemo(() => objectPick(obj, keys), [obj]); // eslint-disable-line react-hooks/exhaustive-deps

export const useLogRenders = (key: string, interval?: number): void => {
    const counter = React.useRef(0);
    const sinceLastLogCounter = React.useRef(0);
    const logFormat = React.useMemo(() => {
        let format = `[${key}] Total Render = {0}`;

        if (isValidNumber(interval)) format += ' | Since last log = {1}';

        return format;
    }, [key, interval]);

    const onLog = React.useCallback((...args: any[]) => {
        console.log(...args); // eslint-disable-line no-console
        sinceLastLogCounter.current = 0;
    }, []);
    const log = React.useMemo(() => {
        if (isValidNumber(interval)) {
            const debounce = new DebounceInterval(onLog, interval);

            return debounce.push;
        }

        return onLog;
    }, [interval, onLog]);

    React.useEffect(() => {
        counter.current += 1;
        sinceLastLogCounter.current += 1;
        log(stringFormat(logFormat, counter.current, sinceLastLogCounter.current));
    }); // eslint-disable-line react-hooks/exhaustive-deps
};


export { default as createGlobalStateHook } from './createGlobalStateHook';
export { default as createHistoryHook } from './createHistoryHook';
export { default as concatClassName } from './concatClassName';
export { default as useConnectivity } from './useConnectivity';
export * from './useConnectivity';