import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useToastContext } from '../contexts/ToastContext';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { supabase, TipoMedicao, Cliente, AreaDeTrabalho, PontoDeColeta } from '../lib/supabase';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PhotoService } from '../services/photoService';
import { 
  Loader2, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Target,
  Calendar,
  Hash,
  Camera,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';

interface LocationState {
  clienteId: number;
  areaId: string;
  pontoId: string;
}

interface MedicaoFormData {
  data_hora_medicao: string;
  medicoes: Record<string, number>;
  photos: Record<string, File[]>;
}

const createSchema = (tipos: TipoMedicao[]) => {
  const medicaoSchema: Record<string, any> = {};
  const photoSchema: Record<string, any> = {};
  
  tipos.forEach(tipo => {
    const isRequired = tipo.validation_rules?.required !== false;
    
    if (tipo.input_type === 'photo') {
      photoSchema[tipo.id] = isRequired 
        ? yup.array().min(1, `${tipo.nome} é obrigatório`).required(`${tipo.nome} é obrigatório`)
        : yup.array().nullable();
    } else if (tipo.input_type === 'boolean' || tipo.tipo === 'boolean') {
      let schema = yup.boolean().typeError(`${tipo.nome} deve ser verdadeiro ou falso`);
      if (isRequired) {
        schema = schema.required(`${tipo.nome} é obrigatório`);
      }
      medicaoSchema[tipo.id] = schema;
    } else if (tipo.input_type === 'number') {
      let schema = yup.number().typeError(`${tipo.nome} deve ser um número`);
      if (isRequired) {
        schema = schema.required(`${tipo.nome} é obrigatório`);
      }
      if (tipo.range?.min !== undefined) {
        schema = schema.min(tipo.range.min, `Valor mínimo: ${tipo.range.min}`);
      }
      if (tipo.range?.max !== undefined) {
        schema = schema.max(tipo.range.max, `Valor máximo: ${tipo.range.max}`);
      }
      medicaoSchema[tipo.id] = schema;
    } else {
      medicaoSchema[tipo.id] = isRequired
        ? yup.string().required(`${tipo.nome} é obrigatório`)
        : yup.string().nullable();
    }
  });

  return yup.object({
    data_hora_medicao: yup
      .string()
      .required('Data e hora são obrigatórias'),
    medicoes: yup.object(medicaoSchema),
    photos: yup.object(photoSchema),
  });
};

export const MedicoesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addPendingMedicao, isOnline } = useOfflineSync();
  const { showSuccess } = useToastContext();
  
  const locationState = location.state as LocationState;
  
  if (!locationState) {
    navigate('/selecao');
    return null;
  }

  const { clienteId, areaId, pontoId } = locationState;

  const [tipos, setTipos] = useState<TipoMedicao[]>([]);
  const [contextData, setContextData] = useState<{
    cliente?: Cliente;
    area?: AreaDeTrabalho;
    ponto?: PontoDeColeta;
  }>({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState<Record<string, boolean>>({});
  const [photoPreview, setPhotoPreview] = useState<Record<string, string[]>>({});

  const schema = createSchema(tipos);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm<MedicaoFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      data_hora_medicao: new Date().toISOString().slice(0, 16),
      medicoes: {},
      photos: {},
    },
  });

  const watchedValues = watch('medicoes');
  const watchedPhotos = watch('photos');

  const handlePhotoUpload = (tipoId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const currentPhotos = watchedPhotos[tipoId] || [];
    const newPhotos = [...currentPhotos, ...files];
    
    setValue(`photos.${tipoId}`, newPhotos);

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    const currentPreviews = photoPreview[tipoId] || [];
    
    setPhotoPreview(prev => ({
      ...prev,
      [tipoId]: [...currentPreviews, ...newPreviews]
    }));
  };

  const removePhoto = (tipoId: string, index: number) => {
    const currentPhotos = watchedPhotos[tipoId] || [];
    const currentPreviews = photoPreview[tipoId] || [];
    
    // Revoke the preview URL to prevent memory leaks
    if (currentPreviews[index]) {
      URL.revokeObjectURL(currentPreviews[index]);
    }

    const newPhotos = currentPhotos.filter((_, i) => i !== index);
    const newPreviews = currentPreviews.filter((_, i) => i !== index);

    setValue(`photos.${tipoId}`, newPhotos);
    setPhotoPreview(prev => ({
      ...prev,
      [tipoId]: newPreviews
    }));
  };

  const renderInput = (tipo: TipoMedicao, parsedOptions: any) => {
    const valor = watchedValues[tipo.id];
    const photos = watchedPhotos[tipo.id] || [];
    const previews = photoPreview[tipo.id] || [];
    const compliance = valor && tipo.input_type === 'number' ? getComplianceStatus(tipo.id, Number(valor)) : null;
    
    switch (tipo.input_type) {
      case 'boolean':
        // Determinar o tipo de componente baseado nas options
        const booleanType = parsedOptions?.display_type || 'checkbox';
        const trueLabel = parsedOptions?.true_label || 'Sim';
        const falseLabel = parsedOptions?.false_label || 'Não';
        
        if (booleanType === 'radio') {
          return (
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  {...register(`medicoes.${tipo.id}`)}
                  type="radio"
                  value="true"
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{trueLabel}</span>
              </label>
              <label className="flex items-center">
                <input
                  {...register(`medicoes.${tipo.id}`)}
                  type="radio"
                  value="false"
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{falseLabel}</span>
              </label>
            </div>
          );
        } else if (booleanType === 'select') {
          return (
            <select
              {...register(`medicoes.${tipo.id}`)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecione...</option>
              <option value="true">{trueLabel}</option>
              <option value="false">{falseLabel}</option>
            </select>
          );
        } else {
          // Default: checkbox
          return (
            <div className="flex items-center">
              <input
                {...register(`medicoes.${tipo.id}`)}
                type="checkbox"
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                {parsedOptions?.checkbox_label || trueLabel || `Marcar ${tipo.nome?.toLowerCase()}`}
              </span>
            </div>
          );
        }
        
      case 'photo':
        return (
          <div className="space-y-2">
            {/* Photo Upload Area */}
            <div className="flex items-center justify-center w-full mb-3">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-6 h-6 mb-1 text-gray-400" />
                  <p className="text-xs text-gray-500">
                    {uploadingPhotos[tipo.id] ? 'Enviando...' : 'Adicionar foto'}
                  </p>
                </div>
                <input
                  {...register(`photos.${tipo.id}`)}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="hidden"
                  disabled={uploadingPhotos[tipo.id]}
                  onChange={(e) => handlePhotoUpload(tipo.id, e)}
                />
              </label>
            </div>

            {/* Photo Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(tipo.id, index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photos.length > 0 && (
              <p className="text-xs text-green-600 flex items-center">
                <ImageIcon className="w-3 h-3 mr-1" />
                {photos.length} foto(s) selecionada(s)
              </p>
            )}
          </div>
        );
        
      case 'select':
        return (
          <select
            {...register(`medicoes.${tipo.id}`)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Selecione...</option>
            {parsedOptions?.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
        
      case 'textarea':
        return (
          <textarea
            {...register(`medicoes.${tipo.id}`)}
            rows={parsedOptions?.rows || 3}
            maxLength={parsedOptions?.maxLength}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder={`Digite ${tipo.nome?.toLowerCase()}...`}
          />
        );
        
      case 'text':
        return (
          <input
            {...register(`medicoes.${tipo.id}`)}
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={`Digite ${tipo.nome?.toLowerCase()}...`}
          />
        );
        
      case 'number':
      default:
        const step = tipo.decimal_places === 0 ? '1' : `0.${'0'.repeat((tipo.decimal_places || 2) - 1)}1`;
        return (
          <div className="relative">
            <input
              {...register(`medicoes.${tipo.id}`)}
              type="number"
              step={step}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                compliance === 'compliant' 
                  ? 'border-green-300 bg-green-50' 
                  : compliance === 'non-compliant'
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="0"
            />
            
            {compliance && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {compliance === 'compliant' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            )}
          </div>
        );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Load context data
      const [clienteRes, areaRes, pontoRes] = await Promise.all([
        supabase.from('clientes').select('*').eq('id', clienteId).single(),
        supabase.from('area_de_trabalho').select('*').eq('id', areaId).single(),
        supabase.from('ponto_de_coleta').select('*').eq('id', pontoId).single(),
      ]);

      setContextData({
        cliente: clienteRes.data || undefined,
        area: areaRes.data || undefined,
        ponto: pontoRes.data || undefined,
      });

      // Load available measurement types for this collection point
      let tiposQuery = supabase
        .from('tipos_medicao')
        .select('*')
        .order('nome');

      // Filter by tipos_medicao if specified in ponto_de_coleta
      if (pontoRes.data?.tipos_medicao && pontoRes.data.tipos_medicao.length > 0) {
        tiposQuery = tiposQuery.in('id', pontoRes.data.tipos_medicao);
      }

      const { data: tiposData, error: tiposError } = await tiposQuery;

      if (tiposError) throw tiposError;
      setTipos(tiposData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: MedicaoFormData) => {
    setSaving(true);
    
    try {
      // Process measurement items
      const medicaoItems = [];
      
      // Add regular measurements
      for (const [tipoId, valor] of Object.entries(data.medicoes)) {
        if (valor !== undefined && valor !== '') {
          const tipo = tipos.find(t => t.id === tipoId);
          let processedValue = valor;
          
          // Convert boolean strings to actual booleans, then to numbers for storage
          if (tipo?.input_type === 'boolean' || tipo?.tipo === 'boolean') {
            const boolValue = valor === 'true' || valor === true;
            processedValue = boolValue ? 1 : 0; // Store as 1/0 in the valor field
          }
          
          medicaoItems.push({
            parametro: tipo?.nome,
            valor: Number(processedValue),
            tipo_medicao_id: tipoId,
            tipo_medicao_nome: tipo?.nome,
          });
        }
      }

      // Add photo measurements (we'll handle the upload after creating the medicao record)
      for (const [tipoId, photos] of Object.entries(data.photos)) {
        if (photos && photos.length > 0) {
          const tipo = tipos.find(t => t.id === tipoId);
          // For each photo, create a measurement item
          photos.forEach((photo, index) => {
            medicaoItems.push({
              parametro: tipo?.nome,
              valor: 1, // We use 1 to indicate a photo was taken
              tipo_medicao_id: tipoId,
              tipo_medicao_nome: tipo?.nome,
              image: `pending_upload_${tipoId}_${index}`, // Temporary identifier
            });
          });
        }
      }

      // Convert photos to base64 for storage
      const photosForStorage = [];
      for (const [tipoId, photos] of Object.entries(data.photos)) {
        if (photos && photos.length > 0) {
          for (const photo of photos) {
            const base64 = await convertFileToBase64(photo);
            photosForStorage.push({
              tipo_medicao_id: tipoId,
              file_data: base64,
              file_name: photo.name,
              file_type: photo.type,
            });
          }
        }
      }

      // Add to pending (handles both online and offline scenarios)
      addPendingMedicao({
        ponto_de_coleta_id: pontoId,
        data_hora_medicao: data.data_hora_medicao,
        cliente_id: clienteId,
        area_de_trabalho_id: areaId,
        items: medicaoItems,
        photos: photosForStorage,
      });

      // Note: Photo uploads are now handled by the sync process

      // Show success toast
      showSuccess(
        '✅ Medição salva com sucesso!',
        isOnline ? 'Dados sincronizados automaticamente' : 'Dados serão sincronizados quando voltar online',
        3000
      );
      
      // Reset form
      reset({
        data_hora_medicao: new Date().toISOString().slice(0, 16),
        medicoes: {},
        photos: {},
      });
      
      // Clear photo previews
      Object.values(photoPreview).flat().forEach(url => {
        URL.revokeObjectURL(url);
      });
      setPhotoPreview({});

      // Auto-return to previous page after toast
      setTimeout(() => {
        handleBack();
      }, 2500);
    } catch (error) {
      console.error('Error saving medicao:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    // Don't clear the selection state when going back
    // This allows SelectionPage to restore the previous selections
    navigate('/selecao');
  };

  const getComplianceStatus = (tipoId: string, valor: number) => {
    const tipo = tipos.find(t => t.id === tipoId);
    if (!tipo?.range) return null;

    const { min, max } = tipo.range;
    if (valor < min || valor > max) {
      return 'non-compliant';
    }
    return 'compliant';
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  if (loading) {
    return (
      <Layout title="Carregando..." showBackButton onBack={handleBack}>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Cadastro de Medições" showBackButton onBack={handleBack}>
      <div className="max-w-4xl mx-auto">
        {/* Cliente Name */}
        {contextData.cliente && (
          <div className="mb-4">
            <p className="text-lg text-gray-700 font-medium">
              {contextData.cliente.razao_social || contextData.cliente.id_name}
            </p>
          </div>
        )}

        {/* Context Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Local Selecionado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-gray-600">Área</p>
                <p className="font-medium">{contextData.area?.nome_area}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-gray-600">Ponto de Coleta</p>
                <p className="font-medium">{contextData.ponto?.nome}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Date Time Input */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary">Data e Hora da Medição</h3>
            </div>
            
            <div className="max-w-md">
              <input
                {...register('data_hora_medicao')}
                type="datetime-local"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {errors.data_hora_medicao && (
                <p className="mt-1 text-sm text-red-600">{errors.data_hora_medicao.message}</p>
              )}
            </div>
          </div>

          {/* Measurements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Hash className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary">Medições</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tipos.map((tipo) => {
                const valor = watchedValues[tipo.id];
                const compliance = valor && tipo.input_type === 'number' ? getComplianceStatus(tipo.id, Number(valor)) : null;
                
                // Parse options - handle nested JSON strings
                let parsedOptions = tipo.options;
                if (typeof parsedOptions === 'string') {
                  try {
                    parsedOptions = JSON.parse(parsedOptions);
                    // Handle nested options structure
                    if (parsedOptions.options) {
                      parsedOptions = parsedOptions.options;
                    }
                  } catch (error) {
                    console.error('Error parsing options:', error);
                    parsedOptions = {};
                  }
                }

                return (
                  <div key={tipo.id} className="space-y-2">
                    <label className="block text-sm font-medium text-primary">
                      {tipo.nome}
                      {tipo.unit && (
                        <span className="text-gray-500 font-normal"> ({tipo.unit})</span>
                      )}
                      {tipo.validation_rules?.required !== false && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    
                    {renderInput(tipo, parsedOptions)}

                    {(errors.medicoes?.[tipo.id] || errors.photos?.[tipo.id]) && (
                      <p className="text-sm text-red-600">
                        {errors.medicoes?.[tipo.id]?.message || errors.photos?.[tipo.id]?.message}
                      </p>
                    )}
                    
                    {tipo.range && tipo.input_type === 'number' && (
                      <p className="text-xs text-gray-500">
                        Faixa: {tipo.range.min} - {tipo.range.max}
                        {compliance === 'non-compliant' && Number(valor) && (
                          <span className="text-red-600 font-medium"> - Fora da faixa!</span>
                        )}
                      </p>
                    )}
                    
                    {parsedOptions?.maxLength && tipo.input_type === 'textarea' && (
                      <p className="text-xs text-gray-500">
                        Máximo {parsedOptions.maxLength} caracteres
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {(Object.keys(errors.medicoes || {}).length > 0 || Object.keys(errors.photos || {}).length > 0) && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">
                  Por favor, preencha todos os campos obrigatórios.
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary hover:bg-primary-light disabled:bg-primary/40 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Salvar Medição</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};