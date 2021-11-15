import React from 'react';

const useStateRef = <T>(initialValue: T | null) => {
    const [value, setValue] = React.useState<T | null>(initialValue);

    return React.useMemo(() => ({
        set current(value: T | null) {
            setValue(value);
        },
        get current(): T | null {
            return value;
        }
    }), [value]);
};

export default useStateRef;