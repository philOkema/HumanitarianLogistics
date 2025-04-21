const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(process.cwd(), 'server', '.env');
dotenv.config({ path: envPath });

console.log('Testing environment variables...');
console.log('Current working directory:', process.cwd());
console.log('Environment file path:', envPath);
console.log('Environment variables loaded:', {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not Set',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not Set',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not Set',
  NODE_ENV: process.env.NODE_ENV
}); 