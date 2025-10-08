import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useUserActionConfig } from '../hooks/useUserActionConfig';
import { useAuth } from '../contexts/AuthContext';
import {
  Loader2,
  Settings,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  X,
  Search,
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

interface UserActionLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_ip: string | null;
  action_type: string;
  action_data: any;
  error_data: any;
  browser_info: any;
  device_info: any;
  network_status: string | null;
  cliente_id: number | null;
  area_de_trabalho_id: string | null;
  ponto_de_coleta_id: string | null;
  tipo_medicao_id: string | null;
  tipo_medicao_nome: string | null;
  raw_value: string | null;
  processed_value: string | null;
  final_value: string | null;
  is_critical_type: boolean;
  created_at: string;
}

interface Filters {
  action_type: string;
  tipo_medicao_nome: string;
  user_email: string;
  start_date: string;
  end_date: string;
  is_critical_only: boolean;
  has_error: boolean;
}

export const UserActionLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { isEnabled, loading: configLoading, updating, updateConfig } = useUserActionConfig();

  const [logs, setLogs] = useState<UserActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    action_type: '',
    tipo_medicao_nome: '',
    user_email: '',
    start_date: '',
    end_date: '',
    is_critical_only: false,
    has_error: false,
  });
  const [stats, setStats] = useState({
    total: 0,
    errors: 0,
    critical: 0,
    success: 0,
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }
    fetchLogs();
    fetchStats();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('user_action_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters.action_type) {
        query = query.eq('action_type', filters.action_type);
      }
      if (filters.tipo_medicao_nome) {
        query = query.ilike('tipo_medicao_nome', `%${filters.tipo_medicao_nome}%`);
      }
      if (filters.user_email) {
        query = query.ilike('user_email', `%${filters.user_email}%`);
      }
      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }
      if (filters.is_critical_only) {
        query = query.eq('is_critical_type', true);
      }
      if (filters.has_error) {
        query = query.not('error_data', 'is', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching logs:', error);
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: totalCount } = await supabase
        .from('user_action_logs')
        .select('*', { count: 'exact', head: true });

      const { count: errorCount } = await supabase
        .from('user_action_logs')
        .select('*', { count: 'exact', head: true })
        .not('error_data', 'is', null);

      const { count: criticalCount } = await supabase
        .from('user_action_logs')
        .select('*', { count: 'exact', head: true })
        .eq('is_critical_type', true);

      const { count: successCount } = await supabase
        .from('user_action_logs')
        .select('*', { count: 'exact', head: true })
        .in('action_type', ['medicao_success', 'sync_item_insert'])
        .is('error_data', null);

      setStats({
        total: totalCount || 0,
        errors: errorCount || 0,
        critical: criticalCount || 0,
        success: successCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleToggleLogging = async () => {
    const success = await updateConfig(!isEnabled);
    if (success) {
      alert(`Logging ${!isEnabled ? 'habilitado' : 'desabilitado'} com sucesso!`);
    } else {
      alert('Erro ao atualizar configuração');
    }
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchLogs();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      action_type: '',
      tipo_medicao_nome: '',
      user_email: '',
      start_date: '',
      end_date: '',
      is_critical_only: false,
      has_error: false,
    });
  };

  const handleExportCSV = () => {
    const headers = [
      'Data/Hora',
      'Usuário',
      'IP',
      'Tipo Ação',
      'Tipo Medição',
      'Valor Raw',
      'Valor Processado',
      'Valor Final',
      'Status Rede',
      'Tem Erro',
      'Crítico',
    ];

    const rows = logs.map((log) => [
      formatDateTime(log.created_at),
      log.user_email || '',
      log.user_ip || '',
      log.action_type,
      log.tipo_medicao_nome || '',
      log.raw_value || '',
      log.processed_value || '',
      log.final_value || '',
      log.network_status || '',
      log.error_data ? 'Sim' : 'Não',
      log.is_critical_type ? 'Sim' : 'Não',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `user_action_logs_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionTypeColor = (actionType: string) => {
    if (actionType.includes('error')) return 'text-red-600 bg-red-50';
    if (actionType.includes('success')) return 'text-green-600 bg-green-50';
    if (actionType.includes('attempt')) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getActionTypeLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      medicao_attempt: 'Tentativa de Medição',
      medicao_success: 'Medição Sucesso',
      medicao_error: 'Erro na Medição',
      critical_medicao_type_log: 'Log Tipo Crítico',
      sync_attempt: 'Tentativa de Sync',
      sync_item_insert: 'Inserção de Item',
      photo_upload: 'Upload de Foto',
    };
    return labels[actionType] || actionType;
  };

  if (!isAdmin()) {
    return null;
  }

  return (
    <Layout title="Logs de Ações do Usuário" showBackButton onBack={() => navigate('/')}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-gray-900">Controle do Sistema</h2>
            </div>
            <button
              onClick={handleToggleLogging}
              disabled={updating || configLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isEnabled
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {updating ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Atualizando...</span>
                </span>
              ) : (
                <span>Logging {isEnabled ? 'Habilitado' : 'Desabilitado'}</span>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {isEnabled
              ? 'O sistema de logging está atualmente ativo e capturando ações dos usuários.'
              : 'O sistema de logging está desabilitado. Nenhuma ação será registrada.'}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total de Logs</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4">
            <p className="text-sm text-red-600 mb-1">Com Erros</p>
            <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-4">
            <p className="text-sm text-orange-600 mb-1">Tipos Críticos</p>
            <p className="text-2xl font-bold text-orange-600">{stats.critical}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4">
            <p className="text-sm text-green-600 mb-1">Sucessos</p>
            <p className="text-2xl font-bold text-green-600">{stats.success}</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  fetchLogs();
                  fetchStats();
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Atualizar</span>
              </button>
              <button
                onClick={handleExportCSV}
                disabled={logs.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Ação
                  </label>
                  <select
                    value={filters.action_type}
                    onChange={(e) => handleFilterChange('action_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Todos</option>
                    <option value="medicao_attempt">Tentativa de Medição</option>
                    <option value="medicao_success">Medição Sucesso</option>
                    <option value="medicao_error">Erro na Medição</option>
                    <option value="critical_medicao_type_log">Log Tipo Crítico</option>
                    <option value="sync_attempt">Tentativa de Sync</option>
                    <option value="sync_item_insert">Inserção de Item</option>
                    <option value="photo_upload">Upload de Foto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Medição
                  </label>
                  <input
                    type="text"
                    value={filters.tipo_medicao_nome}
                    onChange={(e) => handleFilterChange('tipo_medicao_nome', e.target.value)}
                    placeholder="Ex: PH, Cloro, Foto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email do Usuário
                  </label>
                  <input
                    type="text"
                    value={filters.user_email}
                    onChange={(e) => handleFilterChange('user_email', e.target.value)}
                    placeholder="usuario@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col justify-end space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.is_critical_only}
                      onChange={(e) => handleFilterChange('is_critical_only', e.target.checked)}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Apenas Tipos Críticos</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.has_error}
                      onChange={(e) => handleFilterChange('has_error', e.target.checked)}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Apenas com Erros</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-4">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Limpar Filtros
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logs List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Logs Recentes ({logs.length} de {stats.total})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum log encontrado</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getActionTypeColor(
                            log.action_type
                          )}`}
                        >
                          {getActionTypeLabel(log.action_type)}
                        </span>
                        {log.is_critical_type && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                            Crítico
                          </span>
                        )}
                        {log.error_data && (
                          <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                            <AlertCircle className="h-3 w-3" />
                            <span>Erro</span>
                          </span>
                        )}
                        {!log.error_data &&
                          (log.action_type.includes('success') ||
                            log.action_type === 'sync_item_insert') && (
                            <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              <CheckCircle className="h-3 w-3" />
                              <span>Sucesso</span>
                            </span>
                          )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Data/Hora:</span>
                          <p className="font-medium text-gray-900">
                            {formatDateTime(log.created_at)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Usuário:</span>
                          <p className="font-medium text-gray-900">{log.user_email || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">IP:</span>
                          <p className="font-medium text-gray-900">{log.user_ip || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Tipo Medição:</span>
                          <p className="font-medium text-gray-900">
                            {log.tipo_medicao_nome || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {expandedLog === log.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedLog === log.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      {log.tipo_medicao_nome && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Dados da Medição
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            {log.raw_value && (
                              <div>
                                <span className="text-gray-500">Valor Bruto:</span>
                                <p className="font-mono text-gray-900">{log.raw_value}</p>
                              </div>
                            )}
                            {log.processed_value && (
                              <div>
                                <span className="text-gray-500">Valor Processado:</span>
                                <p className="font-mono text-gray-900">{log.processed_value}</p>
                              </div>
                            )}
                            {log.final_value && (
                              <div>
                                <span className="text-gray-500">Valor Final:</span>
                                <p className="font-mono text-gray-900">{log.final_value}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {log.device_info && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Informações do Dispositivo
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Tipo:</span>
                              <p className="text-gray-900">{log.device_info.deviceType}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">SO:</span>
                              <p className="text-gray-900">{log.device_info.os}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Navegador:</span>
                              <p className="text-gray-900">{log.device_info.browser}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Status Rede:</span>
                              <p className="text-gray-900">{log.network_status}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {log.action_data && Object.keys(log.action_data).length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Dados da Ação</h4>
                          <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                            {JSON.stringify(log.action_data, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.error_data && (
                        <div className="bg-red-50 rounded-lg p-4">
                          <h4 className="font-medium text-red-900 mb-2">Dados do Erro</h4>
                          <pre className="text-xs bg-white p-3 rounded border border-red-200 overflow-x-auto text-red-900">
                            {JSON.stringify(log.error_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
