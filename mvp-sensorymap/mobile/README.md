# SenseScape Mobile App

React Native mobile app for sensory experience tracking.

## Running the App

### Prerequisites
- Node.js 18+
- iOS: Xcode and CocoaPods
- Android: Android Studio and Android SDK

### Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS, install pods:
```bash
cd ios
pod install
cd ..
```

### Running

**Start Metro bundler:**
```bash
npm start
```

**Run on iOS:**
```bash
npm run ios
```

**Run on Android:**
```bash
npm run android
```

## Mock Data Mode

The app is currently configured to use **mock data** instead of a backend API. This means:

- ✅ No backend server needed
- ✅ No database required
- ✅ Auto-login with demo user
- ✅ Pre-populated sample data

All API calls are replaced with mock data service that returns sample sensory logs, locations, and predictions.

To switch to API mode, change `USE_MOCK_DATA = false` in:
- `src/services/AuthService.ts`
- `src/services/AIService.ts`
- `src/services/LocationService.ts`
- `src/screens/MapScreen.tsx`
- `src/components/SensorySummaryOverlay.tsx`
- `src/components/PredictionOverlay.tsx`
- `src/screens/HistoryScreen.tsx`

## Demo Credentials

The app auto-logs in with:
- Email: `demo@sensescape.com`
- Password: (any password works in mock mode)

## Features

- **Map View**: View your sensory journey on a custom map
- **Log Sensory Experiences**: Add photos, descriptions, and tags
- **AI Tag Extraction**: Automatically extract tags from photos/descriptions
- **Sensory History**: View daily summaries and historical paths
- **Location Previews**: See aggregated sensory data for any location
- **AI Predictions**: Get predictions about how a location might feel

