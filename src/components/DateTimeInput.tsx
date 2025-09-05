import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DateTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
  placeholder?: string;
}

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  value,
  onChange,
  className = '',
  error,
  placeholder = 'dd/mm/aaaa hh:mm'
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  // Convert internal value (YYYY-MM-DDTHH:mm) to display format (dd/mm/yyyy hh:mm)
  useEffect(() => {
    if (value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          // Ajustar para GMT-3
          const gmt3Date = new Date(date.getTime() - (3 * 60 * 60 * 1000));
          const formatted = formatDateTimeForDisplay(gmt3Date);
          setDisplayValue(formatted);
          setIsValid(true);
        } else {
          setDisplayValue('');
          setIsValid(false);
        }
      } catch (error) {
        setDisplayValue('');
        setIsValid(false);
      }
    } else {
      setDisplayValue('');
      setIsValid(true);
    }
  }, [value]);

  const formatDateTimeForDisplay = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const parseDisplayValue = (displayValue: string): string | null => {
    // Remove espaços extras
    const cleaned = displayValue.trim();
    
    // Regex para dd/mm/yyyy hh:mm ou dd/mm/yyyy h:mm
    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})$/;
    const match = cleaned.match(regex);
    
    if (!match) return null;
    
    const [, day, month, year, hours, minutes] = match;
    
    // Validar ranges
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);
    const h = parseInt(hours);
    const min = parseInt(minutes);
    
    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100 || h < 0 || h > 23 || min < 0 || min > 59) {
      return null;
    }
    
    // Criar data em GMT-3
    const date = new Date(y, m - 1, d, h, min);
    
    if (isNaN(date.getTime())) return null;
    
    // Ajustar para GMT-3 (adicionar 3 horas para compensar)
    const gmt3Date = new Date(date.getTime() + (3 * 60 * 60 * 1000));
    
    // Retornar no formato YYYY-MM-DDTHH:mm
    return gmt3Date.toISOString().slice(0, 16);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplayValue = event.target.value;
    setDisplayValue(newDisplayValue);
    
    if (newDisplayValue.trim() === '') {
      setIsValid(true);
      onChange('');
      return;
    }
    
    const parsedValue = parseDisplayValue(newDisplayValue);
    
    if (parsedValue) {
      setIsValid(true);
      onChange(parsedValue);
    } else {
      setIsValid(false);
      // Não chama onChange para valores inválidos
    }
  };

  const handleNowClick = () => {
    const now = new Date();
    // Ajustar para GMT-3
    const gmt3Now = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    const isoString = gmt3Now.toISOString().slice(0, 16);
    onChange(isoString);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-20 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
            !isValid 
              ? 'border-red-300 bg-red-50' 
              : error 
              ? 'border-red-300' 
              : 'border-gray-300'
          } ${className}`}
        />
        
        {/* Icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
          <Calendar className="h-4 w-4 text-gray-400" />
          <Clock className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      {/* Now Button */}
      <button
        type="button"
        onClick={handleNowClick}
        className="absolute top-full mt-1 text-xs text-primary hover:text-primary-light transition-colors"
      >
        Usar data/hora atual
      </button>
      
      {/* Error Message */}
      {(error || !isValid) && (
        <p className="mt-1 text-sm text-red-600">
          {error || 'Formato inválido. Use: dd/mm/aaaa hh:mm'}
        </p>
      )}
      
      {/* Help Text */}
      {!error && isValid && (
        <p className="mt-1 text-xs text-gray-500">
          Formato: dd/mm/aaaa hh:mm (Fuso horário: GMT-3)
        </p>
      )}
    </div>
  );
};