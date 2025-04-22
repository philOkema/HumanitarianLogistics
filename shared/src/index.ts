// Re-export common dependencies
export * from 'firebase/app';
export * from 'firebase/auth';
export * from 'zod';

// Add your shared types, utilities, and components here
export interface User {
  id: string;
  email: string;
  name: string;
}

// Add more shared code as needed 