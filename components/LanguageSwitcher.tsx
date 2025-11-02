import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Languages, Language } from '../types';
import { LanguageIcon } from './icons';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center p-2 rounded-full text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors"
        aria-label="Change language"
      >
        <LanguageIcon className="w-6 h-6" />
      </button>
      {isOpen && (
        <div className="absolute end-0 mt-2 w-40 bg-white rounded-lg shadow-xl z-20">
          <ul className="py-1">
            {Languages.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full text-start px-4 py-2 text-sm ${
                    language === lang.code
                      ? 'font-bold text-rose-600 bg-rose-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {lang.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;