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
import { userActionLogger } from '../services/userActionLogger';
import {
  formatDateTime,
  formatValueWithUnit,
  toLocalDateTimeString,
  fromLocalDateTimeString,
  normalizeNumberInput,
  formatNumberForDisplay
} from '../utils/formatters';
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
import { DatePickerField } from '../components/DatePickerField';

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
  const [displayValues, setDisplayValues] = useState<Record<string, string>>({});

  const schema = createSchema(tipos);
  
  // Initialize default values
  const defaultValues = {
    data_hora_medicao: toLocalDateTimeString(),
    medicoes: {},
    photos: {},
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    reset,
    watch,
  } = useForm<MedicaoFormData>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const watchedValues = watch('medicoes');
  const watchedPhotos = watch('photos');

  const handleNumberInputChange = (tipoId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const normalizedValue = normalizeNumberInput(rawValue);
    
    // Update display value (what user sees)
    setDisplayValues(prev => ({
      ...prev,
      [tipoId]: rawValue
    }));
    
    // Update form value (normalized for processing)
    setValue(`medicoes.${tipoId}`, normalizedValue ? parseFloat(normalizedValue) : '');
  };

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
        const currentDisplayValue = displayValues[tipo.id] !== undefined 
          ? displayValues[tipo.id] 
          : valor ? formatNumberForDisplay(valor) : '';
        
        return (
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              step={step}
              value={currentDisplayValue}
              onChange={(e) => handleNumberInputChange(tipo.id, e)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                compliance === 'compliant' 
                  ? 'border-green-300 bg-green-50' 
                  : compliance === 'non-compliant'
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="0,00"
            />
            
            {compliance && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {compliance === 'compliant' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <span className="text-red-600 font-medium"> - Valor fora da faixa permitida!</span>
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
      console.log('🔍 Loading context data for medições...');
      
      // Load context data with cache support
      let contextData: {
        cliente?: Cliente;
        area?: AreaDeTrabalho;
        ponto?: PontoDeColeta;
      } = {};

      // Load cliente data
      const clienteCacheKey = 'cached_clientes';
      try {
        const cachedClientes = localStorage.getItem(clienteCacheKey);
        if (cachedClientes) {
          const clientes = JSON.parse(cachedClientes);
          contextData.cliente = clientes.find((c: Cliente) => c.id === clienteId);
          console.log('✅ Cliente loaded from cache');
        }

        if (isOnline && !contextData.cliente) {
          console.log('🔍 Loading cliente from Supabase...');
          const { data: clienteData, error: clienteError } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', clienteId)
            .single();

          if (!clienteError && clienteData) {
            contextData.cliente = clienteData;
            console.log('✅ Cliente loaded from Supabase');
          }
        }
      } catch (error) {
        console.error('❌ Error loading cliente:', error);
      }

      // Load area data
      const areaCacheKey = `cached_areas_${clienteId}`;
      try {
        const cachedAreas = localStorage.getItem(areaCacheKey);
        if (cachedAreas) {
          const areas = JSON.parse(cachedAreas);
          contextData.area = areas.find((a: AreaDeTrabalho) => a.id === areaId);
          console.log('✅ Area loaded from cache');
        }

        if (isOnline && !contextData.area) {
          console.log('🔍 Loading area from Supabase...');
          const { data: areaData, error: areaError } = await supabase
            .from('area_de_trabalho')
            .select('*')
            .eq('id', areaId)
            .single();

          if (!areaError && areaData) {
            contextData.area = areaData;
            console.log('✅ Area loaded from Supabase');
          }
        }
      } catch (error) {
        console.error('❌ Error loading area:', error);
      }

      // Load ponto data
      const pontoCacheKey = `cached_pontos_${areaId}`;
      try {
        const cachedPontos = localStorage.getItem(pontoCacheKey);
        if (cachedPontos) {
          const pontos = JSON.parse(cachedPontos);
          contextData.ponto = pontos.find((p: PontoDeColeta) => p.id === pontoId);
          console.log('✅ Ponto loaded from cache');
        }

        if (isOnline && !contextData.ponto) {
          console.log('🔍 Loading ponto from Supabase...');
          const { data: pontoData, error: pontoError } = await supabase
            .from('ponto_de_coleta')
            .select('*')
            .eq('id', pontoId)
            .single();

          if (!pontoError && pontoData) {
            contextData.ponto = pontoData;
            console.log('✅ Ponto loaded from Supabase');
          }
        }
      } catch (error) {
        console.error('❌ Error loading ponto:', error);
      }

      setContextData(contextData);

      // Load measurement types with cache support
      await loadTiposMedicao(contextData.ponto);
    } catch (error) {
      console.error('❌ Error loading context data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTiposMedicao = async (ponto?: PontoDeColeta) => {
    const TIPOS_CACHE_KEY = 'cached_tipos_medicao';
    let data: TipoMedicao[] = [];
    
    try {
      // 1. Load from cache first
      try {
        const cachedData = localStorage.getItem(TIPOS_CACHE_KEY);
        if (cachedData) {
          data = JSON.parse(cachedData);
          console.log('🔍 Tipos medicao loaded from cache:', data.length, 'items');
        }
      } catch (cacheError) {
        console.error('❌ Error reading tipos medicao cache:', cacheError);
      }

      // 2. If online, fetch fresh data from Supabase
      if (isOnline) {
        console.log('🔍 Loading tipos medicao from Supabase...');
        
        let tiposQuery = supabase
          .from('tipos_medicao')
          .select('*')
          .order('nome');

        // Filter by tipos_medicao if specified in ponto_de_coleta and we have the ponto data
        if (ponto?.tipos_medicao && ponto.tipos_medicao.length > 0) {
          console.log('🎯 Filtering tipos for ponto:', ponto.tipos_medicao);
          tiposQuery = tiposQuery.in('id', ponto.tipos_medicao);
        }

        const { data: tiposData, error: tiposError } = await tiposQuery;

        if (!tiposError && tiposData) {
          console.log('📊 Tipos medicao loaded from Supabase:', tiposData.length, 'items');
          data = tiposData;
          
          // Update cache
          try {
            localStorage.setItem(TIPOS_CACHE_KEY, JSON.stringify(data));
            console.log('✅ Tipos medicao cached successfully');
          } catch (cacheError) {
            console.error('❌ Error caching tipos medicao:', cacheError);
          }
        }
      } else if (data.length === 0) {
        console.log('❌ Offline and no cached tipos medicao available');
      }

      // Filter tipos by ponto's allowed types if specified (applies to both online and offline data)
      if (ponto?.tipos_medicao && ponto.tipos_medicao.length > 0) {
        const filteredTipos = data.filter(tipo => 
          ponto.tipos_medicao!.includes(tipo.id)
        );
        setTipos(filteredTipos);
        console.log('🎯 Final filtered tipos for ponto:', filteredTipos.length, 'of', data.length, 'total tipos');
      } else {
        console.log('ℹ️ No tipo filtering applied - showing all tipos:', data.length, 'items');
        setTipos(data);
      }

    } catch (error) {
      console.error('❌ Error loading tipos medicao:', error);
      // On error, still try to set an empty array to prevent UI issues
      setTipos([]);
    }
  };

  const handleBack = () => {
    // Don't clear the selection state when going back
    // This allows SelectionPage to restore the previous selections
    navigate('/selecao');
  };

  // Show offline message if no context data available
  if (!loading && (!contextData.cliente || !contextData.area || !contextData.ponto)) {
    return (
      <Layout title="Erro" showBackButton onBack={handleBack}>
        <div className="text-center py-12">
          <div className="mb-4">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Dados não disponíveis offline
            </h2>
            <p className="text-gray-600 mb-4">
              Os dados necessários não estão disponíveis no cache local. 
              {isOnline 
                ? 'Aguarde enquanto carregamos os dados...' 
                : 'Conecte-se à internet para carregar os dados necessários.'
              }
            </p>
            {!isOnline && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-orange-800">
                📱 <strong>Dica:</strong> Navegue até a seleção online primeiro para cachear os dados necessários
              </div>
            )}
          </div>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors"
          >
            Voltar à Seleção
          </button>
        </div>
      </Layout>
    );
  }

  // Show loading if still loading context data
  if (!contextData.cliente || !contextData.area || !contextData.ponto) {
    return (
      <Layout title="Carregando..." showBackButton onBack={handleBack}>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mr-3" />
          <span className="text-gray-600">Carregando dados do contexto...</span>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout title="Carregando..." showBackButton onBack={handleBack}>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mr-3" />
          <span className="text-gray-600">Preparando formulário...</span>
        </div>
      </Layout>
    );
  }

  // Show message if no tipos de medição available
  if (tipos.length === 0) {
    return (
      <Layout title="Medições" showBackButton onBack={handleBack}>
        <div className="text-center py-12">
          <div className="mb-4">
            <Hash className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum tipo de medição disponível
            </h2>
            <p className="text-gray-600 mb-4">
              {isOnline 
                ? 'Não há tipos de medição configurados para este ponto de coleta.' 
                : 'Tipos de medição não disponíveis offline. Conecte-se à internet.'
              }
            </p>
          </div>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors"
          >
            Voltar à Seleção
          </button>
        </div>
      </Layout>
    );
  }

  const onSubmit = async (data: MedicaoFormData) => {
    setSaving(true);

    try {
      await userActionLogger.logMedicaoAttempt({
        cliente_id: clienteId,
        area_de_trabalho_id: areaId,
        ponto_de_coleta_id: pontoId,
        formData: data,
        tipos: tipos,
      });
    } catch (logError) {
      console.error('Error logging medicao attempt:', logError);
    }

    try {
      // Converter data_hora_medicao de GMT-3 para UTC para o backend
      const convertToUTC = (localDateTimeString: string): string => {
        // A string vem no formato YYYY-MM-DDTHH:mm e representa horário GMT-3
        // Precisamos converter para UTC para salvar no backend
        const dateWithOffset = localDateTimeString + '-03:00';
        const date = new Date(dateWithOffset);
        return date.toISOString();
      };
      
      const utcDateTime = convertToUTC(data.data_hora_medicao);
      console.log('🕐 Converting datetime:', {
        localInput: data.data_hora_medicao,
        utcOutput: utcDateTime
      });
      
      // Process measurement items
      const medicaoItems = [];
      
      // Add regular measurements
      for (const [tipoId, valor] of Object.entries(data.medicoes)) {
        if (valor !== undefined && valor !== '') {
          const tipo = tipos.find(t => t.id === tipoId);
          let processedValue = valor;
          let numericValue = 0;
          let storedParametro = tipo?.nome;

          const isCriticalType =
            tipo?.nome &&
            (tipo.nome.toUpperCase().includes('PH') ||
              tipo.nome.toUpperCase().includes('CLORO') ||
              tipo.nome.toUpperCase().includes('FOTO'));
          
          // Convert boolean strings to actual booleans, then to numbers for storage
          if (tipo?.input_type === 'boolean' || tipo?.tipo === 'boolean') {
            const boolValue = valor === 'true' || valor === true;
            numericValue = boolValue ? 1 : 0; // Store as 1/0 in the valor field
          } else if (tipo?.input_type === 'number') {
            // For numeric inputs, convert to number
            numericValue = Number(processedValue);
            // If conversion fails, use 0 as fallback
            if (isNaN(numericValue)) {
              numericValue = 0;
            }
          } else if (['text', 'textarea', 'select'].includes(tipo?.input_type || '')) {
            // For text-based inputs, store the actual value in parametro and use 0 for valor
            numericValue = 0;
            storedParametro = `${tipo?.nome}: ${String(processedValue)}`;
          } else {
            const convertedValue = Number(processedValue);
            numericValue = isNaN(convertedValue) ? 0 : convertedValue;
          }

          if (isCriticalType && tipo) {
            try {
              await userActionLogger.logCriticalMedicaoType({
                cliente_id: clienteId,
                area_de_trabalho_id: areaId,
                ponto_de_coleta_id: pontoId,
                tipo_medicao_id: tipoId,
                tipo_medicao_nome: tipo.nome || '',
                tipo_metadata: {
                  input_type: tipo.input_type,
                  tipo: tipo.tipo,
                  range: tipo.range,
                  decimal_places: tipo.decimal_places,
                  unit: tipo.unit,
                  options: tipo.options,
                  validation_rules: tipo.validation_rules,
                },
                raw_value: valor,
                processed_value: processedValue,
                final_value: numericValue,
              });
            } catch (logError) {
              console.error('Error logging critical medicao type:', logError);
            }
          }

          medicaoItems.push({
            parametro: storedParametro,
            valor: numericValue,
            tipo_medicao_id: tipoId,
            tipo_medicao_nome: tipo?.nome,
          });
        }
      }

      // Add photo measurements (we'll handle the upload after creating the medicao record)
      for (const [tipoId, photos] of Object.entries(data.photos)) {
        if (photos && photos.length > 0) {
          const tipo = tipos.find(t => t.id === tipoId);

          if (tipo) {
            try {
              await userActionLogger.logCriticalMedicaoType({
                cliente_id: clienteId,
                area_de_trabalho_id: areaId,
                ponto_de_coleta_id: pontoId,
                tipo_medicao_id: tipoId,
                tipo_medicao_nome: tipo.nome || '',
                tipo_metadata: {
                  input_type: tipo.input_type,
                  tipo: tipo.tipo,
                },
                raw_value: `${photos.length} photo(s)`,
                processed_value: photos.map((p) => ({
                  name: p.name,
                  type: p.type,
                  size: p.size,
                })),
                final_value: photos.length,
              });
            } catch (logError) {
              console.error('Error logging photo medicao type:', logError);
            }
          }

          photos.forEach((photo, index) => {
            medicaoItems.push({
              parametro: tipo?.nome,
              valor: 1,
              tipo_medicao_id: tipoId,
              tipo_medicao_nome: tipo?.nome,
              image: `pending_upload_${tipoId}_${index}`,
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
      await addPendingMedicao({
        ponto_de_coleta_id: pontoId,
        data_hora_medicao: utcDateTime,
        cliente_id: clienteId,
        area_de_trabalho_id: areaId,
        items: medicaoItems,
        photos: photosForStorage,
      });

      try {
        await userActionLogger.logMedicaoSuccess({
          cliente_id: clienteId,
          area_de_trabalho_id: areaId,
          ponto_de_coleta_id: pontoId,
          items_count: medicaoItems.length,
          photos_count: photosForStorage.length,
        });
      } catch (logError) {
        console.error('Error logging medicao success:', logError);
      }

      showSuccess(
        '✅ Medição salva com sucesso!',
        isOnline ? 'Dados sincronizados automaticamente' : 'Dados serão sincronizados quando voltar online',
        3000
      );
      
      // Reset form
      reset({
        data_hora_medicao: toLocalDateTimeString(),
        medicoes: {},
        photos: {},
      });
      
      // Clear display values
      setDisplayValues({});
      
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

      try {
        await userActionLogger.logMedicaoError({
          cliente_id: clienteId,
          area_de_trabalho_id: areaId,
          ponto_de_coleta_id: pontoId,
          error: error,
          context: {
            formData: data,
            tipos: tipos.map((t) => ({ id: t.id, nome: t.nome })),
          },
        });
      } catch (logError) {
        console.error('Error logging medicao error:', logError);
      }
    } finally {
      setSaving(false);
    }
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
              <DatePickerField
                value={watch('data_hora_medicao')}
                onChange={(value) => setValue('data_hora_medicao', value)}
                error={errors.data_hora_medicao?.message}
              />
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