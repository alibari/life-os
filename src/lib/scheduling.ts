
export const freqMap: Record<string, string[]> = {
    "Daily": ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    "3x/Wk": ['Mon', 'Wed', 'Fri'],
    "4x/Wk": ['Mon', 'Tue', 'Thu', 'Fri'],
    "1x/Wk": ['Sat'],
    "Weekend": ['Sat', 'Sun']
};

export const isScheduledForToday = (config?: any, startDate?: string): boolean => {
    if (!config || !config.type || config.type === 'daily') return true;
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[now.getDay()];
    const dayOfMonth = now.getDate();

    switch (config.type) {
        case 'daily':
            return true;
        case 'weekly':
            return (config.days || []).includes(dayName);
        case 'monthly':
            return (config.days_of_month || []).includes(dayOfMonth);
        case 'monthly_relative':
            if (!config.weekday || !config.week_num) return false;
            // 1. Check Weekday
            if (dayName !== config.weekday) return false;
            // 2. Check Week Number
            const currentWeekNum = Math.ceil(dayOfMonth / 7);
            if (config.week_num === currentWeekNum) return true;
            // 3. Handle 'Last' (-1)
            if (config.week_num === -1) {
                const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                return (dayOfMonth + 7 > lastDayOfMonth);
            }
            return false;
        case 'interval':
            if (!startDate || !config.interval_days) return true; // Fallback
            const start = new Date(startDate);
            // Calculate difference in days (ignoring time)
            const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const diffTime = Math.abs(nowMidnight.getTime() - startMidnight.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays % config.interval_days === 0;
        default:
            return true;
    }
};
