# Humanitarian Aid Platform

A full-stack application for connecting beneficiaries, donors, and volunteers to create positive change in communities worldwide.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v8.15.4 or higher)
- [Git](https://git-scm.com/)

## Getting Started

1. Clone the repository:
```bash
git clone <your-repository-url>
cd humanitarian-aid-monorepo
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
   Create `.env` files in both the `client` and `server` directories with the following variables:

   **Client (.env)**:
   ```
   VITE_API_URL=http://localhost:3000
   VITE_FIREBASE_API_KEY=AIzaSyCECE4RoYlRls-jED9DWI3HGvnOqC2VxQ4
   VITE_FIREBASE_AUTH_DOMAIN=humanitarianlogistics-d0b77.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=humanitarianlogistics-d0b77
   VITE_FIREBASE_STORAGE_BUCKET=humanitarianlogistics-d0b77.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=874559986585
   VITE_FIREBASE_APP_ID=1:874559986585:web:cf16f3b1ed7a495f7bd108
   VITE_FIREBASE_MEASUREMENT_ID=G-G7CXG3Q4LL
   ```

   **Server (.env)**:
   ```
   PORT=3000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   DATABASE_URL=your_database_url  # If using PostgreSQL
   SESSION_SECRET=your_session_secret  # A secure random string
   ```

   Note: The Firebase configuration values are already set up for the project. For the server environment variables, you'll need to:
   - Set up a PostgreSQL database and provide its URL if you're using one
   - Generate a secure random string for SESSION_SECRET (you can use a password generator)

## Running the Application

### Development Mode

To run the entire application in development mode:
```bash
pnpm dev
```

This will start:
- Frontend development server (client)
- Backend server
- Firebase functions (if configured)

### Production Build

To create a production build:
```bash
pnpm build
```

To start the production server:
```bash
pnpm start
```

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend server
- `/functions` - Firebase Cloud Functions
- `/shared` - Shared types and utilities

## Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Create production builds
- `pnpm start` - Start production servers
- `pnpm lint` - Run linting
- `pnpm clean` - Clean build artifacts and node_modules
- `pnpm cleanup` - Run cleanup script

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## Need Help?

If you encounter any issues or have questions, please:
1. Check the existing issues in the repository
2. Contact your team lead
3. Create a new issue if needed 