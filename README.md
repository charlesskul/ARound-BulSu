# 🎓 ARound BulSU

> **AR-Based Campus Navigation System for Bulacan State University**

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green)](https://nodejs.org/)

## 📱 Overview

ARound BulSU is a mobile application designed to help students, faculty, and visitors navigate the Bulacan State University campus using Augmented Reality and intelligent pathfinding algorithms.

### Key Features

- 🗺️ **Interactive Campus Map** - View all buildings and locations
- 🔍 **A\* Pathfinding** - Optimal route calculation
- 🚨 **Emergency Mode** - Quick evacuation routes using Dijkstra algorithm
- 📍 **AR Navigation** - Augmented reality directional guides
- 🔄 **Real-time Sync** - Admin-managed campus data

---

## 🏗️ Project Structure

```
ARound BulSu/
├── mobile-app/          # React Native mobile application
├── admin-app/           # React admin dashboard
├── backend/             # Express.js API server
└── docs/                # Documentation
    ├── thesis/          # Thesis documents
    ├── images/          # Screenshots and diagrams
    └── DEVELOPMENT_CHANGELOG.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device

### 1. Start the Backend Server

```bash
cd backend
npm install
node server.js
```

Server will run on `http://localhost:3001`

### 2. Start the Admin Dashboard

```bash
cd admin-app
npm install
npm run dev
```

Dashboard will open at `http://localhost:3000`

### 3. Start the Mobile App

```bash
cd mobile-app
npm install
npx expo start
```

Scan the QR code with Expo Go app.

---

## ⚙️ Configuration

### Mobile App API URL

Edit `mobile-app/src/services/apiService.js`:

```javascript
// Change to your computer's IP address
const API_BASE_URL = 'http://YOUR_IP:3001/api';
```

Find your IP:
- **Windows:** Run `ipconfig`
- **Mac/Linux:** Run `ifconfig`

---

## 📖 Documentation

- [Development Changelog](docs/DEVELOPMENT_CHANGELOG.md) - All changes and updates
- [API Documentation](docs/DEVELOPMENT_CHANGELOG.md#api-documentation)
- [Troubleshooting Guide](docs/DEVELOPMENT_CHANGELOG.md#troubleshooting-guide)

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Mobile App | React Native, Expo SDK 54 |
| Admin App | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Maps (Mobile) | react-native-maps |
| Maps (Admin) | Mapbox GL JS |
| Navigation | A* Algorithm, Dijkstra Algorithm |

---

## 👥 Team

**Bulacan State University**  
College of Science

---

## 📄 License

This project is developed as part of an academic thesis at Bulacan State University.

---

