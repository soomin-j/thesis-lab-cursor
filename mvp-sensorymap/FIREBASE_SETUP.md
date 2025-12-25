# Firebase Setup Guide

This guide will help you complete the Firebase setup for authentication and state persistence.

## Prerequisites

- Firebase account (create one at https://console.firebase.google.com/)
- Node.js and npm installed
- For mobile: React Native development environment set up

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project" or select an existing project
3. Follow the setup wizard
4. Enable Google Analytics (optional)

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Email/Password**
3. Enable the first toggle (Email/Password)
4. Click **Save**

## Step 3: Configure Web App

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname (e.g., "SenseScape Web")
5. Copy the Firebase configuration object

### Update Web Environment Variables

Edit `/web/.env` and replace the placeholder values with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Step 4: Configure Mobile App (Android)

### 4.1 Add Android App to Firebase

1. In Firebase Console, go to **Project Settings**
2. Scroll to **Your apps** section
3. Click the **Android** icon
4. Enter your Android package name (check `app.json` or `package.json` for `android.package`)
5. Register the app
6. Download `google-services.json`
7. Place `google-services.json` in `/mobile/android/app/`

### 4.2 Update Android Build Files

**Update `/mobile/android/build.gradle`:**

Add to the `buildscript` dependencies:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
        // ... other dependencies
    }
}
```

**Update `/mobile/android/app/build.gradle`:**

Add at the bottom of the file:
```gradle
apply plugin: 'com.google.gms.google-services'
```

## Step 5: Configure Mobile App (iOS)

### 5.1 Add iOS App to Firebase

1. In Firebase Console, go to **Project Settings**
2. Scroll to **Your apps** section
3. Click the **iOS** icon
4. Enter your iOS bundle ID (check `app.json` for `ios.bundleIdentifier`)
5. Register the app
6. Download `GoogleService-Info.plist`

### 5.2 Add to iOS Project

1. Open `/mobile/ios/` in Xcode
2. Drag `GoogleService-Info.plist` into the project
3. Make sure "Copy items if needed" is checked
4. Add it to your app target

### 5.3 Install CocoaPods Dependencies

```bash
cd mobile/ios
pod install
cd ../..
```

## Step 6: Test the Setup

### Web
```bash
cd web
npm run dev
```

Try registering a new user and logging in. The authentication state should persist across page refreshes.

### Mobile
```bash
cd mobile
npm start
# Then run on your device/emulator
npm run android  # or npm run ios
```

## Troubleshooting

### Web Issues

- **"Firebase config is missing"**: Check that your `.env` file exists and has all required variables
- **"Invalid API key"**: Verify the API key in Firebase Console matches your `.env` file
- **CORS errors**: Make sure your Firebase project allows your domain in Authentication settings

### Mobile Issues

- **"Native module not found"**: Run `cd ios && pod install` for iOS, or rebuild Android project
- **Build errors**: Make sure `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) is in the correct location
- **Authentication not persisting**: Check that Firebase Auth is properly initialized in your app

### Common Firebase Error Codes

- `auth/user-not-found`: User doesn't exist
- `auth/wrong-password`: Incorrect password
- `auth/email-already-in-use`: Email is already registered
- `auth/invalid-email`: Email format is invalid
- `auth/weak-password`: Password is too weak (less than 6 characters)
- `auth/too-many-requests`: Too many failed login attempts

## Next Steps

After Firebase is configured:

1. ✅ Authentication will persist across app restarts
2. ✅ Users can register and login with email/password
3. ✅ Session state is automatically managed by Firebase
4. 🔄 Consider adding password reset functionality
5. 🔄 Consider adding social login (Google, Apple, etc.)
6. 🔄 Consider using Firestore for data persistence

## Security Notes

- Never commit your `.env` file with real credentials to version control
- Add `.env` to `.gitignore` if not already present
- Use Firebase Security Rules for Firestore if you add database functionality
- Enable Firebase App Check for production apps

