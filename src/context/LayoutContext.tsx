import React, { createContext, useContext, useState, useEffect } from "react";

interface LayoutContextType {
    isLayoutLocked: boolean;
    setIsLayoutLocked: (locked: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
    // Default to locked (view only) for "production" feel, or unlocked? 
    // User said "stylish toggle to enable to edit... and when disabled we cant".
    // Let's default to verified user preference or locked by default to prevent accidental drags.
    const [isLayoutLocked, setIsLayoutLocked] = useState(() => {
        const saved = localStorage.getItem("life-os-layout-locked");
        return saved ? JSON.parse(saved) : true; // Default locked
    });

    useEffect(() => {
        localStorage.setItem("life-os-layout-locked", JSON.stringify(isLayoutLocked));
    }, [isLayoutLocked]);

    return (
        <LayoutContext.Provider value={{ isLayoutLocked, setIsLayoutLocked }}>
            {children}
        </LayoutContext.Provider>
    );
}

export function useLayout() {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error("useLayout must be used within a LayoutProvider");
    }
    return context;
}
