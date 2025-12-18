import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    subtitle?: string; // e.g. "OCT 24 • WEDNESDAY"
    icon?: React.ElementType; // Optional icon
    className?: string;
    children?: React.ReactNode; // Extra actions
}

export function PageHeader({ title, subtitle, icon: Icon, className, children }: PageHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between mb-6 h-14 shrink-0 px-1", className)}>
            <div className="flex items-center gap-4">
                {Icon && (
                    <div className="p-2.5 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary">
                        <Icon className="h-5 w-5" />
                    </div>
                )}

                <div>
                    {subtitle && (
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">
                            {subtitle}
                        </p>
                    )}
                    <h1 className="font-mono text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-none">
                        {title}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {children}
            </div>
        </div>
    );
}
