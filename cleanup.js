import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories to clean
const dirsToClean = [
  'node_modules/.cache',
  'dist',
  '.next',
  'build',
  'coverage',
  'logs',
  '.vscode/.debug.log',
  '.vscode/ipch'
];

// Files to clean
const filesToClean = [
  '*.log',
  '*.lock',
  '*.tmp',
  '*.temp',
  '.DS_Store',
  'Thumbs.db'
];

console.log('🧹 Starting cleanup process...');

// Clean npm cache
try {
  console.log('Cleaning npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });
} catch (error) {
  console.error('Error cleaning npm cache:', error.message);
}

// Remove directories
dirsToClean.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`Removing directory: ${dir}`);
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
    } catch (error) {
      console.error(`Error removing ${dir}:`, error.message);
    }
  }
});

// Remove files
filesToClean.forEach(pattern => {
  console.log(`Cleaning files matching: ${pattern}`);
  try {
    execSync(`del /s /q ${pattern}`, { stdio: 'inherit' });
  } catch (error) {
    // Ignore errors for files that don't exist
  }
});

// Reinstall dependencies with production flag - no fallbacks
console.log('Reinstalling dependencies...');
try {
  // Only try npm ci with production flag
  console.log('Installing with npm ci --omit=dev...');
  execSync('npm ci --omit=dev', { stdio: 'inherit' });
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  console.error('Installation failed. You may need to check your network connection or npm configuration.');
  console.error('You can try running npm install manually after fixing any network issues.');
}

console.log('✨ Cleanup completed!'); 