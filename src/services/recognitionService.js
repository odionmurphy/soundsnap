

const BACKEND_URL = 'https://soundsnap-backend-production.up.railway.app';

export async function recognizeSong(audioUri) {
  const formData = new FormData();

  formData.append('audio', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  });

  const response = await fetch(`${BACKEND_URL}/api/recognize`, {
    method: 'POST',
    body: formData,
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error || `Server error: ${response.status}`);
  }

  return json.result;
}

export async function fetchHistory(limit = 20) {
  const response = await fetch(`${BACKEND_URL}/api/history?limit=${limit}`);
  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to fetch history');
  }

  return json.history;
}