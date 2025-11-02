import React, { useState, useCallback, useEffect } from 'react';
import { analyzeImageForIngredients, generateRecipe } from './services/geminiService';
import { Recipe, MealType, HistoricalRecipe } from './types';
import InventoryManager from './components/InventoryManager';
import MealPlanner from './components/MealPlanner';
import { useTranslation } from './hooks/useTranslation';
import LanguageSwitcher from './components/LanguageSwitcher';

const App: React.FC = () => {
  const { language, t } = useTranslation();

  const [inventory, setInventory] = useState<string[]>(() => {
    try {
      const savedInventory = localStorage.getItem('pantryInventory');
      return savedInventory ? JSON.parse(savedInventory) : [];
    } catch (error) {
      console.error("Failed to parse inventory from localStorage", error);
      return [];
    }
  });

  const [mealHistory, setMealHistory] = useState<HistoricalRecipe[]>(() => {
    try {
      const savedHistory = localStorage.getItem('pantryPalMealHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Failed to parse meal history from localStorage", error);
      return [];
    }
  });


  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mealType, setMealType] = useState<MealType>(MealType.Dinner);
  const [servings, setServings] = useState<number>(2);

  useEffect(() => {
    try {
      localStorage.setItem('pantryInventory', JSON.stringify(inventory));
    } catch (error) {
      console.error("Failed to save inventory to localStorage", error);
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('pantryPalMealHistory', JSON.stringify(mealHistory));
    } catch (error) {
      console.error("Failed to save meal history to localStorage", error);
    }
  }, [mealHistory]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
  }, [language]);


  const handleAnalyzeImage = useCallback(async (file: File) => {
    setIsLoadingInventory(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64String = (reader.result as string).split(',')[1];
          const newItems = await analyzeImageForIngredients(base64String, file.type, language);
          if (newItems.length > 0) {
            setInventory(prev => {
              const combined = [...prev, ...newItems];
              return [...new Set(combined)]; // Remove duplicates
            });
          } else {
            setError("Could not identify any new ingredients from the image.");
          }
        } catch (e: any) {
           setError(e.message || 'An unknown error occurred during image analysis.');
        } finally {
            setIsLoadingInventory(false);
        }
      };
      reader.onerror = () => {
         setError('Failed to read the image file.');
         setIsLoadingInventory(false);
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
      setIsLoadingInventory(false);
    }
  }, [language]);

  const handleRemoveItem = useCallback((itemToRemove: string) => {
    setInventory(prev => prev.filter(item => item !== itemToRemove));
  }, []);
  
  const handleAddItem = useCallback((item: string) => {
      setInventory(prev => {
        const newItem = item.toLowerCase();
        if (prev.includes(newItem)) return prev;
        return [...prev, newItem];
      });
  }, []);

  const handleGenerateRecipe = useCallback(async (mealType: MealType, servings: number) => {
    if (inventory.length === 0) {
      setError("Please add items to your pantry first.");
      return;
    }
    setIsLoadingRecipe(true);
    setError(null);
    setRecipe(null);
    try {
      const newRecipe = await generateRecipe(inventory, mealType, servings, language);
      setRecipe(newRecipe);
      const historicalEntry: HistoricalRecipe = {
        ...newRecipe,
        id: new Date().toISOString(),
        generatedAt: new Date().toISOString(),
        isFavorite: false,
      };
      setMealHistory(prev => [historicalEntry, ...prev]);
    } catch (e: any)
    {
      setError(e.message || 'Failed to generate recipe.');
    } finally {
      setIsLoadingRecipe(false);
    }
  }, [inventory, language]);

  const handleToggleFavorite = useCallback((id: string) => {
    setMealHistory(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  }, []);

  const handleDeleteFromHistory = useCallback((id: string) => {
    setMealHistory(prev => prev.filter(item => item.id !== id));
  }, []);


  const handleExport = () => {
    if(inventory.length === 0) {
      setError("Your pantry is empty. Nothing to export.");
      return;
    }
    const blob = new Blob([JSON.stringify(inventory, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pantry-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File is not valid text");
        const importedInventory = JSON.parse(text);
        if (Array.isArray(importedInventory) && importedInventory.every(i => typeof i === 'string')) {
          setInventory([...new Set(importedInventory.map(i => i.toLowerCase()))]);
        } else {
          throw new Error("JSON is not a valid inventory array.");
        }
      } catch (err: any) {
        setError(`Failed to import file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  }
  
  return (
    <div className="min-h-screen font-sans">
      <header className="bg-white/80 backdrop-blur-2xl shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {t('header.title')} 🥦
            </h1>
            <p className="text-slate-600 mt-1">{t('header.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-lg relative mb-6 shadow-lg shadow-red-500/20" role="alert">
                <p className="font-bold">{t('error.oops')}</p>
                <p>{error}</p>
                <button className="absolute top-0 bottom-0 end-0 px-4 py-3" onClick={() => setError(null)} aria-label={t('error.close_button_title')}>
                    <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>{t('error.close_button_title')}</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:min-h-[calc(100vh-180px)]">
            <InventoryManager 
              inventory={inventory} 
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onAnalyzeImage={handleAnalyzeImage}
              onImport={handleImport}
              onExport={handleExport}
              isLoading={isLoadingInventory}
            />
          </div>
          <div className="lg:min-h-[calc(100vh-180px)]">
            <MealPlanner 
              recipe={recipe} 
              setRecipe={setRecipe}
              onGenerate={handleGenerateRecipe}
              isLoading={isLoadingRecipe}
              mealType={mealType}
              setMealType={setMealType}
              servings={servings}
              setServings={setServings}
              mealHistory={mealHistory}
              onToggleFavorite={handleToggleFavorite}
              onDeleteFromHistory={handleDeleteFromHistory}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;