import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Json } from "@/integrations/supabase/types";

export interface LayoutItem {
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

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
}

interface PageData {
  layouts: LayoutItem[];
  widgets: WidgetConfig[];
}

interface UserSettings {
  dashboard_layouts: LayoutItem[];
  dashboard_widgets: WidgetConfig[];
  flow_state_settings: Record<string, unknown>;
}

// Default fallbacks
const defaultCockpitLayouts: LayoutItem[] = [
  { i: "readiness-1", x: 0, y: 0, w: 2, h: 2, minW: 1, maxW: 6, minH: 2, maxH: 8 },
  { i: "circadian-1", x: 2, y: 0, w: 2, h: 2, minW: 1, maxW: 6, minH: 2, maxH: 8 },
  { i: "voltage-1", x: 4, y: 0, w: 2, h: 2, minW: 1, maxW: 6, minH: 2, maxH: 8 },
];

const defaultCockpitWidgets: WidgetConfig[] = [
  { id: "readiness-1", type: "readiness", title: "Readiness Index" },
  { id: "circadian-1", type: "circadian", title: "Circadian Rhythm" },
  { id: "voltage-1", type: "voltage", title: "System Voltage" },
];

export function useUserSettings() {
  const { user } = useAuth();

  // Local state for all pages
  // We'll store everything in a map: pageId -> PageData
  const [pages, setPages] = useState<Record<string, PageData>>({
    dashboard: { layouts: defaultCockpitLayouts, widgets: defaultCockpitWidgets }
  });

  const [flowStateSettings, setFlowStateSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Load settings from database
  useEffect(() => {
    if (!user) {
      setPages({
        dashboard: { layouts: defaultCockpitLayouts, widgets: defaultCockpitWidgets }
      });
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
        // Parse Dashboard (legacy columns)
        const dbDashboardLayouts = data.dashboard_layouts as unknown as LayoutItem[];
        const dbDashboardWidgets = data.dashboard_widgets as unknown as WidgetConfig[];

        // Parse Flow State / Generic Settings (JSON column)
        const savedSettings = data.flow_state_settings as Record<string, any> || {};

        // Extract other pages from savedSettings.pages_data if it exists
        const otherPages = savedSettings.pages_data || {};

        // Construct full state
        setPages({
          dashboard: {
            layouts: dbDashboardLayouts?.length ? dbDashboardLayouts : defaultCockpitLayouts,
            widgets: dbDashboardWidgets?.length ? dbDashboardWidgets : defaultCockpitWidgets
          },
          ...otherPages
        });

        // Store raw settings mostly for other keys
        setFlowStateSettings(savedSettings);
      }

      setLoading(false);
      setInitialized(true);
    };

    loadSettings();
  }, [user]);

  // Helper to save everything back to DB
  const persistSettings = async (
    currentPages: Record<string, PageData>,
    currentSettings: Record<string, unknown>
  ) => {
    if (!user) return;

    // Separate dashboard from others
    const { dashboard, ...otherPages } = currentPages;

    // Merge other pages into settings JSON
    const mergedSettings = {
      ...currentSettings,
      pages_data: otherPages
    };

    const { error } = await supabase
      .from("user_settings")
      .update({
        dashboard_layouts: dashboard?.layouts as unknown as Json,
        dashboard_widgets: dashboard?.widgets as unknown as Json,
        flow_state_settings: mergedSettings as unknown as Json,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error saving settings:", error);
    }
  };

  // Generic Update Function
  const updatePageSettings = useCallback(
    (pageId: string, layouts: LayoutItem[], widgets: WidgetConfig[]) => {
      setPages(prev => {
        const newPages = {
          ...prev,
          [pageId]: { layouts, widgets }
        };

        if (initialized && user) {
          persistSettings(newPages, flowStateSettings);
        }
        return newPages;
      });
    },
    [initialized, user, flowStateSettings]
  );

  // Specific getters for backward compatibility if needed, 
  // but preferably consumers use getPage(id) logic.

  return {
    pages,
    loading,
    updatePageSettings,
    // Accessor for specific page to simplify usage
    getPageSettings: (pageId: string, defaults?: PageData) => {
      return pages[pageId] || defaults || { layouts: [], widgets: [] };
    }
  };
}
