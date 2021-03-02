import React, { useContext } from 'react';
import { NetworkConnectivity } from '@dateam/ark';

export const ConnectivityContext = React.createContext<NetworkConnectivity | null>(null);
export const ConnectivityProvider = ConnectivityContext.Provider;
export const ConnectivityConsumer = ConnectivityContext.Consumer;

const useConnectivity = () => {
    const connectivity = useContext(ConnectivityContext);
    const [isOnline, setIsOnline] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        if (connectivity instanceof NetworkConnectivity) {
            setIsOnline(prevState => {
                if (prevState == null) return connectivity.isOnline;

                return prevState;
            });

            return connectivity.subscribe(setIsOnline);
        }

        return () => { };
    }, [connectivity, setIsOnline]);

    return isOnline ?? true;
};

export default useConnectivity;