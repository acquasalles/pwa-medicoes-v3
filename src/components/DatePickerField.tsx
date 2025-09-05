import React, { forwardRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import { format, parse, isValid } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePickerField.css';

// Registrar o locale pt-BR
registerLocale('pt-BR', ptBR);

interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

// Componente customizado para o input
const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, onChange, placeholder, error, className, disabled }, ref) => (
  <div className="relative">
    <input
      ref={ref}
      value={value}
      onClick={onClick}
      onChange={onChange}
      placeholder={placeholder}
      readOnly
      disabled={disabled}
      className={`w-full px-4 py-3 pr-20 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
        error 
          ? 'border-red-300 bg-red-50' 
          : 'border-gray-300'
      } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer'} ${className || ''}`}
    />
    <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1 pointer-events-none">
      <Calendar className="h-4 w-4 text-gray-400" />
      <Clock className="h-4 w-4 text-gray-400" />
    </div>
  </div>
));

CustomInput.displayName = 'CustomInput';

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  value,
  onChange,
  placeholder = 'dd/mm/aaaa hh:mm',
  error,
  className,
  disabled = false,
}) => {
  // Logging para debug de timezone
  const logTimezone = (label: string, date: Date | string | null, extra?: any) => {
    console.log(`🕐 [DatePicker ${label}]`, {
      input: date,
      type: typeof date,
      isDate: date instanceof Date,
      asString: date?.toString(),
      localString: date instanceof Date ? date.toLocaleString('pt-BR') : 'N/A',
      extra
    });
  };

  // Converter string para Date - INTERPRETAR COMO GMT-3
  const parseValue = (dateString: string): Date | null => {
    logTimezone('parseValue - INPUT', dateString);
    
    if (!dateString) return null;
    
    try {
      // Se for formato ISO (YYYY-MM-DDTHH:mm) - tratar como GMT-3
      if (dateString.includes('T')) {
        // Adicionar offset GMT-3 para que seja interpretado corretamente
        const dateWithOffset = dateString + '-03:00';
        const localDate = new Date(dateWithOffset);
        logTimezone('parseValue - ISO parsed as GMT-3', localDate, { dateWithOffset });
        
        return localDate;
      }
      
      // Se for formato brasileiro (dd/mm/yyyy hh:mm)
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)) {
        const parsed = parse(dateString, 'dd/MM/yyyy HH:mm', new Date());
        logTimezone('parseValue - Brazilian format parsed', parsed);
        return isValid(parsed) ? parsed : null;
      }
      
      return null;
    } catch (error) {
      console.error('🚨 [DatePicker parseValue ERROR]', error);
      return null;
    }
  };

  // Converter Date para string no formato ISO - EXTRAINDO HORÁRIO LOCAL
  const formatValue = (date: Date | null): string => {
    logTimezone('formatValue - INPUT', date);
    
    if (!date) return '';
    
    try {
      // Formatar usando os valores locais da data
      const isoString = format(date, "yyyy-MM-dd'T'HH:mm");
      
      logTimezone('formatValue - OUTPUT', date, { isoString });
      
      return isoString;
    } catch (error) {
      console.error('🚨 [DatePicker formatValue ERROR]', error);
      return '';
    }
  };

  // Formatar para exibição em pt-BR
  const formatDisplayValue = (date: Date | null): string => {
    logTimezone('formatDisplayValue - INPUT', date);
    
    if (!date) return '';
    
    try {
      const displayString = format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
      
      logTimezone('formatDisplayValue - OUTPUT', date, { displayString });
      
      return displayString;
    } catch (error) {
      console.error('🚨 [DatePicker formatDisplayValue ERROR]', error);
      return '';
    }
  };

  // Obter data atual do sistema
  const getCurrentBrazilianTime = (): Date => {
    const now = new Date();
    logTimezone('getCurrentBrazilianTime', now);
    
    return now;
  };

  const selectedDate = parseValue(value);
  const displayValue = formatDisplayValue(selectedDate);
  
  logTimezone('COMPONENT STATE', selectedDate, { 
    value, 
    displayValue,
    selectedDate 
  });

  const handleDateChange = (date: Date | null) => {
    logTimezone('handleDateChange - INPUT', date);
    const formattedValue = formatValue(date);
    console.log('🔄 [DatePicker] handleDateChange calling onChange with:', formattedValue);
    onChange(formattedValue);
  };

  const handleUseCurrentTime = () => {
    console.log('⏰ [DatePicker] Using current Brazilian time...');
    const currentBrTime = getCurrentBrazilianTime();
    handleDateChange(currentBrTime);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="dd/MM/yyyy HH:mm"
          locale="pt-BR"
          placeholderText={placeholder}
          disabled={disabled}
          customInput={
            <CustomInput 
              error={error}
              className={className}
              placeholder={placeholder}
              disabled={disabled}
            />
          }
          popperClassName="date-picker-popper"
          calendarClassName="date-picker-calendar"
        />
      </div>

      {/* Button to use current time */}
      <button
        type="button"
        onClick={handleUseCurrentTime}
        className="text-sm text-primary hover:text-primary-light transition-colors flex items-center space-x-1"
      >
        <Clock className="w-3 h-3" />
        <span>Usar data e hora atual (GMT-3)</span>
      </button>

      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2">
          <div><strong>Debug Info:</strong></div>
          <div>Input value: {value}</div>
          <div>Display value: {displayValue}</div>
          <div>Selected date: {selectedDate?.toString() || 'null'}</div>
          <div>Current BR time: {getCurrentBrazilianTime().toLocaleString('pt-BR')}</div>
        </div>
      )}
    </div>
  );
};