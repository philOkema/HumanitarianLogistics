import { FC, ReactNode } from 'react';
import { Distribution } from '@shared/validation';

export interface DistributionContextType {
  distributions: Distribution[];
  createDistribution: (distribution: Omit<Distribution, 'id'>) => Promise<void>;
  updateDistribution: (id: string, distribution: Partial<Distribution>) => Promise<void>;
  deleteDistribution: (id: string) => Promise<void>;
}

export interface DistributionProviderProps {
  children: ReactNode;
}

export const DistributionProvider: FC<DistributionProviderProps>;
export declare const useDistribution: () => DistributionContextType; 