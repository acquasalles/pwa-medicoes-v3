import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PhotoService } from '../services/photoService';
import { formatDateTime } from '../utils/formatters';

interface PendingMedicao {
  id: string;
  ponto_de_coleta_id: string;
  data_hora_medicao: string;
  cliente_id: number;
  area_de_trabalho_id?: string;
  items: Array<{
    parametro?: string;
    valor: number;
    tipo_medicao_id: string;
    tipo_medicao_nome?: string;
    image?: string;
  }>;
  timestamp: number;
  photos: Array<{
    tipo_medicao_id: string;
    file_data: string; // base64 encoded file
    file_name: string;
    file_type: string;
  }>;
}

export const useOfflineSync = () => {
  const [pendingMedicoes, setPendingMedicoes] = useState<PendingMedicao[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending data from localStorage
    loadPendingData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && pendingMedicoes.length > 0) {
      syncPendingData();
    }
  }, [isOnline, pendingMedicoes.length]);

  const loadPendingData = () => {
    try {
      const stored = localStorage.getItem('pending_medicoes');
      if (stored) {
        setPendingMedicoes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading pending data:', error);
    }
  };

  const savePendingData = (data: PendingMedicao[]) => {
    try {
      localStorage.setItem('pending_medicoes', JSON.stringify(data));
      setPendingMedicoes(data);
    } catch (error) {
      console.error('Error saving pending data:', error);
    }
  };

  const addPendingMedicao = (medicao: Omit<PendingMedicao, 'id' | 'timestamp'>) => {
    const newMedicao: PendingMedicao = {
      ...medicao,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      photos: medicao.photos || [],
    };

    const updated = [...pendingMedicoes, newMedicao];
    savePendingData(updated);

    if (isOnline) {
      syncPendingData();
    }

    return newMedicao.id;
  };

  const syncPendingData = async () => {
    if (syncing || pendingMedicoes.length === 0) return;

    setSyncing(true);
    setLastSyncError(null);
    const successfulSyncs: string[] = [];

    console.log('🔄 Starting sync process...');

    for (const medicao of pendingMedicoes) {
      try {


        console.log('💊 Syncing medicao:', {
          cliente_id: medicao.cliente_id,
          ponto_id: medicao.ponto_de_coleta_id,
          items_count: medicao.items.length,
          data_hora: formatDateTime(medicao.data_hora_medicao)
        });

        // RLS policies will handle user validation automatically

        // No user validation needed in mock mode
        console.log('✅ Access validation skipped (mock mode)');

        // Insert medicao
        console.log('📝 Inserting medicao record...');
        const { data: medicaoData, error: medicaoError } = await supabase
          .from('medicao')
          .insert({
            ponto_de_coleta_id: medicao.ponto_de_coleta_id,
            data_hora_medicao: medicao.data_hora_medicao,
            cliente_id: medicao.cliente_id,
            area_de_trabalho_id: medicao.area_de_trabalho_id,
          })
          .select()
          .single();

        if (medicaoError) {
          console.error('❌ Medicao insert error:', {
            error: medicaoError,
            code: medicaoError.code,
            message: medicaoError.message,
            details: medicaoError.details,
            hint: medicaoError.hint
          });
          setLastSyncError(`Erro ao inserir medição: ${medicaoError.message} (Código: ${medicaoError.code})`);
          throw medicaoError;
        }
        
        console.log('✅ Medicao inserted:', medicaoData.id);

        // Separate photo items from regular items
        const regularItems = medicao.items.filter(item => !item.image?.startsWith('pending_upload_'));
        const photoItems = medicao.items.filter(item => item.image?.startsWith('pending_upload_'));

        console.log('🔍 Items breakdown:', {
          totalItems: medicao.items.length,
          regularItems: regularItems.length,
          photoItems: photoItems.length,
          regularItemsData: regularItems,
          photoItemsData: photoItems
        });
        // Insert regular medicao items
        console.log('📝 Inserting medicao items...');
        const regularItemsToInsert = regularItems.map(item => ({
          ...item,
          medicao_id: medicaoData.id,
        }));

        console.log('📋 Regular items to insert:', {
          count: regularItemsToInsert.length,
          data: regularItemsToInsert,
          medicao_id: medicaoData.id
        });
        if (regularItemsToInsert.length > 0) {
          console.log('🚀 Starting regular items insertion...');
          const { error: regularItemsError } = await supabase
            .from('medicao_items')
            .insert(regularItemsToInsert);

          if (regularItemsError) {
            console.error('❌ Regular medicao items insert error:', {
              message: regularItemsError.message,
              code: regularItemsError.code,
              details: regularItemsError.details,
              hint: regularItemsError.hint,
              fullError: regularItemsError
            });
            setLastSyncError(`Erro ao inserir itens da medição: ${regularItemsError.message} (Código: ${regularItemsError.code})`);
            throw regularItemsError;
          }
          console.log('✅ Regular medicao items inserted:', regularItemsToInsert.length, 'items');
        } else {
          console.log('ℹ️ No regular items to insert');
        }
        
        // Handle photo uploads and create photo medicao items
        if (medicao.photos && medicao.photos.length > 0) {
          console.log('📸 Processing photo uploads...');
          console.log('📋 Photos to process:', {
            count: medicao.photos.length,
            photos: medicao.photos.map(p => ({
              tipo_medicao_id: p.tipo_medicao_id,
              file_name: p.file_name,
              file_type: p.file_type
            }))
          });
          
          for (const photo of medicao.photos) {
            try {
              console.log(`📸 Processing photo for tipo_medicao_id: ${photo.tipo_medicao_id}`);
              
              // Convert base64 back to File
              const byteString = atob(photo.file_data.split(',')[1]);
              const arrayBuffer = new ArrayBuffer(byteString.length);
              const uint8Array = new Uint8Array(arrayBuffer);
              for (let i = 0; i < byteString.length; i++) {
                uint8Array[i] = byteString.charCodeAt(i);
              }
              const file = new File([arrayBuffer], photo.file_name, { type: photo.file_type });
              
              // Create a medicao_item for this photo first
              const photoItem = photoItems.find(item => 
                item.image?.includes(photo.tipo_medicao_id)
              );
              
              console.log('🔍 Photo item found:', {
                photoItem,
                searchCriteria: photo.tipo_medicao_id,
                availablePhotoItems: photoItems
              });
              
              if (photoItem) {
                const photoItemToInsert = {
                  ...photoItem,
                  medicao_id: medicaoData.id,
                  image: null, // Will be updated after upload
                };
                
                console.log('📋 Photo item to insert:', photoItemToInsert);
                console.log('🚀 Starting photo item insertion...');
                
                const { data: photoItemData, error: photoItemError } = await supabase
                  .from('medicao_items')
                  .insert(photoItemToInsert)
                  .select()
                  .single();

                if (photoItemError) {
                  console.error('❌ Photo medicao item insert error:', {
                    message: photoItemError.message,
                    code: photoItemError.code,
                    details: photoItemError.details,
                    hint: photoItemError.hint,
                    fullError: photoItemError,
                    attemptedInsert: photoItemToInsert
                  });
                  continue; // Skip this photo but continue with others
                }

                console.log('✅ Photo medicao item created:', photoItemData.id);

                // Upload the photo
                const uploadResult = await PhotoService.uploadPhoto(
                  file,
                  photoItemData.id,
                  medicao.cliente_id
                );

                if (uploadResult.success) {
                  // Update the medicao_item with the photo URL
                  const { error: updateError } = await supabase
                    .from('medicao_items')
                    .update({ image: uploadResult.photo_url })
                    .eq('id', photoItemData.id);

                  if (updateError) {
                    console.error('❌ Error updating medicao item with photo URL:', updateError);
                  } else {
                    console.log('✅ Photo uploaded and linked to medicao item');
                  }
                } else {
                  console.error('❌ Photo upload failed:', uploadResult.error);
                }
              } else {
                console.error('❌ No photoItem found for tipo_medicao_id:', photo.tipo_medicao_id);
              }
            } catch (photoError) {
              console.error('❌ Error processing photo:', {
                error: photoError,
                photo: {
                  tipo_medicao_id: photo.tipo_medicao_id,
                  file_name: photo.file_name,
                  file_type: photo.file_type
                }
              });
              // Continue with other photos
            }
          }
        } else {
          console.log('ℹ️ No photos to process');
        }

        successfulSyncs.push(medicao.id);
      } catch (error) {
        console.error('🚨 Error syncing medicao:', error);
        
        // Enhanced error logging
        if (error && typeof error === 'object' && 'message' in error) {
          setLastSyncError((error as any).message);
        } else {
          setLastSyncError(String(error));
        }
        // Continue with next medicao
      }
    }


    console.log('📈 Sync completed:', {
      total: pendingMedicoes.length,
      successful: successfulSyncs.length,
      failed: pendingMedicoes.length - successfulSyncs.length
    });

    // Remove successfully synced items
    if (successfulSyncs.length > 0) {
      const remaining = pendingMedicoes.filter(m => !successfulSyncs.includes(m.id));
      savePendingData(remaining);
    }

    setSyncing(false);
  };

  const clearPendingData = () => {
    localStorage.removeItem('pending_medicoes');
    setPendingMedicoes([]);
  };

  return {
    pendingMedicoes,
    hasPendingData: pendingMedicoes.length > 0,
    syncing,
    isOnline,
    lastSyncError,
    addPendingMedicao,
    syncPendingData,
    clearPendingData,
    clearSyncError: () => setLastSyncError(null),
  };
};