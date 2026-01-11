# ARound BulSU Mobile Application

A React Native / Expo mobile application for AR-based campus navigation at Bulacan State University.

## Features

### 🧭 Navigation Feature
- Interactive map view of BulSU Main Campus
- Building markers with location pins
- Search functionality to find buildings
- Route preview from current location to destination
- Building information preview with offices list

### 📱 AR Navigation
- Camera-based AR view with blue waypoint markers
- Real-time distance tracking
- Mini-map for reference during navigation
- Compass button for orientation

### 🚨 Emergency Feature
- Emergency mode with evacuation area markers (red)
- Activate evacuation functionality
- AR-guided evacuation route with red waypoints
- Nearest evacuation area detection

### ℹ️ Information Page
- Emergency contacts list with direct call functionality
- Building directory with details
- Evacuation maps for each building
- Office/department listings

## Project Structure

```
mobile-app/
├── App.js                      # Main app entry point
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── babel.config.js             # Babel configuration
├── assets/                     # Images and icons
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
└── src/
    ├── constants/
    │   └── theme.js            # Colors, typography, spacing
    ├── context/
    │   └── AppContext.js       # Global state management
    ├── data/
    │   └── campusData.js       # Buildings, contacts, evacuation areas
    ├── navigation/
    │   └── MainTabs.js         # Bottom tab navigation
    └── screens/
        ├── SplashScreen.js         # App splash/loading screen
        ├── NavigateScreen.js       # Map & navigation
        ├── ARNavigationScreen.js   # AR navigation view
        ├── EmergencyScreen.js      # Emergency mode
        ├── AREmergencyScreen.js    # AR evacuation view
        ├── InfoScreen.js           # Information & contacts
        ├── BuildingSearchScreen.js # Building search
        └── BuildingDetailsScreen.js # Building details
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device

### Installation

1. Navigate to the mobile-app directory:
   ```bash
   cd mobile-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   expo start
   ```

4. Scan the QR code with Expo Go (Android) or Camera app (iOS)

## Building for Production

### Android APK
```bash
expo build:android -t apk
```

### iOS IPA
```bash
expo build:ios -t archive
```

### EAS Build (Recommended)
```bash
eas build --platform android
eas build --platform ios
```

## Required Permissions

- **Camera**: For AR navigation functionality
- **Location**: For GPS-based navigation and distance calculation

## Color Theme

The app uses BulSU's official maroon color scheme:
- Primary: `#B91C1C` (Maroon)
- Navigation Blue: `#38BDF8`
- Emergency Red: `#DC2626`

## Technologies Used

- **React Native** - Mobile app framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **React Native Maps** - Map integration
- **Expo Camera** - Camera access for AR
- **Expo Location** - GPS location services

## Team

ARound BulSU Development Team - Bulacan State University

## License

This project is part of an academic thesis at Bulacan State University.
