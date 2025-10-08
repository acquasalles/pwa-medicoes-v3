import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { APP_VERSION, updateLastVersionCheck, shouldCheckForUpdate, hasUpdateBeenDismissed } from '../lib/version';
import { isNewerVersion } from '../utils/semver';

export interface AppVersion {
  id: string;
  version: string;
  release_date: string;
  force_update: boolean;
  description: string | null;
  is_active: boolean;
}

export interface VersionCheckResult {
  currentVersion: string;
  latestVersion: AppVersion | null;
  updateAvailable: boolean;
  forceUpdate: boolean;
  releaseNotes: string | null;
  checking: boolean;
  error: string | null;
}

const CHECK_INTERVAL_MS = 30 * 60 * 1000;

export const useVersionCheck = () => {
  const [state, setState] = useState<VersionCheckResult>({
    currentVersion: APP_VERSION,
    latestVersion: null,
    updateAvailable: false,
    forceUpdate: false,
    releaseNotes: null,
    checking: false,
    error: null,
  });

  const checkForUpdates = useCallback(async (forceCheck: boolean = false) => {
    if (!forceCheck && !shouldCheckForUpdate(5)) {
      console.log('⏭️ Skipping version check - checked recently');
      return;
    }

    setState(prev => ({ ...prev, checking: true, error: null }));

    try {
      console.log('🔍 Checking for app updates...');

      const { data, error } = await supabase
        .from('app_version')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        console.log('ℹ️ No active version found in database');
        setState(prev => ({ ...prev, checking: false }));
        return;
      }

      console.log('📦 Current version:', APP_VERSION);
      console.log('📦 Latest version:', data.version);

      const isNewer = isNewerVersion(APP_VERSION, data.version);
      const wasDismissed = hasUpdateBeenDismissed(data.version);

      const updateAvailable = isNewer && (!wasDismissed || data.force_update);

      setState({
        currentVersion: APP_VERSION,
        latestVersion: data,
        updateAvailable,
        forceUpdate: data.force_update && isNewer,
        releaseNotes: data.description,
        checking: false,
        error: null,
      });

      updateLastVersionCheck();

      if (updateAvailable) {
        console.log('🎉 Update available:', data.version, data.force_update ? '(REQUIRED)' : '(optional)');
      } else if (isNewer && wasDismissed) {
        console.log('ℹ️ Update available but was dismissed by user');
      } else {
        console.log('✅ App is up to date');
      }
    } catch (error) {
      console.error('❌ Error checking for updates:', error);
      setState(prev => ({
        ...prev,
        checking: false,
        error: error instanceof Error ? error.message : 'Erro ao verificar atualizações',
      }));
    }
  }, []);

  useEffect(() => {
    checkForUpdates(false);

    const intervalId = setInterval(() => {
      checkForUpdates(false);
    }, CHECK_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ App became visible, checking for updates...');
        checkForUpdates(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleOnline = () => {
      console.log('🌐 Connection restored, checking for updates...');
      checkForUpdates(false);
    };

    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [checkForUpdates]);

  const recheckNow = useCallback(() => {
    checkForUpdates(true);
  }, [checkForUpdates]);

  return {
    ...state,
    recheckNow,
  };
};
