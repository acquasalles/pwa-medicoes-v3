import { supabase } from '../lib/supabase';

/**
 * Helper para verificar dados salvos no banco de dados
 */
export const verifyDatabaseData = async (medicaoId: string) => {
  try {
    console.log('🔍 Verificando dados no banco para medicão:', medicaoId);
    
    // Buscar a medição
    const { data: medicao, error: medicaoError } = await supabase
      .from('medicao')
      .select('*')
      .eq('id', medicaoId)
      .single();
      
    if (medicaoError) {
      console.error('❌ Erro ao buscar medição:', medicaoError);
      return { success: false, error: medicaoError };
    }
    
    console.log('📊 Medição encontrada:', medicao);
    
    // Buscar os itens da medição
    const { data: items, error: itemsError } = await supabase
      .from('medicao_items')
      .select('*')
      .eq('medicao_id', medicaoId);
      
    if (itemsError) {
      console.error('❌ Erro ao buscar itens:', itemsError);
      return { success: false, error: itemsError };
    }
    
    console.log('📋 Itens encontrados:', items);
    console.log('📊 Total de itens:', items?.length || 0);
    
    if (items && items.length > 0) {
      items.forEach((item, index) => {
        console.log(`📄 Item ${index + 1}:`, {
          id: item.id,
          parametro: item.parametro,
          valor: item.valor,
          tipo_medicao_id: item.tipo_medicao_id,
          tipo_medicao_nome: item.tipo_medicao_nome
        });
      });
    }
    
    return { 
      success: true, 
      medicao, 
      items: items || [],
      itemCount: items?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    return { success: false, error };
  }
};

/**
 * Helper para verificar usuário atual e permissões
 */
export const verifyUserPermissions = async () => {
  try {
    console.log('👤 Verificando usuário atual...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Erro ao obter usuário:', userError);
      return { success: false, error: userError };
    }
    
    console.log('👤 Usuário atual:', {
      id: user?.id,
      email: user?.email,
      created_at: user?.created_at
    });
    
    // Verificar associações do usuário
    const { data: clientUsers, error: clientUsersError } = await supabase
      .from('client_users')
      .select('*')
      .eq('user_id', user?.id);
      
    if (clientUsersError) {
      console.error('❌ Erro ao buscar associações:', clientUsersError);
      return { success: false, error: clientUsersError };
    }
    
    console.log('🏢 Associações do usuário:', clientUsers);
    
    return {
      success: true,
      user,
      clientAssociations: clientUsers || []
    };
    
  } catch (error) {
    console.error('❌ Erro na verificação de permissões:', error);
    return { success: false, error };
  }
};