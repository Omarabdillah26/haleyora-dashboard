import { useEffect, useCallback } from "react";
import { useData } from "../contexts/DataContext";

export const useRealTimeSync = () => {
  const { refreshData } = useData();

  // Function to sync data across all components
  const syncData = useCallback(async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error("Failed to sync data:", error);
    }
  }, [refreshData]);

  // Auto-refresh data every 30 seconds to ensure real-time updates
  useEffect(() => {
    const interval = setInterval(syncData, 30000);
    return () => clearInterval(interval);
  }, [syncData]);

  return { syncData };
};
