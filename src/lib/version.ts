export const APP_VERSION = '1.1.20';

const VERSION_STORAGE_KEY = 'app_installed_version';
const VERSION_INSTALL_DATE_KEY = 'app_version_install_date';
const LAST_VERSION_CHECK_KEY = 'app_last_version_check';
const DISMISSED_UPDATE_KEY = 'app_dismissed_update_version';

export interface VersionInfo {
  version: string;
  installDate: string;
  lastCheck?: string;
}

export const saveInstalledVersion = (): void => {
  try {
    const currentStored = localStorage.getItem(VERSION_STORAGE_KEY);

    if (currentStored !== APP_VERSION) {
      localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
      localStorage.setItem(VERSION_INSTALL_DATE_KEY, new Date().toISOString());

      localStorage.removeItem(DISMISSED_UPDATE_KEY);

      console.log(`📦 Version ${APP_VERSION} installed at ${new Date().toISOString()}`);
    }
  } catch (error) {
    console.error('Error saving installed version:', error);
  }
};

export const getInstalledVersion = (): VersionInfo | null => {
  try {
    const version = localStorage.getItem(VERSION_STORAGE_KEY);
    const installDate = localStorage.getItem(VERSION_INSTALL_DATE_KEY);
    const lastCheck = localStorage.getItem(LAST_VERSION_CHECK_KEY);

    if (!version || !installDate) {
      return null;
    }

    return {
      version,
      installDate,
      lastCheck: lastCheck || undefined,
    };
  } catch (error) {
    console.error('Error getting installed version:', error);
    return null;
  }
};

export const updateLastVersionCheck = (): void => {
  try {
    localStorage.setItem(LAST_VERSION_CHECK_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Error updating last version check:', error);
  }
};

export const shouldCheckForUpdate = (minIntervalMinutes: number = 5): boolean => {
  try {
    const lastCheck = localStorage.getItem(LAST_VERSION_CHECK_KEY);

    if (!lastCheck) {
      return true;
    }

    const lastCheckTime = new Date(lastCheck).getTime();
    const now = Date.now();
    const intervalMs = minIntervalMinutes * 60 * 1000;

    return (now - lastCheckTime) >= intervalMs;
  } catch (error) {
    console.error('Error checking if should update:', error);
    return true;
  }
};

export const dismissUpdate = (version: string): void => {
  try {
    localStorage.setItem(DISMISSED_UPDATE_KEY, version);
  } catch (error) {
    console.error('Error dismissing update:', error);
  }
};

export const hasUpdateBeenDismissed = (version: string): boolean => {
  try {
    const dismissed = localStorage.getItem(DISMISSED_UPDATE_KEY);
    return dismissed === version;
  } catch (error) {
    console.error('Error checking dismissed update:', error);
    return false;
  }
};

export const clearVersionData = (): void => {
  try {
    localStorage.removeItem(DISMISSED_UPDATE_KEY);
    console.log('🧹 Cleared version dismissal data');
  } catch (error) {
    console.error('Error clearing version data:', error);
  }
};
