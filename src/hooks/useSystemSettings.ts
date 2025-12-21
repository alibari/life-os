import { useState, useEffect } from 'react';

export function useSystemSettings() {
    const [strictMode, setStrictMode] = useState<boolean>(() => {
        const saved = localStorage.getItem('life_os_strict_mode');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('life_os_strict_mode', String(strictMode));
    }, [strictMode]);

    return {
        strictMode,
        setStrictMode
    };
}
