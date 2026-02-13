'use client';

import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  isAdmin?: boolean;
}

export function Header({ title, showBack = false, onBack, isAdmin = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-14 sm:h-16 bg-white shadow-sm">
      <div className="flex items-center h-full px-4 relative">
        {/* Left section - Logo or Back button */}
        <div className="w-12 flex items-center justify-start">
          {showBack ? (
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          ) : (
            <div className="flex items-center">
              {/* Usar img nativo para evitar hydration mismatch */}
              <img
                src="/logo.jpg"
                alt="Espacio Desafíos"
                width={36}
                height={36}
                className="rounded-lg object-cover w-9 h-9"
              />
            </div>
          )}
        </div>

        {/* Center section - Title */}
        <div className="flex-1 flex items-center justify-center absolute left-0 right-0 pointer-events-none">
          <h1 className="text-base sm:text-lg font-semibold text-center truncate px-14 max-w-full">
            {title}
          </h1>
        </div>

        {/* Right section - Empty space for balance */}
        <div className="w-12" />
      </div>
    </header>
  );
}
