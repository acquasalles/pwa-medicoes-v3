import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { userActionLogger } from '../services/userActionLogger';

export const useUserActionConfig = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_action_config')
        .select('is_enabled')
        .eq('id', 1)
        .maybeSingle();

      if (!error && data) {
        setIsEnabled(data.is_enabled);
      }
    } catch (error) {
      console.error('Error fetching user action config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (enabled: boolean): Promise<boolean> => {
    try {
      setUpdating(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_action_config')
        .update({
          is_enabled: enabled,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('id', 1);

      if (error) {
        console.error('Error updating user action config:', error);
        return false;
      }

      setIsEnabled(enabled);
      await userActionLogger.refreshConfig();
      return true;
    } catch (error) {
      console.error('Error updating config:', error);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    isEnabled,
    loading,
    updating,
    updateConfig,
    refreshConfig: fetchConfig,
  };
};
