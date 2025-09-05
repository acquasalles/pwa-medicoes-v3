// Utilitários de formatação para pt-BR
export const TIMEZONE = 'America/Sao_Paulo'; // GMT-3

/**
 * Formata data para exibição em português brasileiro
 */
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleDateString('pt-BR', defaultOptions);
};

/**
 * Formata data e hora para exibição em português brasileiro
 */
export const formatDateTime = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Formato 24h
    ...options
  };
  
  return dateObj.toLocaleDateString('pt-BR', defaultOptions);
};

/**
 * Formata apenas a hora
 */
export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString('pt-BR', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Converte data atual para formato datetime-local do HTML
 */
export const toLocalDateTimeString = (date?: Date): string => {
  const now = date || new Date();
  
  // Formato YYYY-MM-DDTHH:mm usando os valores locais
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  const result = `${year}-${month}-${day}T${hours}:${minutes}`;
  console.log('🕐 [formatters] toLocalDateTimeString:', {
    input: now.toString(),
    output: result
  });
  
  return result;
};

export const fromLocalDateTimeString = (dateTimeString: string): Date => {
  const localDate = new Date(dateTimeString);
  return localDate;
};

/**
 * Formata número no padrão brasileiro
 */
export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    locale: 'pt-BR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  };
  
  return value.toLocaleString('pt-BR', defaultOptions);
};

/**
 * Formata valor com unidade
 */
export const formatValueWithUnit = (value: number, unit?: string, decimalPlaces?: number): string => {
  const formattedValue = formatNumber(value, {
    minimumFractionDigits: decimalPlaces || 0,
    maximumFractionDigits: decimalPlaces || 2
  });
  
  return unit ? `${formattedValue} ${unit}` : formattedValue;
};

/**
 * Formata data relativa (ex: "há 2 horas", "ontem")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'agora há pouco';
  }
  
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `há ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }
  
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `há ${hours} hora${hours !== 1 ? 's' : ''}`;
  }
  
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    if (days === 1) return 'ontem';
    return `há ${days} dias`;
  }
  
  // Mais de uma semana, mostrar data
  return formatDate(dateObj);
};

/**
 * Verifica se uma data é hoje
 */
export const isToday = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.toLocaleDateString('pt-BR', { timeZone: TIMEZONE }) === 
         today.toLocaleDateString('pt-BR', { timeZone: TIMEZONE });
};

/**
 * Normaliza input numérico (converte vírgula para ponto)
 */
export const normalizeNumberInput = (value: string): string => {
  return value.replace(',', '.');
};

/**
 * Formata número para exibição (ponto para vírgula)
 */
export const formatNumberForDisplay = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '';
  
  return numValue.toString().replace('.', ',');
};

/**
 * Obter data atual no fuso GMT-3
 */
export const getCurrentDateTime = (): Date => {
  const now = new Date();
  // Ajustar para GMT-3
  return new Date(now.getTime() - (3 * 60 * 60 * 1000));
};