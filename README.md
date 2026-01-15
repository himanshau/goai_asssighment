# RTSP Livestream Overlay Web Application

A full-stack web application for playing HLS/RTSP-converted livestreams with real-time customizable overlays (text and images) that can be positioned and resized on top of the video.

---

## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Running the Application](#running-the-application)
6. [How to Change RTSP/Stream URL](#how-to-change-rtspstream-url)
7. [API Documentation](#api-documentation)
8. [User Guide](#user-guide)

---

## Features

- 🎥 **Livestream Playback** - HLS video player with play/pause and volume controls
- 📝 **Text Overlays** - Add customizable text with font size, colors, and backgrounds
- 🖼️ **Image Overlays** - Add logos or images via URL
- 🖱️ **Drag & Drop** - Position overlays anywhere on the video
- 📐 **Resizable** - Resize overlays using corner/edge handles
- 🔐 **JWT Authentication** - Secure user signup/signin
- 💾 **Persistent Storage** - Overlays saved in MongoDB
- ⚡ **Redux State Management** - Efficient re-renders with optimistic updates

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Redux Toolkit |
| **Backend** | Flask, Flask-JWT-Extended, PyMongo |
| **Database** | MongoDB |
| **Video** | HLS.js |
| **Interactions** | react-draggable, react-resizable |

---

## Project Structure

```
goai_asssighment/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── config.py            # Configuration
│   │   ├── models/
│   │   │   ├── user.py          # User model
│   │   │   └── overlay.py       # Overlay model
│   │   └── routes/
│   │       ├── auth.py          # Auth endpoints
│   │       ├── overlays.py      # Overlay CRUD endpoints
│   │       └── settings.py      # Stream settings endpoints
│   ├── requirements.txt
│   ├── run.py                   # Entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Reusable UI components
│   │   │   ├── VideoPlayer.tsx  # HLS video player
│   │   │   ├── Overlay.tsx      # Draggable overlay
│   │   │   ├── OverlayPanel.tsx # Overlay management
│   │   │   └── Navbar.tsx       # Navigation bar
│   │   ├── pages/
│   │   │   ├── SignIn.tsx       # Login page
│   │   │   ├── SignUp.tsx       # Registration page
│   │   │   └── Landing.tsx      # Main dashboard
│   │   ├── store/               # Redux store and slices
│   │   ├── services/api.ts      # API service
│   │   └── config/config.ts     # Frontend config
│   ├── package.json
│   └── vite.config.ts
├── config/
│   └── stream.config.json       # Stream URL configuration
├── rtsp_to_hls.py               # RTSP to HLS converter
└── README.md
```

---

## Setup Instructions

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** (running locally on port 27017)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd goai_asssighment
```

### Step 2: Setup Backend

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional - defaults work for local dev)
copy .env.example .env
```

### Step 3: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install
```

### Step 4: Start MongoDB

Ensure MongoDB is running locally:
```bash
mongod
```

---

## Running the Application

### Start Backend Server

```bash
cd backend
python run.py
```
Backend runs at: **http://localhost:5000**

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```
Frontend runs at: **http://localhost:5173**

### Access the Application

Open **http://localhost:5173** in your browser.

---

## How to Change RTSP/Stream URL

### Important: RTSP Limitation

⚠️ **Browsers cannot play RTSP streams directly.** You must use HLS (.m3u8) or MP4 format.

### Option 1: Use HLS Stream Directly (Recommended)

1. Open the app at http://localhost:5173
2. Click **"Settings"** in the navbar (or "Change Stream" button)
3. Enter an HLS stream URL, e.g.:
   ```
   https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
   ```
4. Click **"Save Changes"**

### Option 2: Convert RTSP to HLS (Requires FFmpeg)

If you have an RTSP stream URL:

1. **Install FFmpeg:**
   ```bash
   winget install Gyan.FFmpeg     # Windows
   brew install ffmpeg            # macOS
   sudo apt install ffmpeg        # Linux
   ```

2. **Run the converter script:**
   ```bash
   cd goai_asssighment
   python rtsp_to_hls.py
   ```

3. **Use the local HLS URL in the app:**
   ```
   http://localhost:8080/stream.m3u8
   ```

### Sample Test Streams

| Name | URL |
|------|-----|
| Mux Test | `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8` |
| Akamai Test | `https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8` |

---

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication Endpoints

#### POST /api/auth/signup
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "johndoe"
  },
  "access_token": "jwt_token",
  "refresh_token": "refresh_token"
}
```

---

#### POST /api/auth/signin
Login an existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": { "id": "...", "email": "...", "username": "..." },
  "access_token": "jwt_token",
  "refresh_token": "refresh_token"
}
```

---

#### GET /api/auth/me
Get current authenticated user.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

---

### Overlay Endpoints (Requires Authentication)

All overlay endpoints require: `Authorization: Bearer <access_token>`

#### GET /api/overlays
Get all overlays for the authenticated user.

**Response (200):**
```json
{
  "overlays": [
    {
      "id": "overlay_id",
      "type": "text",
      "content": "LIVE",
      "position": { "x": 100, "y": 50 },
      "size": { "width": 150, "height": 50 },
      "style": {
        "fontSize": 24,
        "fontColor": "#ffffff",
        "backgroundColor": "rgba(255,0,0,0.8)"
      }
    }
  ]
}
```

---

#### POST /api/overlays
Create a new overlay.

**Request:**
```json
{
  "type": "text",
  "content": "Breaking News",
  "position": { "x": 50, "y": 400 },
  "size": { "width": 300, "height": 60 },
  "style": {
    "fontSize": 20,
    "fontColor": "#ffffff",
    "backgroundColor": "#ff0000"
  }
}
```

**Response (201):**
```json
{
  "message": "Overlay created successfully",
  "overlay": { ... }
}
```

---

#### PUT /api/overlays/:id
Update an existing overlay.

**Request:**
```json
{
  "content": "Updated Text",
  "position": { "x": 200, "y": 100 }
}
```

**Response (200):**
```json
{
  "message": "Overlay updated successfully",
  "overlay": { ... }
}
```

---

#### DELETE /api/overlays/:id
Delete an overlay.

**Response (200):**
```json
{
  "message": "Overlay deleted successfully"
}
```

---

### Settings Endpoints (Requires Authentication)

#### GET /api/settings/stream
Get current stream URL.

**Response (200):**
```json
{
  "stream_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  "stream_type": "hls"
}
```

---

#### PUT /api/settings/stream
Update stream URL.

**Request:**
```json
{
  "stream_url": "https://new-stream-url.m3u8",
  "stream_type": "hls"
}
```

**Response (200):**
```json
{
  "message": "Stream settings updated successfully",
  "stream_url": "https://new-stream-url.m3u8",
  "stream_type": "hls"
}
```

---

## User Guide

### 1. Getting Started

1. **Sign Up:** Create an account at `/signup`
2. **Sign In:** Login at `/signin`
3. You'll be redirected to the main dashboard

### 2. Video Playback

- The video player loads automatically with the default stream
- **Controls appear on hover:**
  - ▶️ / ⏸️ Play/Pause
  - 🔊 Mute/Unmute
  - Volume slider
- Video auto-plays muted (browser restriction)

### 3. Adding Text Overlays

1. Click **"+ Add Text"** in the Overlay Management panel
2. Enter your text content
3. Set font size (8-72px)
4. Pick font color and background color
5. Click **"Save"**
6. **Drag** the overlay to position it on the video
7. **Resize** by dragging the corners

### 4. Adding Image Overlays

1. Click **"+ Add Image"** in the Overlay Management panel
2. Enter the image URL (must be publicly accessible)
3. Click **"Save"**
4. Position and resize as needed

**Example image URLs:**
```
https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png
```

### 5. Managing Overlays

| Action | How To |
|--------|--------|
| **Select** | Click on an overlay |
| **Move** | Drag the selected overlay |
| **Resize** | Drag corners or edges |
| **Edit** | Click ✏️ pencil icon |
| **Delete** | Click 🗑️ trash icon |

### 6. Changing Stream URL

1. Click **"Settings"** in the navbar
2. Enter a new HLS stream URL
3. Click **"Save Changes"**

### 7. Logging Out

1. Click your profile in the top-right
2. Select **"Sign Out"**

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Video shows black | Click play button or check stream URL |
| Stream error | Ensure URL is HLS format (.m3u8) |
| RTSP not working | Convert to HLS using FFmpeg |
| MongoDB connection failed | Ensure MongoDB is running on port 27017 |
| API errors | Check backend is running on port 5000 |

---

## License

MIT License
