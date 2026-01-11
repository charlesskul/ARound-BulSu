# ARound BulSU Backend Server

This is the backend server that synchronizes data between the Admin App and the Mobile App.

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

```bash
cd backend
npm install
```

## Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will run on **http://localhost:3001**

## API Endpoints

### Health Check
- `GET /health` - Check if server is running
- `GET /api/health` - Check if API is available

### Buildings
- `GET /api/buildings` - Get all buildings
- `GET /api/buildings/:id` - Get a specific building
- `POST /api/buildings` - Add a new building
- `PUT /api/buildings/:id` - Update a building
- `PATCH /api/buildings/:id/coordinates` - Update building coordinates
- `DELETE /api/buildings/:id` - Delete a building

### Evacuation Areas
- `GET /api/evacuation-areas` - Get all evacuation areas
- `GET /api/evacuation-areas/:id` - Get a specific evacuation area
- `POST /api/evacuation-areas` - Add a new evacuation area
- `PUT /api/evacuation-areas/:id` - Update an evacuation area
- `DELETE /api/evacuation-areas/:id` - Delete an evacuation area

### Emergency Mode
- `GET /api/emergency` - Get current emergency status
- `POST /api/emergency/activate` - Activate emergency mode
- `POST /api/emergency/deactivate` - Deactivate emergency mode

### Sync
- `POST /api/sync` - Full data sync endpoint

## Connecting Mobile App to Server

1. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

2. Update the API URL in the mobile app:
   - Open `mobile-app/src/services/apiService.js`
   - Change `API_BASE_URL` to your computer's IP:
     ```javascript
     const API_BASE_URL = 'http://YOUR_IP_ADDRESS:3001/api';
     ```

3. Make sure your phone and computer are on the same network

## Data Storage

Data is stored in JSON files in the `backend/data/` directory:
- `campus_data.json` - Buildings and evacuation areas
- `emergency_status.json` - Current emergency mode status

## Starting All Services

To run the complete system:

1. **Start Backend Server:**
   ```bash
   cd backend
   npm start
   ```

2. **Start Admin App:**
   ```bash
   cd admin-app
   npm run dev
   ```
   Access at http://localhost:3000

3. **Start Mobile App:**
   ```bash
   cd mobile-app
   npx expo start
   ```
   Scan QR code with Expo Go app

## Sync Flow

1. Admin makes changes in the Admin App (edit coordinates, add buildings, etc.)
2. Admin App sends changes to Backend Server via API
3. Backend Server stores changes in JSON files
4. Mobile App periodically fetches data from Backend Server (every 5 minutes)
5. Changes appear in the Mobile App automatically

For immediate updates, users can pull-to-refresh in the mobile app.
