import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { supabase, Cliente, AreaDeTrabalho, PontoDeColeta } from '../lib/supabase';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { Loader2, ChevronDown, Building2, MapPin, Target, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { isOnline } = useOfflineSync();
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [areas, setAreas] = useState<AreaDeTrabalho[]>([]);
  const [pontos, setPontos] = useState<PontoDeColeta[]>([]);
  const [pontosComMedicoes, setPontosComMedicoes] = useState<Set<string>>(new Set());
  
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  
  const [loading, setLoading] = useState({
    clientes: false,
    areas: false,
    pontos: false,
    medicoes: false,
  });

  // Save selection state to localStorage
  const saveSelectionState = () => {
    const state = {
      clienteId: selectedCliente,
      areaId: selectedArea,
      timestamp: Date.now(),
    };
    localStorage.setItem('selection_state', JSON.stringify(state));
  };

  // Load selection state from localStorage
  const loadSelectionState = () => {
    try {
      const stored = localStorage.getItem('selection_state');
      if (stored) {
        const state = JSON.parse(stored);
        // Only restore if not too old (1 hour)
        if (Date.now() - state.timestamp < 60 * 60 * 1000) {
          return state;
        }
      }
    } catch (error) {
      console.error('Error loading selection state:', error);
    }
    return null;
  };
  useEffect(() => {
    const initializePage = async () => {
      const savedState = loadSelectionState();
      await loadClientes();
      
      // Restore previous selections if available
      if (savedState) {
        if (savedState.clienteId) {
          setSelectedCliente(savedState.clienteId);
          // These will trigger the useEffect hooks to load areas and pontos
        }
      }
    };
    
    initializePage();
  }, []);

  // Load areas and set previous area selection
  useEffect(() => {
    if (selectedCliente) {
      const loadAndRestore = async () => {
        await loadAreas(selectedCliente);
        
        // Restore area selection if coming back from medições
        const savedState = loadSelectionState();
        if (savedState && savedState.areaId && savedState.clienteId === selectedCliente) {
          setSelectedArea(savedState.areaId);
        } else {
          setSelectedArea(null);
        }
      };
      
      loadAndRestore();
    }
  }, [selectedCliente]);

  // Load pontos and set previous ponto selection
  useEffect(() => {
    if (selectedArea) {
      const loadAndRestore = async () => {
        await loadPontos(selectedArea);
      };
      
      loadAndRestore();
    }
  }, [selectedArea]);

  const loadClientes = async () => {
    setLoading(prev => ({ ...prev, clientes: true }));
    const CACHE_KEY = 'cached_clientes';
    let data: Cliente[] = [];
    
    try {
      // 1. Tentar carregar do cache local primeiro
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          data = JSON.parse(cachedData);
          setClientes(data);
          console.log('🔍 Clientes loaded from cache:', data.length, 'items');
        }
      } catch (cacheError) {
        console.error('❌ Error reading clientes cache:', cacheError);
      }

      // 2. Se online, buscar dados atualizados do Supabase
      if (isOnline) {
        console.log('🔍 Loading clientes from Supabase...');
        
        const { data: supabaseData, error } = await supabase
          .from('clientes')
          .select('*')
          .order('razao_social');

        if (error) throw error;
        
        if (supabaseData) {
          console.log('📊 Clientes loaded from Supabase:', supabaseData.length, 'items');
          data = supabaseData;
          setClientes(data);
          
          // Atualizar cache
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
            console.log('✅ Clientes cached successfully');
          } catch (cacheError) {
            console.error('❌ Error caching clientes:', cacheError);
          }
        }
      } else if (data.length === 0) {
        console.log('❌ Offline and no cached clientes available');
      }
      
      console.log('📋 Final clientes for user:', data.map(c => ({
        id: c.id,
        razao_social: c.razao_social || c.id_name
      })));
      
      // Auto-select if only one client
      if (data.length === 1) {
        console.log('🎯 Auto-selecting single client:', data[0].id);
        setSelectedCliente(data[0].id);
      }
    } catch (error) {
      console.error('Error loading clientes:', error);
    } finally {
      setLoading(prev => ({ ...prev, clientes: false }));
    }
  };

  const loadAreas = async (clienteId: number) => {
    setLoading(prev => ({ ...prev, areas: true }));
    const CACHE_KEY = `cached_areas_${clienteId}`;
    let data: AreaDeTrabalho[] = [];
    
    try {
      // 1. Tentar carregar do cache local primeiro
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          data = JSON.parse(cachedData);
          setAreas(data);
          console.log('🔍 Areas loaded from cache for client', clienteId, ':', data.length, 'items');
        }
      } catch (cacheError) {
        console.error('❌ Error reading areas cache:', cacheError);
      }

      // 2. Se online, buscar dados atualizados do Supabase
      if (isOnline) {
        console.log('🔍 Loading areas from Supabase for client:', clienteId);
        
        const { data: supabaseData, error } = await supabase
          .from('area_de_trabalho')
          .select('*')
          .eq('cliente_id', clienteId)
          .order('nome_area');

        if (error) throw error;
        
        if (supabaseData) {
          console.log('📊 Areas loaded from Supabase:', supabaseData.length, 'items');
          data = supabaseData;
          setAreas(data);
          
          // Atualizar cache
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
            console.log('✅ Areas cached successfully');
          } catch (cacheError) {
            console.error('❌ Error caching areas:', cacheError);
          }
        }
      } else if (data.length === 0) {
        console.log('❌ Offline and no cached areas available for client:', clienteId);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
    } finally {
      setLoading(prev => ({ ...prev, areas: false }));
    }
  };

  const loadPontos = async (areaId: string) => {
    setLoading(prev => ({ ...prev, pontos: true }));
    const CACHE_KEY = `cached_pontos_${areaId}`;
    let data: PontoDeColeta[] = [];
    
    try {
      // 1. Tentar carregar do cache local primeiro
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          data = JSON.parse(cachedData);
          setPontos(data);
          console.log('🔍 Pontos loaded from cache for area', areaId, ':', data.length, 'items');
        }
      } catch (cacheError) {
        console.error('❌ Error reading pontos cache:', cacheError);
      }

      // 2. Se online, buscar dados atualizados do Supabase
      if (isOnline) {
        console.log('🔍 Loading pontos from Supabase for area:', areaId);
        
        const { data: supabaseData, error } = await supabase
          .from('ponto_de_coleta')
          .select('*')
          .eq('area_de_trabalho_id', areaId)
          .order('nome');

        if (error) throw error;
        
        if (supabaseData) {
          console.log('📊 Pontos loaded from Supabase:', supabaseData.length, 'items');
          data = supabaseData;
          setPontos(data);
          
          // Atualizar cache
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
            console.log('✅ Pontos cached successfully');
          } catch (cacheError) {
            console.error('❌ Error caching pontos:', cacheError);
          }
        }
      } else if (data.length === 0) {
        console.log('❌ Offline and no cached pontos available for area:', areaId);
      }
      
      // Load medições for today to mark completed points
      if (data.length > 0) {
        await loadMedicoesDeHoje(data.map(p => p.id));
      }
    } catch (error) {
      console.error('Error loading pontos:', error);
    } finally {
      setLoading(prev => ({ ...prev, pontos: false }));
    }
  };

  const loadMedicoesDeHoje = async (pontoIds: string[]) => {
    setLoading(prev => ({ ...prev, medicoes: true }));
    
    try {
      // Se offline, não tenta carregar medições
      if (!isOnline) {
        console.log('ℹ️ Offline: Skipping medições check');
        setPontosComMedicoes(new Set());
        return;
      }

      console.log('🔍 Loading medições for today...');
      
      const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('medicao')
        .select('ponto_de_coleta_id')
        .in('ponto_de_coleta_id', pontoIds)
        .gte('data_hora_medicao', hoje)
        .lt('data_hora_medicao', amanha);

      if (error) throw error;
      
      const pontosComMedicoesSet = new Set(data?.map(m => m.ponto_de_coleta_id) || []);
      setPontosComMedicoes(pontosComMedicoesSet);
      console.log('📊 Pontos with measurements today:', pontosComMedicoesSet.size);

    } catch (error) {
      console.error('Error loading medições:', error);
      // Se der erro, limpa o set para não mostrar informação incorreta
      setPontosComMedicoes(new Set());
    } finally {
      setLoading(prev => ({ ...prev, medicoes: false }));
    }
  };

  const handlePontoClick = (pontoId: string) => {
    if (selectedCliente && selectedArea) {
      saveSelectionState();
      
      navigate('/medicoes', {
        state: {
          clienteId: selectedCliente,
          areaId: selectedArea,
          pontoId: pontoId,
        },
      });
    }
  };

  const selectedClienteData = clientes.find(c => c.id === selectedCliente);
  const selectedAreaData = areas.find(a => a.id === selectedArea);

  return (
    <Layout title="Seleção de Local">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Selecione o Local para Medição
          </h2>
          {!isOnline && (
            <p className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 inline-flex items-center">
              📱 Modo Offline - Usando dados em cache
            </p>
          )}
         
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`flex items-center space-x-2 ${selectedCliente ? 'text-primary' : 'text-gray-400'}`}>
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-medium">Cliente</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center space-x-2 ${selectedArea ? 'text-primary' : 'text-gray-400'}`}>
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">Área</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center space-x-2 ${pontos.length > 0 ? 'text-primary' : 'text-gray-400'}`}>
            <Target className="h-4 w-4" />
            <span className="text-sm font-medium">Ponto</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Cliente Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-primary mb-3">
              1. Selecione o Cliente
            </label>
            
            {clientes.length === 0 && !loading.clientes && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-600">
                  Nenhum cliente disponível para seleção.
                </p>
              </div>
            )}
            
            {clientes.length === 1 ? (
              <div className="p-4 bg-accent/20 border border-secondary/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-primary">
                      {selectedClienteData?.razao_social || selectedClienteData?.id_name}
                    </p>
                    {selectedClienteData?.cidade && (
                      <p className="text-sm text-secondary">
                        {selectedClienteData.cidade} - {selectedClienteData.uf}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedCliente || ''}
                  onChange={(e) => setSelectedCliente(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white"
                  disabled={loading.clientes}
                >
                  <option value="">Selecione um cliente...</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.razao_social || cliente.id_name}
                      {cliente.cidade && ` - ${cliente.cidade}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Area Selection */}
          <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-opacity ${
            !selectedCliente ? 'opacity-50' : ''
          }`}>
            <label className="block text-sm font-medium text-primary mb-3">
              2. Selecione a Área de Trabalho
            </label>
            
            <div className="relative">
              <select
                value={selectedArea || ''}
                onChange={(e) => setSelectedArea(e.target.value || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white"
                disabled={!selectedCliente || loading.areas}
              >
                <option value="">
                  {loading.areas ? 'Carregando...' : 'Selecione uma área...'}
                </option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nome_area}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              {loading.areas && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
            </div>
            
            {selectedAreaData?.descricao && (
              <p className="mt-2 text-sm text-gray-600">
                {selectedAreaData.descricao}
              </p>
            )}
          </div>

          {/* Pontos List */}
          <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-opacity ${
            !selectedArea ? 'opacity-50' : ''
          }`}>
            <label className="block text-sm font-medium text-primary mb-3">
              3. Selecione um Ponto de Coleta
            </label>
            
            {loading.pontos || loading.medicoes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
                <span className="text-gray-600">Carregando pontos...</span>
              </div>
            ) : pontos.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">
                  {selectedArea ? 'Nenhum ponto de coleta encontrado para esta área' : 'Selecione uma área primeiro'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pontos.map((ponto) => {
                  const jaColetado = pontosComMedicoes.has(ponto.id);
                  
                  return (
                    <button
                      key={ponto.id}
                      onClick={() => handlePontoClick(ponto.id)}
                      disabled={!selectedArea}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:bg-accent/10 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="font-medium text-gray-900">{ponto.nome}</span>
                            {jaColetado && (
                              <div className="flex items-center space-x-1">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-xs text-green-600 font-medium">
                                  {isOnline ? 'Coletado hoje' : 'Há dados pendentes'}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {ponto.descricao && (
                            <p className="text-sm text-gray-600 mt-1 ml-7">
                              {ponto.descricao}
                            </p>
                          )}
                        </div>
                        
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  );
                })}
                
                <div className="mt-4 p-3 bg-accent/20 border border-secondary/30 rounded-lg">
                  <p className="text-sm text-primary">
                    💡 <strong>Dica:</strong> Pontos marcados com{' '}
                    <CheckCircle2 className="inline h-4 w-4 text-green-500 mx-1" />
                    {isOnline 
                      ? 'já possuem medições cadastradas para hoje.' 
                      : 'podem ter dados de medições pendentes.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};