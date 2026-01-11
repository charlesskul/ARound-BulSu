# ARound BulSU - IP Update Script

## Overview

When developing on a laptop across different locations (home, school, cafe, etc.), the local IP address changes with each network. The mobile app (running on Expo Go) needs your laptop's IP address to connect to the backend server.

The `update-ip.ps1` script automates updating all configuration files with your current IP address.

## Quick Start

```powershell
# Navigate to project root
cd "C:\Users\Administrator\Documents\ARound BulSu"

# Auto-detect IP and update all files
.\update-ip.ps1

# Or manually specify an IP
.\update-ip.ps1 -Manual
```

## Files Updated

The script updates the following files:

| File | Variable | Purpose |
|------|----------|---------|
| `mobile-app/src/services/apiService.js` | `API_BASE_URL` | Mobile app API calls |
| `mobile-app/src/services/emergencyService.js` | `API_BASE_URL` | Emergency notifications |
| `admin-app/src/services/apiService.js` | `API_BASE_URL` | Admin dashboard API (localhost) |
| `admin-app/.env` | `VITE_API_URL` | Admin app environment (localhost) |

> **Note:** Admin app files stay as `localhost` since the admin dashboard runs on the same machine as the backend.

## Usage Examples

### Auto-detect IP (Recommended)

```powershell
.\update-ip.ps1
```

**Output:**
```
============================================
   ARound BulSU - Network Configuration    
============================================

[->] Detected IP Address: 192.168.100.188

Updating configuration files...

[OK] Mobile App - API Service
[OK] Mobile App - Emergency Service
[->] Admin App - API Service (localhost) - Already up to date
[->] Admin App - Environment Config (localhost) - Already up to date

============================================
                 Summary
============================================

  IP Address:    192.168.100.188
  Port:          3001
  Mobile API:    http://192.168.100.188:3001/api
  Admin API:     http://localhost:3001/api

  Files Updated: 2

============================================
```

### Manual IP Entry

```powershell
.\update-ip.ps1 -Manual
```

You will be prompted to enter the IP address manually.

## When to Run

Run this script when:

- ✅ You connect to a **different WiFi network**
- ✅ Your laptop gets a **new IP address**
- ✅ The mobile app **can't connect** to the backend
- ✅ You see "Network request failed" errors in the mobile app

## How It Works

1. **Auto-detection**: Uses `Get-NetIPAddress` to find your local IPv4 address
2. **Pattern matching**: Uses regex to find and replace IP addresses in config files
3. **Selective updates**: Only modifies mobile app configs with your IP; admin app stays as localhost

## Troubleshooting

### Script won't run (Execution Policy)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### IP not detected

If auto-detection fails, use manual mode:
```powershell
.\update-ip.ps1 -Manual
```

To find your IP manually:
```powershell
ipconfig
```
Look for the IPv4 address under your WiFi or Ethernet adapter.

### Mobile app still can't connect

1. Ensure your phone is on the **same WiFi network** as your laptop
2. Check that the backend is running: `cd backend; npm start`
3. Verify the port `3001` is not blocked by firewall
4. Try accessing `http://YOUR_IP:3001/api/health` from your phone's browser

### Allow through Windows Firewall

If the mobile app can't reach the backend, you may need to allow Node.js through the firewall:

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
```

## Technical Details

### Configuration Values

| Setting | Value |
|---------|-------|
| Backend Port | `3001` |
| Mobile API URL | `http://{YOUR_IP}:3001/api` |
| Admin API URL | `http://localhost:3001/api` |

### Script Location

```
ARound BulSu/
├── update-ip.ps1          # <-- The script
├── backend/
├── admin-app/
├── mobile-app/
└── docs/
    └── IP_UPDATE_SCRIPT.md  # <-- This documentation
```

## Workflow

Recommended workflow when coding at a new location:

1. **Connect to WiFi** on your laptop
2. **Run the script**: `.\update-ip.ps1`
3. **Start the backend**: `cd backend; npm start`
4. **Start the admin app**: `cd admin-app; npm run dev`
5. **Start the mobile app**: `cd mobile-app; npx expo start`
6. **Connect your phone** to the same WiFi
7. **Scan the QR code** in Expo Go

---

*Last updated: December 23, 2025*
