
# SoundSnap Backend 🎵

REST API backend for SoundSnap, a music recognition app. Accepts an audio file, identifies the song using the AudD API, and stores results in a local SQLite database.

## Live API
https://soundsnap-backend-production.up.railway.app
## Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/recognize` | Upload an audio file to identify a song |
| GET | `/api/history` | Get recently recognized songs |
| DELETE | `/api/history/:id` | Delete a specific history item |
| DELETE | `/api/history` | Clear all history |
| GET | `/api/health` | Check server status |

### POST `/api/recognize`
Send audio as `multipart/form-data` with field name `audio`. Max file size: 10MB.

**Response:**
```json
{
  "success": true,
  "result": {
    "title": "Song Title",
    "artist": "Artist Name",
    "album": "Album Name"
  },
  "source": "audd"
}
```

## Tech Stack
- **Node.js + Express** — server framework
- **AudD API** — music recognition service
- **SQLite** — local database for history
- **Multer** — handles audio file uploads
- **Railway** — cloud deployment

## Features
- Audio hashing + in-memory caching (avoids duplicate API calls for the same audio)
- Rate limiting on recognize and history routes
- Recognition history stored in SQLite with add/delete/clear support




