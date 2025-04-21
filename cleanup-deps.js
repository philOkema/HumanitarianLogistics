import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dependencies to remove (based on depcheck results)
const depsToRemove = [
  // Unused UI components
  '@radix-ui/react-accordion',
  '@radix-ui/react-alert-dialog',
  '@radix-ui/react-aspect-ratio',
  '@radix-ui/react-avatar',
  '@radix-ui/react-checkbox',
  '@radix-ui/react-collapsible',
  '@radix-ui/react-context-menu',
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-hover-card',
  '@radix-ui/react-label',
  '@radix-ui/react-menubar',
  '@radix-ui/react-navigation-menu',
  '@radix-ui/react-popover',
  '@radix-ui/react-progress',
  '@radix-ui/react-radio-group',
  '@radix-ui/react-scroll-area',
  '@radix-ui/react-select',
  '@radix-ui/react-separator',
  '@radix-ui/react-slider',
  '@radix-ui/react-slot',
  '@radix-ui/react-switch',
  '@radix-ui/react-tabs',
  '@radix-ui/react-toast',
  '@radix-ui/react-toggle',
  '@radix-ui/react-toggle-group',
  '@radix-ui/react-tooltip',
  
  // Unused utilities
  '@hookform/resolvers',
  '@jridgewell/trace-mapping',
  '@react-google-maps/api',
  '@replit/vite-plugin-shadcn-theme-json',
  '@tanstack/react-query',
  'chart.js',
  'class-variance-authority',
  'clsx',
  'cmdk',
  'connect-pg-simple',
  'cors',
  'date-fns',
  'dotenv',
  'embla-carousel-react',
  'express',
  'express-session',
  'firebase-admin',
  'framer-motion',
  'input-otp',
  'lucide-react',
  'memorystore',
  'passport',
  'passport-local',
  'react-chartjs-2',
  'react-day-picker',
  'react-hook-form',
  'react-icons',
  'react-resizable-panels',
  'react-router-dom',
  'recharts',
  'tailwind-merge',
  'vaul',
  'wouter',
  'ws',
  'zod-validation-error',
  
  // Unused dev dependencies
  '@replit/vite-plugin-cartographer',
  '@replit/vite-plugin-runtime-error-modal',
  '@types/axios',
  '@types/connect-pg-simple',
  '@types/dotenv',
  '@types/passport',
  '@types/passport-local',
  '@types/ws',
  'ts-node'
];

// Dependencies to keep (essential ones)
const depsToKeep = [
  'react',
  'react-dom',
  'typescript',
  'vite',
  '@vitejs/plugin-react',
  'tailwindcss',
  'postcss',
  'autoprefixer',
  'esbuild',
  'tsx'
];

console.log('🧹 Starting dependency cleanup process...');

// Fix security issues
try {
  console.log('Fixing security issues...');
  execSync('npm audit fix', { stdio: 'inherit' });
} catch (error) {
  console.error('Error fixing security issues:', error.message);
}

// Remove unused dependencies
console.log('Removing unused dependencies...');
depsToRemove.forEach(dep => {
  try {
    console.log(`Removing ${dep}...`);
    execSync(`npm uninstall ${dep}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error removing ${dep}:`, error.message);
  }
});

// Install missing dependencies
console.log('Installing missing dependencies...');
try {
  execSync('npm install logform', { stdio: 'inherit' });
} catch (error) {
  console.error('Error installing missing dependencies:', error.message);
}

// Verify essential dependencies are installed
console.log('Verifying essential dependencies...');
depsToKeep.forEach(dep => {
  try {
    console.log(`Checking ${dep}...`);
    execSync(`npm list ${dep}`, { stdio: 'inherit' });
  } catch (error) {
    console.log(`Installing ${dep}...`);
    try {
      execSync(`npm install ${dep}`, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error installing ${dep}:`, error.message);
    }
  }
});

console.log('✨ Dependency cleanup completed!'); 