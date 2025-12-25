#!/usr/bin/env node

/**
 * Helper script to update Firebase configuration in .env file
 * Usage: node update-firebase-config.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '.env');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function updateFirebaseConfig() {
  console.log('\n🔥 Firebase Configuration Setup\n');
  console.log('Please enter your Firebase configuration values.\n');
  console.log('You can find these in Firebase Console → Project Settings → General → Your apps → Web app\n');

  const apiKey = await question('API Key: ');
  const authDomain = await question('Auth Domain: ');
  const projectId = await question('Project ID: ');
  const storageBucket = await question('Storage Bucket: ');
  const messagingSenderId = await question('Messaging Sender ID: ');
  const appId = await question('App ID: ');

  const envContent = `VITE_FIREBASE_API_KEY=${apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${authDomain}
VITE_FIREBASE_PROJECT_ID=${projectId}
VITE_FIREBASE_STORAGE_BUCKET=${storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}
VITE_FIREBASE_APP_ID=${appId}
`;

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Firebase configuration saved to .env file!');
  console.log('\n📝 Next steps:');
  console.log('1. Restart your dev server (npm run dev)');
  console.log('2. Try registering a new account in your app');
  console.log('\n');

  rl.close();
}

updateFirebaseConfig().catch(console.error);

