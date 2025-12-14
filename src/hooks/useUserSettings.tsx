import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Json } from "@/integrations/supabase/types";

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
}

interface WidgetConfig {
  id: string;
  type: string;
  title: string;
}

interface UserSettings {
  dashboard_layouts: LayoutItem[];
  dashboard_widgets: WidgetConfig[];
  flow_state_settings: Record<string, unknown>;
}

const defaultLayouts: LayoutItem[] = [
  { i: "readiness-1", x: 0, y: 0, w: 2, h: 2, minW: 1, maxW: 6, minH: 2, maxH: 6 },
  { i: "circadian-1", x: 2, y: 0, w: 2, h: 2, minW: 1, maxW: 6, minH: 2, maxH: 6 },
  { i: "voltage-1", x: 4, y: 0, w: 2, h: 2, minW: 1, maxW: 6, minH: 2, maxH: 6 },
];

const defaultWidgets: WidgetConfig[] = [
  { id: "readiness-1", type: "readiness", title: "Readiness Index" },
  { id: "circadian-1", type: "circadian", title: "Circadian Rhythm" },
  { id: "voltage-1", type: "voltage", title: "System Voltage" },
];

export function useUserSettings() {
  const { user } = useAuth();
  const [layouts, setLayouts] = useState<LayoutItem[]>(defaultLayouts);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets);
  const [flowStateSettings, setFlowStateSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Load settings from database
  useEffect(() => {
    if (!user) {
      setLayouts(defaultLayouts);
      setWidgets(defaultWidgets);
      setFlowStateSettings({});
      setLoading(false);
      setInitialized(false);
      return;
    }

    const loadSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading settings:", error);
        setLoading(false);
        setInitialized(true);
        return;
      }

      if (data) {
        const savedLayouts = data.dashboard_layouts as unknown as LayoutItem[];
        const savedWidgets = data.dashboard_widgets as unknown as WidgetConfig[];
        const savedFlowState = data.flow_state_settings as Record<string, unknown>;

        setLayouts(savedLayouts?.length ? savedLayouts : defaultLayouts);
        setWidgets(savedWidgets?.length ? savedWidgets : defaultWidgets);
        setFlowStateSettings(savedFlowState || {});
      }

      setLoading(false);
      setInitialized(true);
    };

    loadSettings();
  }, [user]);

  // Save settings to database
  const saveSettings = useCallback(
    async (newLayouts: LayoutItem[], newWidgets: WidgetConfig[], newFlowState?: Record<string, unknown>) => {
      if (!user) return;

      const { error } = await supabase
        .from("user_settings")
        .update({
          dashboard_layouts: newLayouts as unknown as Json,
          dashboard_widgets: newWidgets as unknown as Json,
          flow_state_settings: (newFlowState || flowStateSettings) as unknown as Json,
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error saving settings:", error);
      }
    },
    [user, flowStateSettings]
  );

  const updateLayouts = useCallback(
    (newLayouts: LayoutItem[]) => {
      setLayouts(newLayouts);
      if (initialized && user) {
        saveSettings(newLayouts, widgets);
      }
    },
    [initialized, user, widgets, saveSettings]
  );

  const updateWidgets = useCallback(
    (newWidgets: WidgetConfig[]) => {
      setWidgets(newWidgets);
      if (initialized && user) {
        saveSettings(layouts, newWidgets);
      }
    },
    [initialized, user, layouts, saveSettings]
  );

  const updateFlowStateSettings = useCallback(
    (newSettings: Record<string, unknown>) => {
      setFlowStateSettings(newSettings);
      if (initialized && user) {
        saveSettings(layouts, widgets, newSettings);
      }
    },
    [initialized, user, layouts, widgets, saveSettings]
  );

  return {
    layouts,
    widgets,
    flowStateSettings,
    loading,
    updateLayouts,
    updateWidgets,
    updateFlowStateSettings,
    setLayouts,
    setWidgets,
  };
}
