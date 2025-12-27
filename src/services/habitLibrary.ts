import type { Habit, Protocol } from "@/types/habits";

// 🧪 V10 COMPREHENSIVE LIBRARY (20 Action-Based Protocols)
// Mapped to 6 Vectors: Cognitive, Metabolic, Thermal, Musculoskeletal, Circadian, Social

export const HABIT_Biblio: Partial<Habit>[] = [
    // --- FOUNDATION (CIRCADIAN) ---
    { name: "☀️ Morning Sunlight (20m)", vector: "Circadian", primary_driver: "Cortisol", secondary_driver: "Serotonin", state: -1, friction: 3, duration: 20, time_of_day: "morning" },
    { name: "🌄 Sunset Viewing (10m)", vector: "Circadian", primary_driver: "Melatonin", secondary_driver: "Serotonin", state: 2, friction: 2, duration: 10, time_of_day: "evening" },
    { name: "☕ Delay Caffeine (90m)", vector: "Circadian", primary_driver: "Adenosine", secondary_driver: "Cortisol", state: 1, friction: 5, duration: 90, time_of_day: "morning" },
    { name: "🥶 Cold Plunge / Shower (3m)", vector: "Thermal", primary_driver: "Norepinephrine", secondary_driver: "Dopamine", state: -5, friction: 9, duration: 3, time_of_day: "morning" },
    { name: "🧘 Horse Stance (2m)", vector: "Musculoskeletal", primary_driver: "Adrenaline", secondary_driver: "Endorphin", state: -3, friction: 6, duration: 2, time_of_day: "morning" },
    { name: "🚿 Ending Shower Cold (30s)", vector: "Thermal", primary_driver: "Norepinephrine", secondary_driver: "Adrenaline", state: -4, friction: 4, duration: 1, time_of_day: "morning" },
    { name: "💧 Hydrate + Electrolytes", vector: "Metabolic", primary_driver: "Acetylcholine", secondary_driver: "Adrenaline", state: 1, friction: 1, duration: 1, time_of_day: "morning" },
    { name: "🚶 Fast Paced Walk (10m)", vector: "Musculoskeletal", primary_driver: "Endorphin", secondary_driver: "Serotonin", state: -2, friction: 3, duration: 10, time_of_day: "morning" },
    { name: "💡 Bright Light Therapy", vector: "Circadian", primary_driver: "Cortisol", secondary_driver: "Dopamine", state: -2, friction: 2, duration: 20, time_of_day: "morning" },

    // --- COGNITIVE (MIND) ---
    { name: "🚀 Ultradian Work Sprint (90m)", vector: "Cognitive", primary_driver: "Acetylcholine", secondary_driver: "Dopamine", state: -4, friction: 7, duration: 90, time_of_day: "morning" },
    { name: "📱 Phone in Drawer", vector: "Cognitive", primary_driver: "Dopamine", secondary_driver: "Serotonin", state: 2, friction: 4, duration: 1, time_of_day: "all_day" },
    { name: "🎧 40Hz Binaural Audio", vector: "Cognitive", primary_driver: "Dopamine", secondary_driver: "Acetylcholine", state: -3, friction: 2, duration: 60, time_of_day: "all_day" },
    { name: "🧠 High-Intensity Practice", vector: "Cognitive", primary_driver: "Acetylcholine", secondary_driver: "Norepinephrine", state: -4, friction: 8, duration: 20, time_of_day: "afternoon" },
    { name: "🎲 Random Error Generation", vector: "Cognitive", primary_driver: "Adrenaline", secondary_driver: "Acetylcholine", state: -3, friction: 6, duration: 10, time_of_day: "afternoon" },
    { name: "😴 NSDR Post-Learning (20m)", vector: "Cognitive", primary_driver: "GABA", secondary_driver: "Acetylcholine", state: 5, friction: 2, duration: 20, time_of_day: "afternoon" },
    { name: "⚠️ Risk Engagement (Cold/Fast)", vector: "Cognitive", primary_driver: "Adrenaline", secondary_driver: "Dopamine", state: -5, friction: 8, duration: 15, time_of_day: "morning" },
    { name: "🎵 Alpha Wave Audio", vector: "Cognitive", primary_driver: "Serotonin", secondary_driver: "Acetylcholine", state: 3, friction: 1, duration: 30, time_of_day: "all_day" },
    { name: "👀 Lateral Eye Movements", vector: "Cognitive", primary_driver: "Amygdala Suppression", secondary_driver: "Acetylcholine", state: -3, friction: 2, duration: 5, time_of_day: "evening" },
    { name: "📝 Daily Outcome Mapping", vector: "Cognitive", primary_driver: "Dopamine", secondary_driver: "Serotonin", state: 2, friction: 3, duration: 10, time_of_day: "morning" },
    { name: "🐸 Eat the Frog", vector: "Cognitive", primary_driver: "Dopamine", secondary_driver: "Adrenaline", state: 4, friction: 8, duration: 45, time_of_day: "morning" },
    { name: "💰 Review Financials", vector: "Cognitive", primary_driver: "Dopamine", secondary_driver: "Cortisol", state: 2, friction: 5, duration: 15, time_of_day: "morning" },

    // --- METABOLIC (BODY) ---
    { name: "🥗 Veggie Starter", vector: "Metabolic", primary_driver: "Insulin", secondary_driver: "GABA", state: 0, friction: 3, duration: 10, time_of_day: "all_day" },
    { name: "🚶 Post-Meal Walk (10m)", vector: "Metabolic", primary_driver: "Insulin", secondary_driver: "Endorphin", state: 2, friction: 3, duration: 10, time_of_day: "all_day" },
    { name: "🍳 Savory Breakfast (No Sugar)", vector: "Metabolic", primary_driver: "Insulin", secondary_driver: "Dopamine", state: 1, friction: 4, duration: 20, time_of_day: "morning" },
    { name: "🔒 Fasting (16:8)", vector: "Metabolic", primary_driver: "Growth Hormone", secondary_driver: "Adrenaline", state: 2, friction: 6, duration: 0, time_of_day: "morning" },
    { name: "🏃‍♂️ Zone 2 Cardio (45m)", vector: "Metabolic", primary_driver: "Endocannabinoid", secondary_driver: "Endorphin", state: 3, friction: 6, duration: 45, time_of_day: "morning" },
    { name: "🚶 Empty Stomach Walk", vector: "Metabolic", primary_driver: "Norepinephrine", secondary_driver: "Endorphin", state: 2, friction: 4, duration: 20, time_of_day: "morning" },
    { name: "🏋️‍♂️ Heavy Compound Lifts", vector: "Musculoskeletal", primary_driver: "Testosterone", secondary_driver: "Endorphin", state: -5, friction: 10, duration: 45, time_of_day: "afternoon" },
    { name: "🚜 Farmers Carry", vector: "Musculoskeletal", primary_driver: "Testosterone", secondary_driver: "Dopamine", state: -4, friction: 9, duration: 5, time_of_day: "all_day" },
    { name: "🐒 Dead Hangs (Grip)", vector: "Musculoskeletal", primary_driver: "Testosterone", secondary_driver: "Endorphin", state: -3, friction: 6, duration: 2, time_of_day: "all_day" },
    { name: "🔥 Norwegian 4x4 Intervals", vector: "Metabolic", primary_driver: "Endorphin", secondary_driver: "Adrenaline", state: -5, friction: 10, duration: 20, time_of_day: "morning" },
    { name: "👃 Nasal Breathing Only Run", vector: "Metabolic", primary_driver: "Nitric Oxide", secondary_driver: "Endorphin", state: -3, friction: 7, duration: 30, time_of_day: "morning" },
    { name: "🫁 Recovery Breath Holds", vector: "Metabolic", primary_driver: "CO2 Tolerance", secondary_driver: "GABA", state: 4, friction: 5, duration: 5, time_of_day: "all_day" },

    // --- RECOVERY (SLEEP) ---
    { name: "🕯️ Red Light Environment", vector: "Circadian", primary_driver: "Melatonin", secondary_driver: "GABA", state: 4, friction: 2, duration: 60, time_of_day: "evening" },
    { name: "❄️ Cool Room (65°F)", vector: "Thermal", primary_driver: "Melatonin", secondary_driver: "Adenosine", state: 3, friction: 1, duration: 480, time_of_day: "evening" },
    { name: "🤐 Tape Mouth (Sleep)", vector: "Metabolic", primary_driver: "Nitric Oxide", secondary_driver: "CO2 Tolerance", state: 2, friction: 2, duration: 480, time_of_day: "evening" },
    { name: "😮‍💨 Physiological Sighs (5m)", vector: "Circadian", primary_driver: "Acetylcholine", secondary_driver: "GABA", state: 5, friction: 2, duration: 5, time_of_day: "all_day" },
    { name: "🥶 Cold Face Splash", vector: "Thermal", primary_driver: "Acetylcholine", secondary_driver: "Norepinephrine", state: -3, friction: 3, duration: 1, time_of_day: "all_day" },
    { name: "🕉️ Humming / Chanting", vector: "Cognitive", primary_driver: "Vagus Tone", secondary_driver: "Oxytocin", state: 4, friction: 2, duration: 5, time_of_day: "evening" },
    { name: "🧖‍♂️ Sauna / Heat Exposure", vector: "Thermal", primary_driver: "Dynorphin", secondary_driver: "Growth Hormone", state: 4, friction: 5, duration: 20, time_of_day: "evening" },
    { name: "🪵 Foam Rolling / Mobility", vector: "Musculoskeletal", primary_driver: "Endorphin", secondary_driver: "GABA", state: 3, friction: 4, duration: 15, time_of_day: "evening" },
    { name: "🌲 Nature Walk (No Pods)", vector: "Cognitive", primary_driver: "Serotonin", secondary_driver: "Endorphin", state: 4, friction: 3, duration: 30, time_of_day: "afternoon" },
    { name: "📵 Phone Off 1hr Before Bed", vector: "Circadian", primary_driver: "Dopamine", secondary_driver: "Melatonin", state: 3, friction: 6, duration: 60, time_of_day: "evening" },
    { name: "📖 Fiction Reading (Paper)", vector: "Cognitive", primary_driver: "Serotonin", secondary_driver: "Dopamine", state: 4, friction: 2, duration: 30, time_of_day: "evening" },

    // --- SPIRIT (SOUL) ---
    { name: "🚫 No Scrolling (24h)", vector: "Cognitive", primary_driver: "Dopamine", secondary_driver: "Serotonin", state: 0, friction: 8, duration: 0, time_of_day: "all_day" },
    { name: "🍬 No Processed Sugar", vector: "Metabolic", primary_driver: "Dopamine", secondary_driver: "Insulin", state: 0, friction: 7, duration: 0, time_of_day: "all_day" },
    { name: "😐 Boredom (Sit with wall)", vector: "Cognitive", primary_driver: "Dopamine", secondary_driver: "Acetylcholine", state: -2, friction: 9, duration: 20, time_of_day: "all_day" },
    { name: "🤐 Solitude (No Speaking)", vector: "Social", primary_driver: "Serotonin", secondary_driver: "GABA", state: 0, friction: 8, duration: 60, time_of_day: "all_day" },
    { name: "🤕 Voluntary Discomfort", vector: "Thermal", primary_driver: "Dopamine", secondary_driver: "Adrenaline", state: 4, friction: 8, duration: 5, time_of_day: "morning" },
    { name: "💀 Negative Visualization", vector: "Cognitive", primary_driver: "Serotonin", secondary_driver: "Dopamine", state: -1, friction: 4, duration: 5, time_of_day: "morning" },
    { name: "🛌 Make Bed (Military)", vector: "Cognitive", primary_driver: "Dopamine", secondary_driver: "Serotonin", state: 1, friction: 2, duration: 2, time_of_day: "morning" },
    { name: "👁️ Eye Contact (3m)", vector: "Social", primary_driver: "Oxytocin", secondary_driver: "Serotonin", state: -2, friction: 6, duration: 3, time_of_day: "all_day" },
    { name: "👂 Active Listening", vector: "Social", primary_driver: "Oxytocin", secondary_driver: "Dopamine", state: -2, friction: 3, duration: 15, time_of_day: "all_day" },
    { name: "🧘‍♀️ Zazen Meditation", vector: "Cognitive", primary_driver: "GABA", secondary_driver: "Serotonin", state: -4, friction: 5, duration: 20, time_of_day: "morning" },
    { name: "🍵 Tea Ceremony", vector: "Cognitive", primary_driver: "Serotonin", secondary_driver: "Acetylcholine", state: -2, friction: 3, duration: 15, time_of_day: "morning" },
    { name: "🙏 Gratitude (3 things)", vector: "Social", primary_driver: "Serotonin", secondary_driver: "Oxytocin", state: -2, friction: 2, duration: 2, time_of_day: "evening" }
];

export const PROTOCOL_BUNDLES = [
    // 1. FOUNDATION
    { id: "solar_anchoring", name: "Solar Anchoring", description: "Master clock regulation.", habits: ["☀️ Morning Sunlight (20m)", "🌄 Sunset Viewing (10m)", "☕ Delay Caffeine (90m)"] },
    { id: "thermal_shock", name: "Thermal Shock", description: "Adrenaline & Metabolism", habits: ["🥶 Cold Plunge / Shower (3m)", "🧘 Horse Stance (2m)", "🚿 Ending Shower Cold (30s)"] },
    { id: "un_groggy", name: "The Un-Groggy", description: "Clear sleep inertia.", habits: ["💧 Hydrate + Electrolytes", "🚶 Fast Paced Walk (10m)", "💡 Bright Light Therapy"] },

    // 2. MIND
    { id: "deep_work", name: "Deep Work Cycle", description: "90m Output Sprint.", habits: ["🚀 Ultradian Work Sprint (90m)", "📱 Phone in Drawer", "🎧 40Hz Binaural Audio"] },
    { id: "super_learning", name: "Super-Learning", description: "Rapid skill acquisition.", habits: ["🧠 High-Intensity Practice", "🎲 Random Error Generation", "😴 NSDR Post-Learning (20m)"] },
    { id: "flow_state", name: "Flow State", description: "Transient Hypofrontality.", habits: ["⚠️ Risk Engagement (Cold/Fast)", "🎵 Alpha Wave Audio", "👀 Lateral Eye Movements"] },
    { id: "executive_morning", name: "Executive Morning", description: "Strategic Clarity.", habits: ["📝 Daily Outcome Mapping", "🐸 Eat the Frog", "💰 Review Financials"] },

    // 3. BODY (METABOLIC)
    { id: "glucose_guardian", name: "Glucose Guardian", description: "Flatten glucose spikes.", habits: ["🥗 Veggie Starter", "🚶 Post-Meal Walk (10m)", "🍳 Savory Breakfast (No Sugar)"] },
    { id: "metabolic_fire", name: "Metabolic Fire", description: "Max oxidation.", habits: ["🔒 Fasting (16:8)", "🏃‍♂️ Zone 2 Cardio (45m)", "🚶 Empty Stomach Walk"] },
    { id: "spartan_strength", name: "Spartan Strength", description: "CNS & Testosterone.", scheduling_config: { type: 'weekly', days: ['Mon', 'Wed', 'Fri'] }, habits: ["🏋️‍♂️ Heavy Compound Lifts", "🚜 Farmers Carry", "🐒 Dead Hangs (Grip)"] },
    { id: "vo2_max", name: "VO2 Max Engine", description: "Cardiac Efficiency.", scheduling_config: { type: 'weekly', days: ['Wed'] }, habits: ["🔥 Norwegian 4x4 Intervals", "👃 Nasal Breathing Only Run", "🫁 Recovery Breath Holds"] },

    // 4. RECOVERY
    { id: "sleep_sanctuary", name: "Sleep Sanctuary", description: "Protect Melatonin.", habits: ["🕯️ Red Light Environment", "❄️ Cool Room (65°F)", "🤐 Tape Mouth (Sleep)"] },
    { id: "vagus_reset", name: "Vagus Nerve Reset", description: "Manual Anxiety Override.", habits: ["😮‍💨 Physiological Sighs (5m)", "🥶 Cold Face Splash", "🕉️ Humming / Chanting"] },
    { id: "active_recovery", name: "Active Recovery", description: "Rest Day Protocol.", scheduling_config: { type: 'weekly', days: ['Sun'] }, habits: ["🧖‍♂️ Sauna / Heat Exposure", "🪵 Foam Rolling / Mobility", "🌲 Nature Walk (No Pods)"] },
    { id: "digital_sunset", name: "Digital Sunset", description: "Disconnect Input.", habits: ["📵 Phone Off 1hr Before Bed", "📖 Fiction Reading (Paper)"] },

    // 5. SPIRIT (DOPAMINE)
    { id: "dopamine_detox", name: "Dopamine Detox", description: "Resensitize Receptors.", scheduling_config: { type: 'monthly', days_of_month: [1] }, habits: ["🚫 No Scrolling (24h)", "🍬 No Processed Sugar", "😐 Boredom (Sit with wall)"] },
    { id: "monk_mode", name: "Monk Mode", description: "Isolation for Purpose.", scheduling_config: { type: 'weekly', days: ['Sun'] }, habits: ["🤐 Solitude (No Speaking)", "🔒 Fasting (16:8)", "📝 Daily Outcome Mapping"] },
    { id: "stoic_morning", name: "Stoic Morning", description: "Resilience Building.", habits: ["🤕 Voluntary Discomfort", "💀 Negative Visualization", "🛌 Make Bed (Military)"] },

    // 6. CONNECTION
    { id: "oxytocin_flood", name: "Oxytocin Flooding", description: "Deep Connection.", habits: ["👁️ Eye Contact (3m)", "👂 Active Listening"] },
    { id: "zen_master", name: "Zen Master", description: "Presence.", habits: ["🧘‍♀️ Zazen Meditation", "🍵 Tea Ceremony", "🙏 Gratitude (3 things)"] }
];
