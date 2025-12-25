# Demo Authentication Mode

Since you cannot access Google Cloud Platform/Firebase Console, I've set up a **demo authentication mode** that works without Firebase!

## ✅ What's Working Now

- **Registration**: Users can create accounts (stored in browser localStorage)
- **Login**: Users can sign in with their registered credentials
- **Persistent Sessions**: Login state persists across page refreshes
- **Automatic Fallback**: The app automatically uses demo mode when Firebase is not configured

## 🎯 How to Use

1. **Start the app**: `cd web && npm run dev`
2. **Register a new account**:
   - Click "Don't have an account? Sign up"
   - Enter email and password (min 6 characters)
   - Click "Sign Up"
3. **Login**: Use the email and password you registered with
4. **That's it!** You're logged in and can use the app

## 🔄 Switching to Firebase Later

When you have access to Firebase Console:

1. Follow the steps in `FIREBASE_QUICK_SETUP.md`
2. Update `/web/.env` with your Firebase credentials
3. Restart the dev server
4. The app will automatically switch to Firebase authentication
5. Demo accounts will still work, but new registrations will use Firebase

## 📝 Technical Details

- **Demo Mode**: Uses `DemoAuthService` with localStorage
- **Firebase Mode**: Uses Firebase Authentication (when configured)
- **Automatic Detection**: The app detects if Firebase is configured and switches modes automatically
- **No Code Changes Needed**: Just update `.env` file to switch modes

## ⚠️ Important Notes

- Demo mode stores passwords in localStorage (NOT secure - for development only!)
- Demo accounts are stored locally in your browser
- When you switch to Firebase, demo accounts won't transfer (users need to register again)
- Demo mode is perfect for testing and development

## 🐛 Troubleshooting

**"User not found" error**: Make sure you register first before trying to login

**Login not persisting**: Check browser console for errors, make sure localStorage is enabled

**Want to clear demo accounts**: Open browser console and run:
```javascript
localStorage.clear()
```

