import { FC, ReactNode } from 'react';
import { AidRequest } from '@shared/validation';

export interface AidRequestContextType {
  requests: AidRequest[];
  createRequest: (request: Omit<AidRequest, 'id'>) => Promise<void>;
  updateRequest: (id: string, request: Partial<AidRequest>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
}

export interface AidRequestProviderProps {
  children: ReactNode;
}

export declare const AidRequestProvider: React.FC<AidRequestProviderProps>;
export declare const useAidRequest: () => AidRequestContextType; 