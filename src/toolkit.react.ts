import {
    Children,
    isValidElement,
    ReactNode,
    ReactElement,
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
    cloneElement
} from 'react';
import {
    compareCollection,
    toJSON,
    isObjectLike,
    isString,
    isFunction,
    Observer,
    isUndefined,
    isArray,
    noop,
    isDefined,
    AnyFunctionReturning,
    Debounce,
    DebounceInterval
} from './toolkit';

/*
 ** Children Helpers
 */

export const matchChildren = (
    prevChildren: ReactNode | undefined,
    nextChildren: ReactNode | undefined,
    unicityFn?: (element: ReactElement) => any
) => {
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

export const childrenToReactElement = (children: ReactNode | undefined): ReactElement[] =>
    Children
        .toArray(children)
        .filter(isValidElement);

/*
 ** Hooks
 */

type StateValue<S extends any> = S | (() => S);

export const useSafeState = <S extends any>(
    initialState: StateValue<S>
): [S, React.Dispatch<React.SetStateAction<S>>] => {
    const mounted = useRef(false);
    const [state, setState] = useState(initialState);
    const setter = useCallback((value: React.SetStateAction<S>) => {
        if (!mounted.current) return;

        setState(value);
    }, [setState, mounted]);

    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
        };
    }, []);

    return [state, setter];
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
export const useAsync = (
    asyncFunction: (...args: any[]) => Promise<any>,
    dependencies = [],
    immediate: boolean = true
) => {
    const [pending, setPending] = useSafeState(false);
    const [value, setValue] = useSafeState(null);
    const [error, setError] = useSafeState(null);

    const execute = useCallback(async (...args) => {
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

    useEffect(() => {
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
export const useWhyDidYouUpdate = (name: string, props: Record<any, any>) => {
    // Get a mutable ref object where we can store props
    // for comparison next time this hook runs.
    const previousProps = useRef<any>();

    useEffect(() => {
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
 */
export const useInternalValue = <S extends any>(
    externalValue: StateValue<S> | null,
    defaultValue: StateValue<S> | null = null
): [S | null, React.Dispatch<React.SetStateAction<S | null>>] => {
    const [internalValue, setInternalValue] = useState(defaultValue);

    useEffect(() => {
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
    const internalOptions = useMemo(() => {
        const opt = { ...DEFAULT_OPTIONS };

        if (isObjectLike(options)) {
            if (isString(options!.onEnterClass)) opt.onEnterClass = options!.onEnterClass;
            if (isString(options!.onTriggerClass)) opt.onTriggerClass = options!.onTriggerClass;
        }

        return opt;
    }, [options]);

    const ref = useRef<any>(null);
    const trigger = useCallback((cb = () => { }) => {
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

    const clearAnimationClasses = useCallback(() => {
        const element = ref.current;

        if (isObjectLike(element)) {
            element.classList.remove(internalOptions.onEnterClass);
            element.classList.remove(internalOptions.onTriggerClass);
        }
    }, [internalOptions.onEnterClass, internalOptions.onTriggerClass]);

    useEffect(() => {
        if (isObjectLike(ref.current)) {
            ref.current.classList.add(internalOptions.onEnterClass);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
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
 ** Global state hook constructor
 ** > [Optional] initial value for the state
 ** => Returns the hook to manage the state
 **
 ** Manage global state
 ** > value that will update the state depending on the memoize of this value
 ** > dependencies to update the memoized value
 ** => Returns an array that can be destructured : [value, setState] (such as useState API)
 */
export const createGlobalStateHook = <S extends any>(initValue: StateValue<S>) => {
    const observer = new Observer();
    let lastKnownState = initValue;

    const applyStateChange = (newState: any) => {
        lastKnownState = newState;
        observer.notify(newState);
    };

    return (value?: S, deps: React.DependencyList[] = []): [S, React.Dispatch<React.SetStateAction<S>>] => {
        const [state, setState] = useState(lastKnownState);

        const memoizedValue = useMemo(() => value, deps); // eslint-disable-line react-hooks/exhaustive-deps

        useEffect(() => {
            // subscribe to state changes 
            const unsubscribe = observer.subscribe(setState);

            // Ensures the state is still up to date
            if (lastKnownState !== state) setState(lastKnownState);

            if (!isUndefined(memoizedValue)) applyStateChange(memoizedValue);

            return unsubscribe;
        }, [memoizedValue]); // eslint-disable-line react-hooks/exhaustive-deps

        return [state, applyStateChange];
    };
};

/*
 ** Use state async which resolves a promise once the state is updated
 ** > [Optional] initial value for the state
 ** => Returns an array that can be destructured : [value, setState] (such as useState API)
 **     - calling the setState function returns a promise that will be resolved once the state has updated
 */
export const useAsyncState = <S extends any>(
    initialState: StateValue<S>
): [S, React.Dispatch<React.SetStateAction<S>>] => {
    const [state, setState] = useState(initialState);
    const [resolver, setResolver] = useState<any>(() => noop);
    const setter = useCallback((value: React.SetStateAction<S>) => {
        setState(value);

        return new Promise(resolve => setResolver(() => resolve));
    }, [setState]);

    useEffect(() => resolver(state), [state, resolver]);

    return [state, setter];
};

/*
 ** Apply an AND operator to each condition
 ** > Each parameter is a condition to apply
 ** => Returns the result of the applied conditions
 */
export const useANDLogic = (...conditions: (boolean | AnyFunctionReturning<boolean>)[]): boolean => {
    if (!isArray(conditions)) throw new TypeError('conditions are not valid');

    return useMemo(
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

    return useMemo(
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
export const useError = (...errors: any[]) => {
    if (!isArray(errors)) throw new TypeError('errors are not valid');

    return useMemo(
        () => {
            const properErrors = errors.filter(isDefined);
            return [properErrors.length > 0, properErrors];
        },
        errors // eslint-disable-line react-hooks/exhaustive-deps
    );
};

export const useFirstEffect = (effect: React.EffectCallback, dependencies: any[] = []) => {
    const occurred = useRef(false);

    useEffect(() => {
        if (occurred.current) return;

        occurred.current = true;
        return effect();
    }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
};

export const useFirstDefined = (effect: React.EffectCallback, value: any) => {
    const occurred = useRef(false);

    useEffect(() => {
        if (occurred.current || !isDefined(value)) return;

        occurred.current = true;
        return effect();
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
};

export const useManInTheMiddle = (
    overrideCallback: (originalCallback: Function, ...args: any[]) => unknown,
    children: React.ReactNode,
    dependencies: any[],
    methodsName: string[] = ['onChange']
) => useMemo(() => childrenToReactElement(children).map(child => {
    const overridenMethods: Record<string, Function> = {};

    methodsName.forEach(method => {
        const { [method]: originMethod } = child.props;

        overridenMethods[method] = (...args: any[]) => overrideCallback(originMethod, ...args);
    });

    return cloneElement(child, { ...overridenMethods });
}), dependencies); // eslint-disable-line react-hooks/exhaustive-deps

export const useDebounce = (handler: Function, timeout: number = 0, interval: boolean = false) => {
    const debounce = useMemo(() => {
        if (interval === true) {
            return new DebounceInterval((...args) => handler(...args), timeout);
        }

        return new Debounce((...args) => {
            handler(...args);
        }, timeout);
    }, [handler, timeout, interval]); // eslint-disable-line react-hooks/exhaustive-deps

    return useCallback((...args) => {
        debounce.push(...args);
    }, [debounce]);
};

export const useDebounceValue = <T>(input: T, timeout: number = 0, interval: boolean = false) => {
    const [debouncedValue, setDebouncedValue] = useState(input);
    const debounce = useMemo(() => {
        if (interval === true) {
            return new DebounceInterval(value => setDebouncedValue(value), timeout);
        }

        return new Debounce(value => setDebouncedValue(value), timeout);
    }, [setDebouncedValue, timeout, interval]);

    useEffect(() => {
        debounce.push(input);
    }, [input]); // eslint-disable-line react-hooks/exhaustive-deps

    return debouncedValue;
};
