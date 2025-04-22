const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Function to get directory size
function getDirectorySize(dirPath) {
  let size = 0;
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  }
  
  return size;
}

// Function to format bytes to human readable format
function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

// Clean up function
async function cleanup() {
  console.log('🧹 Starting cleanup process...\n');

  // Remove node_modules from root
  if (fs.existsSync('node_modules')) {
    console.log('📦 Removing root node_modules...');
    fs.rmSync('node_modules', { recursive: true, force: true });
  }

  // Remove node_modules from client
  if (fs.existsSync('client/node_modules')) {
    console.log('📦 Removing client node_modules...');
    fs.rmSync('client/node_modules', { recursive: true, force: true });
  }

  // Remove node_modules from server
  if (fs.existsSync('server/node_modules')) {
    console.log('📦 Removing server node_modules...');
    fs.rmSync('server/node_modules', { recursive: true, force: true });
  }

  // Remove node_modules from functions
  if (fs.existsSync('functions/node_modules')) {
    console.log('📦 Removing functions node_modules...');
    fs.rmSync('functions/node_modules', { recursive: true, force: true });
  }

  // Remove node_modules from shared
  if (fs.existsSync('shared/node_modules')) {
    console.log('📦 Removing shared node_modules...');
    fs.rmSync('shared/node_modules', { recursive: true, force: true });
  }

  // Clean npm cache
  console.log('🧼 Cleaning npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // Remove package-lock.json files
  if (fs.existsSync('package-lock.json')) {
    console.log('🗑️ Removing root package-lock.json...');
    fs.unlinkSync('package-lock.json');
  }
  if (fs.existsSync('client/package-lock.json')) {
    console.log('🗑️ Removing client package-lock.json...');
    fs.unlinkSync('client/package-lock.json');
  }
  if (fs.existsSync('server/package-lock.json')) {
    console.log('🗑️ Removing server package-lock.json...');
    fs.unlinkSync('server/package-lock.json');
  }
  if (fs.existsSync('functions/package-lock.json')) {
    console.log('🗑️ Removing functions package-lock.json...');
    fs.unlinkSync('functions/package-lock.json');
  }
  if (fs.existsSync('shared/package-lock.json')) {
    console.log('🗑️ Removing shared package-lock.json...');
    fs.unlinkSync('shared/package-lock.json');
  }

  console.log('\n✨ Cleanup completed!');
  console.log('📝 Next steps:');
  console.log('1. Run "pnpm install" in the root directory');
}

cleanup().catch(console.error); 