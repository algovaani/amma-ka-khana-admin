import apiClient from './client';

export type MealPackageSubtype = {
  key: string;
  label: string;
  price: number;
};

export type MealPackageComponent = {
  key: string;
  label: string;
  required?: boolean;
  fixedQuantity: number | null;
  allowMultiple?: boolean;
  minSelections: number;
  maxSelections: number;
  subtypes: MealPackageSubtype[];
};

export type MealPackageTab = {
  mealSlot: 'lunch' | 'dinner';
  label: string;
  isActive: boolean;
  sortOrder: number;
  subjiPrice?: number;
  serviceChargeAmount?: number;
  gstPercent?: number;
  components: MealPackageComponent[];
};

export const mealPackageApi = {
  getConfig: () =>
    apiClient.get('/admin/meal-package-config') as Promise<{
      data: { tabs: MealPackageTab[] };
    }>,

  updateConfig: (tabs: MealPackageTab[]) =>
    apiClient.patch('/admin/meal-package-config', { tabs }) as Promise<{
      data: { tabs: MealPackageTab[] };
    }>,
};
