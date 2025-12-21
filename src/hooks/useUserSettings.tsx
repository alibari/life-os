import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Json } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

const STORAGE_KEY = "life_os_pages_cache";

export function useUserSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading: loading } = useQuery({
    queryKey: ['user_settings', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const dbDashboardLayouts = data.dashboard_layouts as unknown as LayoutItem[];
        const dbDashboardWidgets = data.dashboard_widgets as unknown as WidgetConfig[];
        const savedSettings = data.flow_state_settings as Record<string, any> || {};
        const otherPages = savedSettings.pages_data || {};

        const fullPages = {
          dashboard: {
            layouts: dbDashboardLayouts?.length ? dbDashboardLayouts : defaultCockpitLayouts,
            widgets: dbDashboardWidgets?.length ? dbDashboardWidgets : defaultCockpitWidgets
          },
          ...otherPages
        };

        // Sync to local storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fullPages));

        return {
          pages: fullPages,
          flowStateSettings: savedSettings
        };
      }
      return null;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    initialData: () => {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return {
          pages: JSON.parse(cached),
          flowStateSettings: {}
        };
      }
      return undefined;
    }
  });

  const mutation = useMutation({
    mutationFn: async ({ pages, flowStateSettings }: { pages: Record<string, PageData>, flowStateSettings: Record<string, unknown> }) => {
      if (!user) return;

      const { dashboard, ...otherPages } = pages;
      const mergedSettings = { ...flowStateSettings, pages_data: otherPages };

      const { error } = await supabase
        .from("user_settings")
        .update({
          dashboard_layouts: dashboard?.layouts as unknown as Json,
          dashboard_widgets: dashboard?.widgets as unknown as Json,
          flow_state_settings: mergedSettings as unknown as Json,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Update cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_settings', user?.id] });
    }
  });

  // Derived state or fallbacks
  const pages = settings?.pages || {
    dashboard: { layouts: defaultCockpitLayouts, widgets: defaultCockpitWidgets }
  };
  const flowStateSettings = settings?.flowStateSettings || {};

  const updatePageSettings = useCallback(
    (pageId: string, layouts: LayoutItem[], widgets: WidgetConfig[]) => {
      const newPages = {
        ...pages,
        [pageId]: { layouts, widgets }
      };
      mutation.mutate({ pages: newPages, flowStateSettings });
    },
    [pages, flowStateSettings, mutation]
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
