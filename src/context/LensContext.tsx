import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type LensMode = "focus" | "lab" | "strain";

interface LensContextType {
    currentLens: LensMode;
    setLens: (lens: LensMode) => void;
    isFocusMode: boolean;
    isLabMode: boolean;
}

const LensContext = createContext<LensContextType | undefined>(undefined);

export function LensProvider({ children }: { children: ReactNode }) {
    // Initialize from localStorage or default to 'focus'
    const [currentLens, setCurrentLens] = useState<LensMode>(() => {
        const saved = localStorage.getItem("life_os_lens");
        return (saved as LensMode) || "focus";
    });

    useEffect(() => {
        localStorage.setItem("life_os_lens", currentLens);
    }, [currentLens]);

    const value = {
        currentLens,
        setLens: setCurrentLens,
        isFocusMode: currentLens === "focus",
        isLabMode: currentLens === "lab",
    };

    return <LensContext.Provider value={value}>{children}</LensContext.Provider>;
}

export function useLens() {
    const context = useContext(LensContext);
    if (context === undefined) {
        throw new Error("useLens must be used within a LensProvider");
    }
    return context;
}
