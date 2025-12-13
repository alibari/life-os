// Mock data for the Life OS app

export interface ReadinessData {
  sleepQuality: number; // 0-100
  hrv: number; // 0-100
  morningMood: number; // 0-100
  readinessScore: number; // calculated average
}

export interface CircadianMarker {
  time: string;
  label: string;
  type: "cortisol" | "focus" | "wind-down";
}

export const mockReadinessData: ReadinessData = {
  sleepQuality: 85,
  hrv: 78,
  morningMood: 92,
  readinessScore: 85,
};

export const circadianMarkers: CircadianMarker[] = [
  { time: "06:00", label: "Wake", type: "cortisol" },
  { time: "07:00", label: "Cortisol Peak", type: "cortisol" },
  { time: "10:00", label: "Focus Start", type: "focus" },
  { time: "14:00", label: "Focus End", type: "focus" },
  { time: "21:00", label: "Wind Down", type: "wind-down" },
  { time: "23:00", label: "Sleep", type: "wind-down" },
];

export const mockVoltage = {
  current: 87,
  trend: "+5",
  status: "optimal" as const,
};

export const getReadinessStatus = (score: number) => {
  if (score >= 80) {
    return {
      state: "anabolic" as const,
      message: "ANABOLIC STATE // GO",
      color: "primary",
    };
  } else if (score >= 50) {
    return {
      state: "neutral" as const,
      message: "BASELINE // PROCEED",
      color: "secondary",
    };
  } else {
    return {
      state: "catabolic" as const,
      message: "CATABOLIC STATE // RECOVER",
      color: "destructive",
    };
  }
};
