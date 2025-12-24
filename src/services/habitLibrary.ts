import type { Habit } from "@/types/habits";

export const HABIT_Biblio: Partial<Habit>[] = [
    // --- MORNING / CORTISOL REDUCTION & DOPAMINE DRIVE ---
    {
        name: "☀️ Morning Sunlight (10m)",
        category: "Body",
        time_of_day: "morning",
        type: "positive",
        impact_score: 10,
        energy_cost: 2,
        duration_minutes: 10,
        reward_pathway: "cortisol_reduction" // Resets circadian rhythm
    },
    {
        name: "💧 Hydration (500ml)",
        category: "Body",
        time_of_day: "morning",
        type: "positive",
        impact_score: 5,
        energy_cost: 1,
        duration_minutes: 1,
        reward_pathway: "endorphin_relief" // Rehydration feel
    },
    {
        name: "🧘‍♂️ Mindfulness (15m)",
        category: "Mind",
        time_of_day: "morning",
        type: "positive",
        impact_score: 8,
        energy_cost: 4,
        duration_minutes: 15,
        reward_pathway: "serotonin_satisfaction"
    },
    {
        name: "🥶 Cold Shower",
        category: "Body",
        time_of_day: "morning",
        type: "positive",
        impact_score: 9,
        energy_cost: 8, // High friction
        duration_minutes: 3,
        reward_pathway: "dopamine_drive" // Spike
    },
    {
        name: "📝 Daily Planning",
        category: "Focus",
        time_of_day: "morning",
        type: "positive",
        impact_score: 7,
        energy_cost: 3,
        duration_minutes: 10,
        reward_pathway: "dopamine_drive"
    },
    {
        name: "☕ No Coffee First 90m",
        category: "Body",
        time_of_day: "morning",
        type: "positive",
        impact_score: 6,
        energy_cost: 5, // Discipline cost
        duration_minutes: 90,
        reward_pathway: "cortisol_reduction" // Adenosine clearance
    },
    {
        name: "🤸‍♂️ Stretching / Mobility",
        category: "Body",
        time_of_day: "morning",
        type: "positive",
        impact_score: 4,
        energy_cost: 3,
        duration_minutes: 10,
        reward_pathway: "endorphin_relief"
    },

    // --- DEEP WORK / DOPAMINE ---
    {
        name: "🚀 Deep Work Block (90m)",
        category: "Focus",
        time_of_day: "morning",
        type: "positive",
        impact_score: 10,
        energy_cost: 7,
        duration_minutes: 90,
        reward_pathway: "dopamine_drive"
    },
    {
        name: "📱 Phone in Other Room",
        category: "Focus",
        time_of_day: "all_day",
        type: "positive",
        impact_score: 8,
        energy_cost: 4,
        duration_minutes: 1,
        reward_pathway: "dopamine_drive" // Focus preservation
    },
    {
        name: "🔇 Noise Cancelling ON",
        category: "Focus",
        time_of_day: "all_day",
        type: "positive",
        impact_score: 3,
        energy_cost: 1,
        duration_minutes: 1,
        reward_pathway: "dopamine_drive"
    },
    {
        name: "🐸 Eat the Frog (Hardest Task First)",
        category: "Focus",
        time_of_day: "morning",
        type: "positive",
        impact_score: 9,
        energy_cost: 8,
        duration_minutes: 60,
        reward_pathway: "dopamine_drive"
    },

    // --- AFTERNOON / MAINTENANCE ---
    {
        name: "🥗 High Protein Lunch",
        category: "Body",
        time_of_day: "afternoon",
        type: "positive",
        impact_score: 6,
        energy_cost: 3,
        duration_minutes: 30,
        reward_pathway: "serotonin_satisfaction" // Satiety
    },
    {
        name: "🚶‍♂️ Post-Meal Walk (10m)",
        category: "Body",
        time_of_day: "afternoon",
        type: "positive",
        impact_score: 7,
        energy_cost: 2,
        duration_minutes: 10,
        reward_pathway: "cortisol_reduction" // Glucose control
    },
    {
        name: "😴 NSDR / Power Nap (20m)",
        category: "Body",
        time_of_day: "afternoon",
        type: "positive",
        impact_score: 8,
        energy_cost: 2,
        duration_minutes: 20,
        reward_pathway: "cortisol_reduction" // Reset
    },

    // --- EVENING / SEROTONIN & OXYTOCIN ---
    {
        name: "📵 No Screens After 8PM",
        category: "Sleep",
        time_of_day: "evening",
        type: "positive",
        impact_score: 9,
        energy_cost: 6, // Hard to do
        duration_minutes: 120,
        reward_pathway: "cortisol_reduction"
    },
    {
        name: "📖 Reading (Fiction)",
        category: "Mind",
        time_of_day: "evening",
        type: "positive",
        impact_score: 6,
        energy_cost: 3,
        duration_minutes: 30,
        reward_pathway: "serotonin_satisfaction"
    },
    {
        name: "🕯️ Dim Lights (Sunset)",
        category: "Environment",
        time_of_day: "evening",
        type: "positive",
        impact_score: 5,
        energy_cost: 1,
        duration_minutes: 1,
        reward_pathway: "cortisol_reduction"
    },
    {
        name: "🙏 Gratitude Journal",
        category: "Spirit",
        time_of_day: "evening",
        type: "positive",
        impact_score: 7,
        energy_cost: 2,
        duration_minutes: 5,
        reward_pathway: "serotonin_satisfaction"
    },
    {
        name: "🍵 Herbal Tea",
        category: "Body",
        time_of_day: "evening",
        type: "positive",
        impact_score: 3,
        energy_cost: 1,
        duration_minutes: 10,
        reward_pathway: "cortisol_reduction"
    },
    {
        name: "👪 Quality Family Time",
        category: "Spirit",
        time_of_day: "evening",
        type: "positive",
        impact_score: 10,
        energy_cost: 3,
        duration_minutes: 60,
        reward_pathway: "oxytocin_connection"
    },

    // --- PHYSICAL / ENDORPHIN ---
    {
        name: "🏋️‍♂️ Heavy Lifting",
        category: "Body",
        time_of_day: "afternoon",
        type: "positive",
        impact_score: 9,
        energy_cost: 8,
        duration_minutes: 60,
        reward_pathway: "endorphin_relief"
    },
    {
        name: "🏃‍♂️ Zone 2 Cardio",
        category: "Body",
        time_of_day: "morning",
        type: "positive",
        impact_score: 8,
        energy_cost: 6,
        duration_minutes: 45,
        reward_pathway: "endorphin_relief"
    },
    {
        name: "🔥 Sauna",
        category: "Body",
        time_of_day: "evening",
        type: "positive",
        impact_score: 7,
        energy_cost: 5,
        duration_minutes: 20,
        reward_pathway: "endorphin_relief"
    },

    // --- SYSTEM MAINTENACE ---
    {
        name: "🧹 Tidy Workspace",
        category: "Environment",
        time_of_day: "evening",
        type: "positive",
        impact_score: 4,
        energy_cost: 3,
        duration_minutes: 10,
        reward_pathway: "dopamine_drive" // Prep for tomorrow
    },
    {
        name: "💰 Review Finances",
        category: "Business",
        time_of_day: "all_day",
        type: "positive",
        impact_score: 6,
        energy_cost: 5,
        duration_minutes: 15,
        reward_pathway: "dopamine_drive"
    },

    // --- NEGATIVE / "ANTI-HABITS" ---
    {
        name: "🍩 Sugar Binge",
        category: "Body",
        time_of_day: "all_day",
        type: "negative",
        impact_score: 8,
        energy_cost: 1, // Easy
        duration_minutes: 1,
        reward_pathway: "dopamine_drive" // Cheap dopamine
    },
    {
        name: "🍺 Alcohol",
        category: "Body",
        time_of_day: "evening",
        type: "negative",
        impact_score: 9,
        energy_cost: 1,
        duration_minutes: 1,
        reward_pathway: "serotonin_satisfaction" // False satisfaction
    },
    {
        name: "📱 Doomscrolling",
        category: "Mind",
        time_of_day: "all_day",
        type: "negative",
        impact_score: 10,
        energy_cost: 1, // Minimum friction // Zero friction trap
        duration_minutes: 60,
        reward_pathway: "dopamine_drive" // Trap
    },
    {
        name: "😡 Complaining",
        category: "Mind",
        time_of_day: "all_day",
        type: "negative",
        impact_score: 5,
        energy_cost: 1,
        duration_minutes: 1,
        reward_pathway: "dopamine_drive" // Venting
    },
    {
        name: "🍿 Binge Watching",
        category: "Mind",
        time_of_day: "evening",
        type: "negative",
        impact_score: 7,
        energy_cost: 1, // Minimum friction
        duration_minutes: 120,
        reward_pathway: "dopamine_drive"
    },
    // --- SOCIAL & CONNECTION ---
    {
        name: "📞 Call Parents",
        category: "Spirit",
        time_of_day: "evening",
        type: "positive",
        impact_score: 7,
        energy_cost: 4,
        duration_minutes: 20,
        reward_pathway: "oxytocin_connection"
    },
    {
        name: "🤝 Networking",
        category: "Business",
        time_of_day: "afternoon",
        type: "positive",
        impact_score: 6,
        energy_cost: 6,
        duration_minutes: 30,
        reward_pathway: "dopamine_drive"
    },
    {
        name: "🎁 Random Act of Kindness",
        category: "Spirit",
        time_of_day: "all_day",
        type: "positive",
        impact_score: 8,
        energy_cost: 3,
        duration_minutes: 5,
        reward_pathway: "serotonin_satisfaction"
    },

    // --- LEARNING & GROWTH ---
    {
        name: "🎸 Practice Instrument",
        category: "Mind",
        time_of_day: "evening",
        type: "positive",
        impact_score: 7,
        energy_cost: 6,
        duration_minutes: 30,
        reward_pathway: "dopamine_drive" // Skill acquisition
    },
    {
        name: "🗣️ Language Learning",
        category: "Mind",
        time_of_day: "morning",
        type: "positive",
        impact_score: 6,
        energy_cost: 5,
        duration_minutes: 15,
        reward_pathway: "dopamine_drive"
    },
    {
        name: "🧩 Chess / Logic Puzzle",
        category: "Mind",
        time_of_day: "all_day",
        type: "positive",
        impact_score: 4,
        energy_cost: 4,
        duration_minutes: 15,
        reward_pathway: "dopamine_drive"
    },

    // --- ADVANCED BIO-HACKS ---
    {
        name: "🌬️ Wim Hof Breathing",
        category: "Body",
        time_of_day: "morning",
        type: "positive",
        impact_score: 8,
        energy_cost: 4,
        duration_minutes: 15,
        reward_pathway: "endorphin_relief" // Adrenaline/Endorphin release
    },
    {
        name: "🔦 Red Light Therapy",
        category: "Body",
        time_of_day: "evening",
        type: "positive",
        impact_score: 5,
        energy_cost: 2,
        duration_minutes: 15,
        reward_pathway: "cortisol_reduction"
    },
    {
        name: "🔒 Fasting (16:8)",
        category: "Body",
        time_of_day: "morning",
        type: "positive",
        impact_score: 8,
        energy_cost: 7, // Hunger friction
        duration_minutes: 1,
        reward_pathway: "cortisol_reduction" // Autophagy
    },
    {
        name: "💊 Supplements",
        category: "Body",
        time_of_day: "morning",
        type: "positive",
        impact_score: 4,
        energy_cost: 1,
        duration_minutes: 2,
        reward_pathway: "dopamine_drive"
    },
    {
        name: "👣 Grounding / Earthing",
        category: "Body",
        time_of_day: "morning",
        type: "positive",
        impact_score: 5,
        energy_cost: 2,
        duration_minutes: 10,
        reward_pathway: "cortisol_reduction"
    },
    {
        name: "🤐 Mouth Taping (Sleep)",
        category: "Sleep",
        time_of_day: "evening",
        type: "positive",
        impact_score: 7,
        energy_cost: 1,
        duration_minutes: 1,
        reward_pathway: "cortisol_reduction"
    },
    {
        name: "🕶️ Blue Light Blockers",
        category: "Sleep",
        time_of_day: "evening",
        type: "positive",
        impact_score: 6,
        energy_cost: 1,
        duration_minutes: 1,
        reward_pathway: "cortisol_reduction"
    },
    {
        name: "🛑 No Complaining Challenge",
        category: "Mind",
        time_of_day: "all_day",
        type: "positive",
        impact_score: 7,
        energy_cost: 5,
        duration_minutes: 1,
        reward_pathway: "serotonin_satisfaction"
    },
    {
        name: "👀 20-20-20 Rule",
        category: "Body",
        time_of_day: "all_day",
        type: "positive",
        impact_score: 3,
        energy_cost: 2,
        duration_minutes: 1,
        reward_pathway: "cortisol_reduction"
    },
    {
        name: "🚶‍♂️ 10k Steps",
        category: "Body",
        time_of_day: "all_day",
        type: "positive",
        impact_score: 7,
        energy_cost: 5,
        duration_minutes: 60,
        reward_pathway: "endorphin_relief"
    },
    {
        name: "🎮 Video Games (Moderated)",
        category: "Mind",
        time_of_day: "evening",
        type: "positive",
        impact_score: 3,
        energy_cost: 1, // Minimum friction // Negative cost, it's fun
        duration_minutes: 60,
        reward_pathway: "dopamine_drive"
    },
    // --- NEW ADDITIONS FOR BUNDLES ---
    {
        name: "🛌 Military Bed Making",
        category: "Discipline",
        time_of_day: "morning",
        type: "positive",
        impact_score: 3,
        energy_cost: 2,
        duration_minutes: 2,
        reward_pathway: "dopamine_drive" // Small win
    },
    {
        name: "📝 Morning Pages",
        category: "Mind",
        time_of_day: "morning",
        type: "positive",
        impact_score: 7,
        energy_cost: 4,
        duration_minutes: 20,
        reward_pathway: "serotonin_satisfaction" // Unloading
    },
    {
        name: "🥦 Plant Based Meal",
        category: "Body",
        time_of_day: "afternoon",
        type: "positive",
        impact_score: 6,
        energy_cost: 3,
        duration_minutes: 20,
        reward_pathway: "serotonin_satisfaction"
    },
    {
        name: "🖼️ Creative Block",
        category: "Focus",
        time_of_day: "afternoon",
        type: "positive",
        impact_score: 9,
        energy_cost: 6,
        duration_minutes: 60,
        reward_pathway: "dopamine_drive"
    },
    {
        name: "🎵 Listen to Music",
        category: "Mind",
        time_of_day: "all_day",
        type: "positive",
        impact_score: 5,
        energy_cost: 1, // Minimum friction
        duration_minutes: 15,
        reward_pathway: "dopamine_drive"
    }

];

export const PROTOCOL_BUNDLES = [
    {
        id: "huberman_baseline",
        name: "Huberman Baseline",
        description: "The essential neuro-biological foundation for optimal performance.",
        habits: ["☀️ Morning Sunlight (10m)", "🥶 Cold Shower", "☕ No Coffee First 90m", "😴 NSDR / Power Nap (20m)", "🏃‍♂️ Zone 2 Cardio"]
    },
    {
        id: "monk_mode",
        name: "Monk Mode (Deep Work)",
        description: "High-friction dopamine detox for extreme focus.",
        habits: ["🚀 Deep Work Block (90m)", "📱 Phone in Other Room", "🔇 Noise Cancelling ON", "🐸 Eat the Frog (Hardest Task First)", "🔒 Fasting (16:8)"]
    },
    {
        id: "sleep_sanctuary",
        name: "Sleep Sanctuary",
        description: "Cortisol reduction protocol to maximize recovery.",
        habits: ["📵 No Screens After 8PM", "🕯️ Dim Lights (Sunset)", "🍵 Herbal Tea", "📖 Reading (Fiction)", "🙏 Gratitude Journal", "🤐 Mouth Taping (Sleep)"]
    },
    {
        id: "dopamine_reboot",
        name: "Dopamine Reboot",
        description: "Reset reward pathways by eliminating cheap dopamine.",
        habits: ["🍩 Sugar Binge", "📱 Doomscrolling", "🍺 Alcohol", "📝 Daily Planning", "🚶‍♂️ 10k Steps", "🧘‍♂️ Mindfulness (15m)"]
    },
    {
        id: "cognitive_elite",
        name: "Cognitive Elite",
        description: "Nootropic behavioral stack for maximum mental output.",
        habits: ["🚀 Deep Work Block (90m)", "💊 Supplements", "🗣️ Language Learning", "🧩 Chess / Logic Puzzle", "🏃‍♂️ Zone 2 Cardio", "📝 Daily Planning"]
    },
    {
        id: "spartan_discipline",
        name: "Spartan Discipline",
        description: "Physical and mental hardening protocol.",
        habits: ["🥶 Cold Shower", "🏋️‍♂️ Heavy Lifting", "🔒 Fasting (16:8)", "🛑 No Complaining Challenge", "🛌 Military Bed Making", "🏃‍♂️ Zone 2 Cardio"]
    },
    {
        id: "zen_master",
        name: "Zen Master",
        description: "Mindfulness and presence-based living.",
        habits: ["🧘‍♂️ Mindfulness (15m)", "🍵 Herbal Tea", "🙏 Gratitude Journal", "🚶‍♂️ Post-Meal Walk (10m)", "🕯️ Dim Lights (Sunset)", "📵 No Screens After 8PM"]
    },
    {
        id: "ceo_morning",
        name: "CEO Morning",
        description: "High-leverage start for business leaders.",
        habits: ["☀️ Morning Sunlight (10m)", "💧 Hydration (500ml)", "📝 Daily Planning", "🐸 Eat the Frog (Hardest Task First)", "💰 Review Finances", "🤝 Networking"]
    },
    {
        id: "artist_flow",
        name: "Artist's Flow",
        description: "Creative state optimization and unblocking.",
        habits: ["📝 Morning Pages", "🚶‍♂️ Post-Meal Walk (10m)", "🖼️ Creative Block", "📱 Phone in Other Room", "📖 Reading (Fiction)", "🎵 Listen to Music"]
    },
    {
        id: "longevity_blueprint",
        name: "Longevity Blueprint",
        description: "Bryan Johnson style anti-aging protocol.",
        habits: ["🔒 Fasting (16:8)", "💊 Supplements", "😴 NSDR / Power Nap (20m)", "🥦 Plant Based Meal", "🕶️ Blue Light Blockers", "👀 20-20-20 Rule"]
    }
];
