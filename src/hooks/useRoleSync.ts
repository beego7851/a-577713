import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['app_role'];

export const useRoleSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch role sync status
  const { data: syncStatus } = useQuery({
    queryKey: ['roleSyncStatus'],
    queryFn: async () => {
      console.log('Fetching role sync status...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }

      console.log('Role sync status:', {
        lastSync: roles?.[0]?.created_at,
        roles: roles?.map(r => r.role)
      });

      return {
        lastSync: roles?.[0]?.created_at || null,
        roles: roles?.map(r => r.role) || []
      };
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Mutation to sync roles with retry logic
  const { mutate: syncRoles } = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Starting role sync mutation for user:', userId);
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          // First, log the role change
          const { error: auditError } = await supabase.from('audit_logs').insert({
            user_id: userId,
            operation: 'update',
            table_name: 'user_roles',
            new_values: { sync_initiated: true },
            severity: 'info'
          });

          if (auditError) {
            console.error('Error logging role change:', auditError);
          }

          // Then update roles
          const { error } = await supabase.rpc('perform_user_roles_sync');
          
          if (error) {
            console.error(`Error performing role sync (attempt ${attempts + 1}/${maxAttempts}):`, error);
            if (attempts === maxAttempts - 1) throw error;
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1))); // Exponential backoff
            continue;
          }

          console.log('Role sync completed successfully');
          return { success: true };
        } catch (error) {
          if (attempts === maxAttempts - 1) throw error;
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1))); // Exponential backoff
        }
      }

      throw new Error('Failed to sync roles after multiple attempts');
    },
    meta: {
      onSuccess: () => {
        // Invalidate all related queries
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ['userRoles'] }),
          queryClient.invalidateQueries({ queryKey: ['roleSyncStatus'] }),
          queryClient.invalidateQueries({ queryKey: ['collectors-roles'] }),
          queryClient.invalidateQueries({ queryKey: ['collectors'] })
        ]).then(() => {
          console.log('All queries invalidated after successful sync');
        });

        toast({
          title: "Roles synchronized",
          description: "Your roles have been updated successfully.",
        });
      },
      onError: (error: Error) => {
        console.error('Role sync error:', error);
        toast({
          title: "Error syncing roles",
          description: "Failed to sync roles. Please try again later.",
          variant: "destructive",
        });
      }
    }
  });

  return {
    syncStatus,
    syncRoles
  };
};