import React, { useState, useEffect } from 'react';
import { MealType, Recipe, HistoricalRecipe } from '../types';
import { SparklesIcon, StarIcon, TrashIcon, HistoryIcon, ChevronLeftIcon, BookOpenIcon } from './icons';
import Spinner from './Spinner';
import { useTranslation } from '../hooks/useTranslation';

interface MealPlannerProps {
  recipe: Recipe | null;
  setRecipe: (recipe: Recipe | null) => void;
  onGenerate: (mealType: MealType, servings: number) => void;
  isLoading: boolean;
  mealType: MealType;
  setMealType: (type: MealType) => void;
  servings: number;
  setServings: (num: number) => void;
  mealHistory: HistoricalRecipe[];
  onToggleFavorite: (id: string) => void;
  onDeleteFromHistory: (id: string) => void;
}

const MealCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white p-6 rounded-2xl shadow-2xl animate-fade-in space-y-4 border-t-4 border-rose-400">
        <h3 className="text-2xl font-bold text-rose-900">{recipe.recipeName}</h3>
        <p className="text-slate-600 italic">{recipe.description}</p>
        
        <div>
            <h4 className="font-semibold text-lg text-rose-800 mb-2">{t('recipe.ingredients')}</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
            {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>
        </div>

        <div>
            <h4 className="font-semibold text-lg text-rose-800 mb-2">{t('recipe.instructions')}</h4>
            <ol className="list-decimal list-inside space-y-2 text-slate-700">
            {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
        </div>
        </div>
    );
};

const TabButton: React.FC<{Icon: React.FC<{className?: string}>, label: string, isActive: boolean, onClick: () => void}> = ({ Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
        isActive
            ? 'border-b-2 border-rose-500 text-rose-600'
            : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
        }`}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </button>
);


const MealPlanner: React.FC<MealPlannerProps> = ({ 
  recipe, setRecipe, onGenerate, isLoading, mealType, setMealType, 
  servings, setServings, mealHistory, onToggleFavorite, onDeleteFromHistory 
}) => {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'suggestion' | 'history'>('suggestion');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'favorites'>('all');
  const [viewingRecipe, setViewingRecipe] = useState<HistoricalRecipe | null>(null);

  const handleGenerateClick = () => {
    setViewingRecipe(null);
    setRecipe(null);
    onGenerate(mealType, servings);
  }

  const handleViewRecipe = (histRecipe: HistoricalRecipe) => {
    setViewingRecipe(histRecipe);
    setRecipe(histRecipe);
    setActiveTab('suggestion');
  }

  const handleBackToHistory = () => {
    setViewingRecipe(null);
    setRecipe(null);
    setActiveTab('history');
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('history.delete_confirm'))) {
      onDeleteFromHistory(id);
    }
  }

  const handleToggleFavoriteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(id);
  }

  const filteredHistory = mealHistory.filter(item => 
    historyFilter === 'favorites' ? item.isFavorite : true
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return t('history.generated_on').replace('{date}', date.toLocaleDateString(language, {
        year: 'numeric', month: 'long', day: 'numeric'
    }));
  }

  useEffect(() => {
    if (recipe && !viewingRecipe) {
      setActiveTab('suggestion');
    }
  }, [recipe, viewingRecipe]);

  return (
    <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-2xl shadow-lg border border-white/50 h-full flex flex-col">
      <div className="flex border-b border-slate-200 mb-4 items-center">
        <TabButton Icon={SparklesIcon} label={t('planner.tab_suggestion')} isActive={activeTab === 'suggestion'} onClick={() => { setActiveTab('suggestion'); setViewingRecipe(null); setRecipe(null); }} />
        <TabButton Icon={HistoryIcon} label={t('planner.tab_history')} isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        {viewingRecipe && activeTab === 'suggestion' && (
          <button onClick={handleBackToHistory} className="ml-auto flex items-center gap-1 px-3 py-1 text-sm font-semibold text-rose-600 hover:bg-rose-100 rounded-md transition-colors">
            <ChevronLeftIcon /> {t('history.back_button')}
          </button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto pr-2">
        {activeTab === 'suggestion' && (
          <>
            {!viewingRecipe && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="mealType" className="block text-sm font-medium text-slate-700 mb-1">{t('planner.meal_type_label')}</label>
                  <select id="mealType" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500">
                    {Object.values(MealType).map(type => <option key={type} value={type}>{t(`meal_type.${type}`)}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="servings" className="block text-sm font-medium text-slate-700 mb-1">{t('planner.servings_label')}</label>
                  <input type="number" id="servings" value={servings} onChange={(e) => setServings(Math.max(1, parseInt(e.target.value, 10)))} min="1" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" />
                </div>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-full text-slate-600">
                <Spinner color="rose-500" />
                <p className="mt-4">{t('planner.loading_state')}</p>
              </div>
            ) : recipe ? (
              <MealCard recipe={recipe} />
            ) : (
              <div className="flex flex-col justify-center items-center h-full text-center text-rose-800 bg-rose-50/70 rounded-lg p-4">
                <SparklesIcon className="w-16 h-16 text-rose-300 mb-4"/>
                <p className="font-bold">{t('planner.empty_state')}</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setHistoryFilter('all')} className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${historyFilter === 'all' ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>{t('history.filter_all')}</button>
              <button onClick={() => setHistoryFilter('favorites')} className={`flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold transition-colors ${historyFilter === 'favorites' ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}><StarIcon className="w-4 h-4" filled={historyFilter === 'favorites'} />{t('history.filter_favorites')}</button>
            </div>
            
            {filteredHistory.length > 0 ? (
              <ul className="space-y-3">
                {filteredHistory.map(item => (
                  <li key={item.id} onClick={() => handleViewRecipe(item)} className="bg-white/80 p-4 rounded-xl shadow-sm hover:shadow-lg hover:bg-white cursor-pointer transition-all group flex items-center gap-4">
                    <div className="flex-grow">
                      <p className="font-bold text-slate-800">{item.recipeName}</p>
                      <p className="text-xs text-slate-500">{formatDate(item.generatedAt)}</p>
                    </div>
                    <button onClick={(e) => handleToggleFavoriteClick(item.id, e)} className="p-2 rounded-full text-slate-400 hover:bg-amber-100 hover:text-amber-500 transition-colors">
                      <StarIcon filled={item.isFavorite} className={item.isFavorite ? 'text-amber-400' : ''} />
                    </button>
                    <button onClick={(e) => handleDelete(item.id, e)} className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors">
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col justify-center items-center h-full text-center text-rose-800 bg-rose-50/70 rounded-lg p-10">
                <BookOpenIcon className="w-16 h-16 text-rose-300 mb-4"/>
                <p className="font-bold">{t('history.empty_state')}</p>
                <p className="text-sm mt-1">{t('history.empty_state_prompt')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {activeTab === 'suggestion' && !viewingRecipe && (
        <div className="mt-6">
          <button onClick={handleGenerateClick} disabled={isLoading} className="w-full bg-rose-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center hover:bg-rose-600 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-rose-500/40 disabled:bg-rose-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
            <SparklesIcon className="w-5 h-5 me-2" />
            <span>{t('planner.generate_button')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;