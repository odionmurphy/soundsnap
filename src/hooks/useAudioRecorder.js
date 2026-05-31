import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

const RECORDING_DURATION_MS = 6000;

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const recordingRef = useRef(null);
  const timerRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Microphone Permission Required', 'Please enable microphone access in your device settings.');
        return null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingUri(null);

      return new Promise((resolve) => {
        timerRef.current = setTimeout(async () => {
          const uri = await stopRecording();
          resolve(uri);
        }, RECORDING_DURATION_MS);
      });
    } catch (err) {
      console.error('Failed to start recording:', err);
      setIsRecording(false);
      return null;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      clearTimeout(timerRef.current);
      if (!recordingRef.current) return null;

      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);
      setRecordingUri(uri);
      return uri;
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setIsRecording(false);
      return null;
    }
  }, []);

  const cancelRecording = useCallback(async () => {
    clearTimeout(timerRef.current);
    if (recordingRef.current) {
      try { await recordingRef.current.stopAndUnloadAsync(); } catch (_) {}
      recordingRef.current = null;
    }
    setIsRecording(false);
  }, []);

  return {
    isRecording,
    recordingUri,
    startRecording,
    stopRecording,
    cancelRecording,
    durationMs: RECORDING_DURATION_MS,
  };
}