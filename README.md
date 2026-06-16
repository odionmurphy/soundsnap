# SoundSnap 🎵

A React Native mobile app that identifies music playing around you in real time.

## Live Demo
> Mobile app — run locally with Expo

## What it does
- Listens to audio and identifies the song playing nearby
- Displays artist, album, release date, genre, and popularity score
- Links directly to the track on Spotify and Apple Music

## Tech Stack
- React Native + Expo (mobile frontend)
- Node.js + Railway (backend API)
- Music Recognition REST API

## Getting Started

```bash
# Install dependencies
npm install

# Start the app
npx expo start
```

Scan the QR code with the Expo Go app on your phone.

## Environment Variables
Create a `.env` file in the root:
```
API_URL=your_railway_backend_url
MUSIC_API_KEY=your_api_key
```
