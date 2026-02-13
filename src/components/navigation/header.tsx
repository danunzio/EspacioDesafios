'use client';

import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function Header({ title, showBack = false, onBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-16 bg-white shadow-sm">
      <div className="flex items-center justify-between h-full px-4">
        <div className="w-16 flex items-center">
          {showBack ? (
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          ) : (
            <div className="flex items-center gap-2 text-lg font-bold text-primary">
              <span>🧩</span>
              <span className="hidden sm:inline">ED</span>
            </div>
          )}
        </div>

        <h1 className="flex-1 text-center text-lg font-semibold truncate">
          {title}
        </h1>

        <div className="w-16" />
      </div>
    </header>
  );
}
