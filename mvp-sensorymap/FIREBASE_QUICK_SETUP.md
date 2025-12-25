# Firebase Quick Setup Guide

Follow these steps to set up Firebase for your SenseScape app:

## Step 1: Sign in to Firebase Console
1. Sign in to your Google account at https://console.firebase.google.com/
2. If you don't have a Google account, create one first

## Step 2: Create a Firebase Project
1. Click **"Add project"** or **"Create a project"**
2. Enter project name: `sensescape` (or any name you prefer)
3. Click **Continue**
4. (Optional) Enable Google Analytics - you can skip this for now
5. Click **Create project**
6. Wait for project creation (takes ~30 seconds)
7. Click **Continue**

## Step 3: Enable Email/Password Authentication
1. In the left sidebar, click **Authentication** (or find it under "Build")
2. Click **Get started**
3. Click on the **Sign-in method** tab
4. Click on **Email/Password**
5. Toggle **Enable** to ON (the first toggle)
6. Click **Save**

## Step 4: Add a Web App
1. Click the gear icon (⚙️) next to "Project Overview" in the left sidebar
2. Scroll down to **"Your apps"** section
3. Click the **Web** icon (`</>`)
4. Register your app:
   - App nickname: `SenseScape Web`
   - (Optional) Check "Also set up Firebase Hosting" - you can skip this
5. Click **Register app**

## Step 5: Copy Firebase Configuration
You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**Copy these values** - you'll need them in the next step.

## Step 6: Update Your .env File

Open `/web/.env` and replace the placeholder values with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

**Important:** Replace ALL the placeholder values with your actual values from Step 5.

## Step 7: Restart Your Dev Server
1. Stop your current dev server (Ctrl+C)
2. Restart it: `cd web && npm run dev`

## Step 8: Test Authentication
1. Open your app in the browser
2. Try to register a new account with a real email and password
3. After registration, try logging in with the same credentials

## Troubleshooting

### "Firebase config is missing" error
- Make sure your `.env` file is in the `/web` directory
- Make sure all values start with `VITE_`
- Restart your dev server after updating `.env`

### "Invalid API key" error
- Double-check that you copied the correct values from Firebase Console
- Make sure there are no extra spaces or quotes in your `.env` file

### "Network error" or "Firebase initialization error"
- Check your internet connection
- Verify all Firebase config values are correct
- Make sure Email/Password authentication is enabled in Firebase Console

## Need Help?

If you get stuck, check:
1. Firebase Console → Project Settings → General → Your apps
2. Make sure Email/Password is enabled in Authentication → Sign-in method
3. Check browser console for detailed error messages

