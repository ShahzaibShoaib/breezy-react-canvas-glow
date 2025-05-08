import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { isTokenExpired, logout } from '@/lib/auth';
import { toast } from '@/components/ui/use-toast';

export function useTokenExpiration() {
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (!token) return;

    // Check token expiration immediately
    if (isTokenExpired(token)) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      logout();
      return;
    }

    // Set up periodic checks
    const checkInterval = setInterval(() => {
      if (isTokenExpired(token)) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        logout();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [token]);
}