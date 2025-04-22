import { createContext, ReactNode, useContext, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeToNotifications } from "@/lib/supabase";

type NotificationContextType = {
  refetchNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Setup real-time notifications
  useEffect(() => {
    if (!user?.id) return;
    
    // Subscribe to real-time notifications from Supabase
    const subscription = subscribeToNotifications(user.id, (payload) => {
      // A new notification has been received
      const newNotification = payload.new;
      
      // Show a toast notification
      toast({
        title: "New notification",
        description: newNotification.message,
      });
      
      // Update the notifications list in the query cache
      queryClient.setQueryData(['/api/notifications'], (oldData: any[] | undefined) => {
        if (!oldData) return [newNotification];
        return [newNotification, ...oldData];
      });
      
      // Invalidate the query to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    });
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, toast, queryClient]);

  const refetchNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  };

  return (
    <NotificationContext.Provider value={{ refetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 