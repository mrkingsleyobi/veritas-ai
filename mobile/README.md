# Mobile Application

This directory contains the mobile application code for VeritasAI, built with React Native and Expo.

## Directory Structure
```
mobile/
├── ios/                  # iOS native code
├── android/              # Android native code
├── src/                  # React Native source code
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation setup
│   ├── services/         # Mobile-specific services
│   ├── utils/            # Utility functions
│   └── assets/           # Images, icons, fonts
└── package.json          # Mobile dependencies
```

## Development Setup

### Prerequisites
- Node.js 14+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation
```bash
cd mobile
npm install
```

### Running the App
```bash
# Start the development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

## Architecture
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Storage**: AsyncStorage, SQLite
- **Networking**: Axios with existing backend APIs

## Features
- User authentication (registration, login, biometric support)
- Content capture and management
- Real-time verification with push notifications
- Offline mode with sync capabilities
- Social sharing features

## Testing
- Unit tests with Jest
- Component tests with React Native Testing Library
- End-to-end tests with Detox