import React, { useContext } from 'react';
import { NetworkConnectivity } from '@dateam/ark';

const ConnectivityContext = React.createContext<NetworkConnectivity | null>(null);

export const ConnectivityProvider = ConnectivityContext.Provider;

const useConnectivity = () => {
    const [isOnline, setIsOnline] = React.useState(true);
    const connectivity = useContext(ConnectivityContext);

    React.useEffect(() => {
        if (connectivity instanceof NetworkConnectivity) return connectivity.subscribe(setIsOnline);

        return () => { };
    }, []);

    return isOnline;
};

export default useConnectivity;