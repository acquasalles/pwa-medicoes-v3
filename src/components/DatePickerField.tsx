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
  // Converter string para Date
  const parseValue = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    try {
      // Se for formato ISO (YYYY-MM-DDTHH:mm)
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        return isValid(date) ? date : null;
      }
      
      // Se for formato brasileiro (dd/mm/yyyy hh:mm)
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)) {
        const parsed = parse(dateString, 'dd/MM/yyyy HH:mm', new Date());
        return isValid(parsed) ? parsed : null;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  // Converter Date para string no formato ISO para o backend
  const formatValue = (date: Date | null): string => {
    if (!date) return '';
    
    try {
      // Ajustar para GMT-3 (fuso de Brasília)
      const utcDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));
      return format(utcDate, "yyyy-MM-dd'T'HH:mm");
    } catch (error) {
      return '';
    }
  };

  // Formatar para exibição em pt-BR
  const formatDisplayValue = (date: Date | null): string => {
    if (!date) return '';
    
    try {
      return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
      return '';
    }
  };

  const selectedDate = parseValue(value);
  const displayValue = formatDisplayValue(selectedDate);

  const handleDateChange = (date: Date | null) => {
    const formattedValue = formatValue(date);
    onChange(formattedValue);
  };

  const handleUseNow = () => {
    const now = new Date();
    handleDateChange(now);
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

      {/* Botão para usar data/hora atual */}
      <button
        type="button"
        onClick={handleUseNow}
        disabled={disabled}
        className="text-sm text-primary hover:text-primary-light disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        📅 Usar data e hora atual
      </button>

      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}

      {/* Informação sobre fuso horário */}
      <p className="text-xs text-gray-500">
        Fuso horário: GMT-3 (Brasília) • Formato: dd/mm/aaaa hh:mm
      </p>
    </div>
  );
};