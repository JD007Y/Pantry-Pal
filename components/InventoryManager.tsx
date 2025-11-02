import React, { useRef, useState } from 'react';
import { CameraIcon, TrashIcon, DownloadIcon, UploadIcon, PhotoIcon } from './icons';
import Spinner from './Spinner';
import { useTranslation } from '../hooks/useTranslation';

interface InventoryManagerProps {
  inventory: string[];
  onAddItem: (item: string) => void;
  onRemoveItem: (itemToRemove: string) => void;
  onAnalyzeImage: (file: File) => Promise<void>;
  onImport: (file: File) => void;
  onExport: () => void;
  isLoading: boolean;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ inventory, onAddItem, onRemoveItem, onAnalyzeImage, onImport, onExport, isLoading }) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [manualItem, setManualItem] = useState('');
  const { t } = useTranslation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAnalyzeImage(file);
    }
    if(event.target) event.target.value = '';
  };
  
  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
    if(event.target) event.target.value = '';
  }

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualItem.trim()) {
      onAddItem(manualItem.trim());
      setManualItem('');
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-2xl shadow-lg border border-white/50 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('inventory.title')}</h2>
      
      <form onSubmit={handleManualAdd} className="flex gap-2 mb-4">
        <input 
          type="text"
          value={manualItem}
          onChange={(e) => setManualItem(e.target.value)}
          placeholder={t('inventory.add_item_placeholder')}
          className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
        <button type="submit" className="bg-slate-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">{t('inventory.add_item_button')}</button>
      </form>

      <div className="flex-grow overflow-y-auto pr-2 mb-4">
        {inventory.length === 0 && !isLoading ? (
          <div className="text-center text-emerald-800 bg-emerald-50/70 p-10 rounded-lg h-full flex flex-col justify-center items-center">
            <PhotoIcon className="w-16 h-16 text-emerald-300 mb-4" />
            <p className="font-bold">{t('inventory.empty_state')}</p>
            <p className="text-sm mt-1">{t('inventory.empty_state_prompt')}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {inventory.map((item, index) => (
              <li key={`${item}-${index}`} className="flex justify-between items-center bg-emerald-50/70 p-3 rounded-lg animate-fade-in">
                <span className="text-slate-700 capitalize font-medium">{item}</span>
                <button 
                  onClick={() => onRemoveItem(item)}
                  className="p-1 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${item}`}
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
         {isLoading && (
          <div className="flex justify-center items-center p-4">
              <Spinner color="emerald-500"/>
              <span className="ml-2 text-slate-600">{t('inventory.analyzing_image')}</span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200 space-y-2">
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          capture="environment"
        />
         <input
          type="file"
          ref={photoInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
         <input
          type="file"
          ref={importFileRef}
          onChange={handleImportFileChange}
          className="hidden"
          accept=".json"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
           <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={isLoading}
              className="w-full bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30 disabled:bg-emerald-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              <CameraIcon className="w-5 h-5 me-2" />
              <span>{t('inventory.add_from_camera')}</span>
            </button>
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={isLoading}
              className="w-full bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30 disabled:bg-emerald-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              <PhotoIcon className="w-5 h-5 me-2" />
              <span>{t('inventory.add_from_photo')}</span>
            </button>
        </div>
       
        <div className="flex gap-2">
            <button
              onClick={() => importFileRef.current?.click()}
              className="w-full bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-xl flex items-center justify-center hover:bg-slate-300 transition-colors text-sm"
            >
              <UploadIcon className="me-2"/> {t('inventory.import')}
            </button>
             <button
              onClick={onExport}
              className="w-full bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-xl flex items-center justify-center hover:bg-slate-300 transition-colors text-sm"
            >
              <DownloadIcon className="me-2"/> {t('inventory.export')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;