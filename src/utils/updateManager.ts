export const clearAllCaches = async (): Promise<void> => {
  try {
    const cacheNames = await caches.keys();
    console.log('🧹 Clearing all caches:', cacheNames);

    await Promise.all(
      cacheNames.map(cacheName => {
        console.log('🗑️ Deleting cache:', cacheName);
        return caches.delete(cacheName);
      })
    );

    console.log('✅ All caches cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
    throw error;
  }
};

export const clearTemporaryData = (): void => {
  try {
    const keysToPreserve = [
      'app_installed_version',
      'app_version_install_date',
      'selection_state',
      'sb-',
    ];

    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const shouldPreserve = keysToPreserve.some(preserveKey =>
          key.startsWith(preserveKey)
        );

        if (!shouldPreserve && !key.startsWith('cached_')) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => {
      console.log('🗑️ Removing temporary data:', key);
      localStorage.removeItem(key);
    });

    console.log('✅ Temporary data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing temporary data:', error);
  }
};

export const unregisterServiceWorkers = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log('🔧 Unregistering service workers:', registrations.length);

    await Promise.all(
      registrations.map(registration => {
        console.log('🗑️ Unregistering SW:', registration.scope);
        return registration.unregister();
      })
    );

    console.log('✅ All service workers unregistered');
  } catch (error) {
    console.error('❌ Error unregistering service workers:', error);
    throw error;
  }
};

export const performUpdate = async (onProgress?: (step: string) => void): Promise<void> => {
  try {
    onProgress?.('Desregistrando Service Workers...');
    await unregisterServiceWorkers();

    await new Promise(resolve => setTimeout(resolve, 500));

    onProgress?.('Limpando cache...');
    await clearAllCaches();

    await new Promise(resolve => setTimeout(resolve, 500));

    onProgress?.('Limpando dados temporários...');
    clearTemporaryData();

    await new Promise(resolve => setTimeout(resolve, 500));

    onProgress?.('Recarregando aplicação...');
    console.log('🔄 Performing hard reload...');

    window.location.reload();
  } catch (error) {
    console.error('❌ Error performing update:', error);
    throw error;
  }
};

export const forceReload = (): void => {
  console.log('🔄 Forcing page reload...');
  window.location.reload();
};

export const getAppCacheSize = async (): Promise<number> => {
  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return totalSize;
  } catch (error) {
    console.error('❌ Error calculating cache size:', error);
    return 0;
  }
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
