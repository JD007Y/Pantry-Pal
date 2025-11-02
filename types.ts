

export interface Recipe {
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

export interface HistoricalRecipe extends Recipe {
  id: string;
  generatedAt: string;
  isFavorite: boolean;
}

export enum MealType {
  Breakfast = "Breakfast",
  Lunch = "Lunch",
  Dinner = "Dinner",
  Snack = "Snack",
}

export type Language = 'en' | 'fr' | 'de' | 'he';

export const Languages: { code: Language, name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'he', name: 'עברית' },
];