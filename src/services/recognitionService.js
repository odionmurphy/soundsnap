const AUDD_API_URL = 'https://api.audd.io/';
const AUDD_API_TOKEN = '19971c82c34007d4c8023c9a661fa611'; // keep your existing key

export async function recognizeSong(audioUri) {
  const formData = new FormData();
  formData.append('file', { uri: audioUri, type: 'audio/m4a', name: 'recording.m4a' });
  formData.append('api_token', AUDD_API_TOKEN);
  formData.append('return', 'spotify,apple_music');

  const response = await fetch(AUDD_API_URL, { method: 'POST', body: formData });
  if (!response.ok) throw new Error(`AudD API error: ${response.status}`);

  const json = await response.json();
  if (json.status !== 'success') throw new Error(json.error?.error_message || 'Recognition failed');
  if (!json.result) return null;

  return parseSongResult(json.result);
}

function parseSongResult(raw) {
  const spotify    = raw.spotify;
  const apple      = raw.apple_music;

  // Album art
  const albumArt =
    spotify?.album?.images?.[0]?.url ||
    apple?.artwork?.url?.replace('{w}', '600').replace('{h}', '600') ||
    null;

  // Artists list  e.g. "Wizkid, Skepta"
  const artistsList = spotify?.artists?.map(a => a.name).join(', ') || raw.artist;

  // Genres from Apple Music
  const genres = apple?.genreNames?.filter(g => g !== 'Music') || [];

  // Duration  e.g. "3:45"
  const durationMs = spotify?.duration_ms || apple?.durationInMillis || null;
  const duration = durationMs
    ? `${Math.floor(durationMs / 60000)}:${String(Math.floor((durationMs % 60000) / 1000)).padStart(2, '0')}`
    : null;

  // Spotify popularity  0–100
  const popularity = spotify?.popularity ?? null;

  // Artist image (first artist's image from Spotify — needs extra call, skip for now)
  const spotifyArtistUrl = spotify?.artists?.[0]?.external_urls?.spotify || null;

  return {
    title:       raw.title,
    artist:      raw.artist,
    artistsList,
    album:       raw.album       || null,
    releaseDate: raw.release_date || null,
    albumArt,
    label:       raw.label       || null,
    timecode:    raw.timecode    || null,
    genres,
    duration,
    popularity,
    links: {
      spotify:    spotify?.external_urls?.spotify || null,
      appleMusic: apple?.url                      || null,
      spotifyArtist: spotifyArtistUrl,
    },
    previewUrl: spotify?.preview_url || null,
  };
}