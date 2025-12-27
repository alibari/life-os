import { createContext, useContext, useState, ReactNode } from "react";

interface WidgetContextType {
    setHeaderActions: (actions: ReactNode) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function useWidget() {
    const context = useContext(WidgetContext);
    if (!context) {
        throw new Error("useWidget must be used within a WidgetProvider (WidgetFrame)");
    }
    return context;
}

export function WidgetProvider({ children, onActionsChange }: { children: ReactNode, onActionsChange: (actions: ReactNode) => void }) {
    return (
        <WidgetContext.Provider value={{ setHeaderActions: onActionsChange }}>
            {children}
        </WidgetContext.Provider>
    );
}
