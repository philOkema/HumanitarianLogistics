import { FC, ReactNode } from 'react';
import { InventoryItem } from '@shared/validation';

export interface InventoryContextType {
  items: InventoryItem[];
  addItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: FC<InventoryProviderProps>;
export declare const useInventory: () => InventoryContextType; 