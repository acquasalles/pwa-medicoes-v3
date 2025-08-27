import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Config Check:');
console.log('  - URL:', supabaseUrl ? '✅ Configured' : '❌ Missing');
console.log('  - Anon Key:', supabaseAnonKey ? '✅ Configured' : '❌ Missing');

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is missing from environment variables');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is missing from environment variables');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('💥 Missing critical Supabase environment variables');
  throw new Error('❌ Missing Supabase environment variables. Please connect to Supabase using the button in the top right.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

console.log('✅ Supabase client initialized successfully');

// Database types
export interface Cliente {
  id: number;
  cnpj_cpf?: string;
  id_name?: string;
  razao_social?: string;
  nome_bairro?: string;
  cidade?: string;
  uf?: string;
  endereco?: string;
  bairro?: string;
  cep?: string;
  tem_contrato?: boolean;
}

export interface AreaDeTrabalho {
  id: string;
  cliente_id: number;
  nome_area: string;
  localizacao?: any;
  descricao?: string;
  observacao?: string;
  created_at: string;
}

export interface PontoDeColeta {
  id: string;
  cliente_id: number;
  area_de_trabalho_id: string;
  nome: string;
  localizacao?: any;
  descricao?: string;
  created_at: string;
  tipos_medicao?: string[];
}

export interface TipoMedicao {
  id: string;
  nome?: string;
  tipo?: string;
  range?: any;
  input_type?: 'number' | 'photo' | 'text' | 'textarea' | 'select';
  decimal_places?: number;
  unit?: string;
  options?: any;
  validation_rules?: any;
  created_at: string;
}

export interface Medicao {
  id: string;
  ponto_de_coleta_id: string;
  data_hora_medicao: string;
  cliente_id: number;
  area_de_trabalho_id?: string;
  created_at: string;
}

export interface MedicaoItem {
  id: string;
  medicao_id: string;
  parametro?: string;
  valor: number;
  tipo_medicao_id: string;
  tipo_medicao_nome?: string;
  image?: string;
  created_at?: string;
}
