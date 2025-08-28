import { useEffect, useState } from 'react';

const getOnlineStatus = () => {
    return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
        ? navigator.onLine
        : true; // Default to online if navigator is not available (e.g., during SSR)
};

const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(getOnlineStatus());

    useEffect(() => {
        const setOnline = () => setIsOnline(true);
        const setOffline = () => setIsOnline(false);

        window.addEventListener('online', setOnline);
        window.addEventListener('offline', setOffline);

        // Cleanup event listeners on component unmount
        return () => {
            window.removeEventListener('online', setOnline);
            window.removeEventListener('offline', setOffline);
        };
    }, []); // Empty dependency array ensures effect runs only once on mount

    return isOnline;
};

export default useOnlineStatus;