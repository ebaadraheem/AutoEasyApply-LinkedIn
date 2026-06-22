# Moneymind-Frontend
Frontend: AI Finance Bot (React + TypeScript)
This is the frontend for the AI Finance Bot, built with React and TypeScript. It provides the user interface for interacting with the AI chat assistant and is intended for deployment on Vercel.

Features
User interface for chat interactions.

Displays chat history with the AI.

Allows users to send messages and receive AI-generated responses.

Supports creating, renaming, and deleting chat sessions.

Tech Stack
React

TypeScript

Vite (or Create React App, adjust as needed)

Axios (for API calls to the backend)

Tailwind CSS (or your chosen styling solution)

Heroicons (or your icon library)

Prerequisites
Node.js (version 18.x or later recommended)

npm or yarn

Local Development Setup
Navigate to the frontend directory:

# Assuming your project structure is my-project/frontend
cd path/to/your/my-project/frontend

Install dependencies:

npm install
# or
yarn install

Set up Environment Variables for Local Development:
Create a .env.local file in the root of your frontend directory. This file is for local development settings and should be added to your .gitignore file.

Add the following variable, pointing to your local Flask server's API endpoint (when you run the backend on your machine):

VITE_FIREBASE_API_KEY= firebase api key
VITE_FIREBASE_AUTH_DOMAIN= firebase auth domain
VITE_FIREBASE_PROJECT_ID=firebase project id
VITE_FIREBASE_STORAGE_BUCKET= firebase storage bucket
VITE_FIREBASE_MESSAGING_SENDER_ID= firebase messaging sender id
VITE_FIREBASE_APP_ID= firebase app_id
VITE_SERVER_URL= your server url

Run the development server:

npm run dev
# or
yarn dev

The application should now be running, typically at http://localhost:5173 (for Vite) or http://localhost:3000 (for Create React App).

Build for Production
To create a production-ready build of your frontend (output typically goes to a dist/ or build/ folder):

npm run build
# or
yarn build

Deployment to Vercel
Push your frontend code to a Git repository (e.g., GitHub, GitLab, Bitbucket).

Sign up or log in to Vercel.

Import your Git repository as a new project on Vercel.

Configure Vercel Project Settings:

Framework Preset: Vercel usually auto-detects this (e.g., "Vite" or "Create React App").

Build Command: Verify it matches your project (e.g., npm run build or vite build).

Output Directory: Verify it matches your project's build output (e.g., dist or build).

Environment Variables (in Vercel project settings):

Name: VITE_API_URL (if using Vite) or REACT_APP_API_URL (if using Create React App).

Value: Set this to the HTTPS Trigger URL of your deployed Firebase Cloud Function (e.g., https://<region>-<your-project-id>.cloudfunctions.net/app/api or similar, where app is your Cloud Function name and /api is your Flask base route if you have one).

Ensure you set this for the "Production" environment (and "Preview" if you use Vercel's preview deployments).

Deploy the project on Vercel.

Available Scripts
In the frontend/package.json, you typically have scripts like:

dev (or start): Runs the app in development mode.

build: Builds the app for production.

lint: Lints the codebase (if configured).

preview: Serves the production build locally (common with Vite).

(Adjust based on your actual package.json scripts.)
