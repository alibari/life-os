import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const bootSequence = [
    "INITIALIZING_KERNEL...",
    "ESTABLISHING_NEURAL_LINK...",
    "SYNCING_CORTEX...",
    "LOADING_USER_PROFILE...",
    "SYSTEM_READY"
];

export function SystemBoot() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev < bootSequence.length - 1 ? prev + 1 : prev));
        }, 600); // Adjust timing as needed

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 font-mono">
            <div className="w-64 space-y-4">
                {/* Logo/Icon Pulse */}
                <div className="flex justify-center mb-8">
                    <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border border-primary/40 animate-ping opacity-20" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" />
                    </div>
                </div>

                {/* Text Sequence */}
                <div className="h-16 flex flex-col items-center justify-center">
                    <motion.p
                        key={step}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-primary text-xs tracking-widest"
                    >
                        {bootSequence[step]}
                    </motion.p>
                </div>

                {/* Boot Bar */}
                <div className="h-0.5 w-full bg-secondary/10 overflow-hidden rounded-full">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((step + 1) / bootSequence.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                <div className="flex justify-between text-[10px] text-muted-foreground/40">
                    <span>SYS.v1.0.0</span>
                    <span>SECURE</span>
                </div>
            </div>
        </div>
    );
}
