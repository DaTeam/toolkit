import React from 'react';
import { Required, noop } from '@dateam/ark';

type InternalValueManagerOptions<S extends any> = {
    locked?: boolean;
    handler?: (value: S | undefined) => unknown;
};

/*
 ** Provide a managed state which updates if the external value passed is updated overtime
 ** interacts with a locked property to ignore incoming external changes and a handler to trigger onChange behavior
 **> externalValue which will update the state on update
 ** > [Optional] options used to configure the behavior of manager
 ** => Returns an array that can be destructured : [value, setState] (such as useState API)
 ** [Possible use case] Wanting to have an internal state whilst overriding it with parent props
 */
const useInternalValueManager = <S extends any>(
    externalValue?: S,
    options?: InternalValueManagerOptions<S>
): [S | undefined, React.Dispatch<React.SetStateAction<S | undefined>>] => {
    const [internalValue, setInternalValue] = React.useState(() => externalValue);
    const internalOptions = React.useRef<Required<InternalValueManagerOptions<S>>>({
        locked: options?.locked ?? false,
        handler: options?.handler ?? noop
    });

    React.useEffect(() => {
        internalOptions.current = {
            locked: options?.locked ?? false,
            handler: options?.handler ?? noop
        };
    }, [options, internalOptions]);

    React.useEffect(() => {
        internalOptions.current.handler?.(internalValue);
    }, [internalValue, internalOptions]);

    React.useEffect(() => {
        if (internalOptions.current.locked === false) {
            setInternalValue(internalValue => {
                if (externalValue !== internalValue) {
                    return externalValue;
                }

                return internalValue;
            });
        }
    }, [externalValue, internalOptions]);

    return [internalValue, setInternalValue];
};

export default useInternalValueManager;