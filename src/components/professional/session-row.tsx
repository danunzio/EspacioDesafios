'use client';

import { useState } from 'react';
import { Baby, Minus, Plus, History, Briefcase } from 'lucide-react';

interface SessionRowProps {
  childName: string;
  moduleType: string;
  commissionPercentage: number;
  sessionCount: number;
  previousMonthCount: number;
  onChange: (count: number) => void;
}

export function SessionRow({
  childName,
  moduleType,
  commissionPercentage,
  sessionCount,
  previousMonthCount,
  onChange,
}: SessionRowProps) {
  const [localValue, setLocalValue] = useState(() => sessionCount.toString());

  const handleChange = (value: string) => {
    // Allow empty string for better UX while typing
    if (value === '') {
      setLocalValue('');
      onChange(0);
      return;
    }

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setLocalValue(value);
      onChange(numValue);
    }
  };

  const handleIncrement = () => {
    const newValue = parseInt(localValue || '0', 10) + 1;
    setLocalValue(newValue.toString());
    onChange(newValue);
  };

  const handleDecrement = () => {
    const currentValue = parseInt(localValue || '0', 10);
    if (currentValue > 0) {
      const newValue = currentValue - 1;
      setLocalValue(newValue.toString());
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    // Ensure value is at least 0 on blur
    const numValue = parseInt(localValue || '0', 10);
    if (isNaN(numValue) || numValue < 0) {
      setLocalValue('0');
      onChange(0);
    } else {
      setLocalValue(numValue.toString());
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-[#A38EC3]/30 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-[#A38EC3]/10 flex items-center justify-center flex-shrink-0">
          <Baby className="text-[#A38EC3]" size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-[#2D2A32] truncate">{childName}</p>
          <div className="flex items-center gap-1 text-xs text-[#6B6570]">
            <Briefcase size={12} className="flex-shrink-0" />
            <span className="truncate">{moduleType} • {commissionPercentage}%</span>
          </div>
          {previousMonthCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-[#6B6570] mt-1">
              <History size={12} />
              <span>Mes anterior: {previousMonthCount} sesiones</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={sessionCount <= 0}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#A38EC3]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          aria-label="Disminuir sesiones"
        >
          <Minus size={16} className="text-[#6B6570]" />
        </button>

        <div className="relative">
          <input
            type="number"
            min="0"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className="w-16 text-center py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none font-semibold text-[#2D2A32]"
            aria-label={`Sesiones para ${childName} - ${moduleType}`}
          />
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#A38EC3]/20 flex items-center justify-center transition-colors"
          aria-label="Aumentar sesiones"
        >
          <Plus size={16} className="text-[#6B6570]" />
        </button>
      </div>
    </div>
  );
}
