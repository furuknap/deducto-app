import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  isOnline,
  setupOnlineStatusListeners,
  triggerServiceWorkerSync,
} from "@/utils/serviceWorkerUtils";
import { toast } from "@/components/ui/use-toast";
import { useLanguage } from "./LanguageContext";

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingSyncCount: number;
  triggerSync: () => Promise<boolean>;
  setPendingSyncCount: (count: number) => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({
  children,
}) => {
  const [onlineStatus, setOnlineStatus] = useState<boolean>(isOnline());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const { t } = useLanguage();

  useEffect(() => {
    // Set up online/offline status listeners
    const cleanup = setupOnlineStatusListeners(
      // Online callback
      () => {
        setOnlineStatus(true);
        toast({
          title: t("youAreOnline"),
          description:
            pendingSyncCount > 0
              ? t("syncingPendingChanges")
              : t("allDataSynced"),
        });

        // Auto-trigger sync when coming back online if there are pending changes
        if (pendingSyncCount > 0) {
          triggerSync();
        }
      },
      // Offline callback
      () => {
        setOnlineStatus(false);
        toast({
          title: t("youAreOffline"),
          description: t("changesStoredLocally"),
        });
      }
    );

    return cleanup;
  }, [pendingSyncCount, t]);

  const triggerSync = async (): Promise<boolean> => {
    if (!onlineStatus) {
      toast({
        title: t("offlineMode"),
        description: t("cannotSyncOffline"),
        variant: "destructive",
      });
      return false;
    }

    if (isSyncing) {
      toast({
        title: t("syncInProgress"),
        description: t("pleaseWait"),
      });
      return false;
    }

    setIsSyncing(true);

    try {
      const success = await triggerServiceWorkerSync();

      if (success) {
        setLastSyncTime(new Date());
        setPendingSyncCount(0);
      }

      return success;
    } catch (error) {
      console.error("Error during sync:", error);
      toast({
        title: t("syncError"),
        description: error instanceof Error ? error.message : t("unknownError"),
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const value = {
    isOnline: onlineStatus,
    isSyncing,
    lastSyncTime,
    pendingSyncCount,
    triggerSync,
    setPendingSyncCount,
  };

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error("useOffline must be used within an OfflineProvider");
  }
  return context;
};
