/* eslint-disable react-hooks/exhaustive-deps, react-hooks/rules-of-hooks */
/*
 ** Comment below is obsolete
 ** TODO: update the doc
 ** Global state hook constructor
 ** > [Optional] initial value for the state
 ** => Returns the hook to manage the state
 **
 ** Manage global state
 ** > value that will update the state depending on the memoize of this value
 ** > dependencies to update the memoized value
 ** => Returns an array that can be destructured : [value, setState] (such as useState API)
 */
import React from 'react';
import { Observer, isFunction } from '@dateam/ark';

type GlobalStateHook<S> = {
    hook: (value?: S | (() => S)) => [S, React.Dispatch<React.SetStateAction<S>>];
    getState: () => S;
    setState: (newState: (S | ((prevState: S) => S))) => void;
};

const createGlobalStateHook = <S>(initState: S | (() => S)): GlobalStateHook<S> => {
    const observer = new Observer<S>();
    let lastKnownState: S;

    if (isFunction(initState)) lastKnownState = initState();
    else lastKnownState = initState;

    const getStateValue = (newState: (S | ((prevState: S) => S)), lastKnownState: S): S => {
        if (isFunction(newState)) return newState(lastKnownState);
        return newState;
    };

    const applyStateChange = (newState: (S | ((prevState: S) => S))) => {
        lastKnownState = getStateValue(newState, lastKnownState);
        observer.notify(lastKnownState);
    };

    return {
        hook: value => {
            const [state, setState] = React.useState<S>(value ?? lastKnownState);

            React.useEffect(() => {
                // Apply state value if it has changed from hook init prop
                if (lastKnownState !== state) applyStateChange(state);

                // subscribes to state changes and returns unsubscribe function
                return observer.subscribe(setState);
            }, []);

            return React.useMemo(() => [state, applyStateChange], [state]);
        },
        getState: () => lastKnownState,
        setState: newState => void applyStateChange(newState)
    };
};

export default createGlobalStateHook;