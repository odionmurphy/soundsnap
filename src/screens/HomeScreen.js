import React, { useState, useRef, useEffect } from 'react';
import {
  Animated, SafeAreaView, ScrollView, StatusBar,
  StyleSheet, Text, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { recognizeSong } from '../services/recognitionService';
import { ListenButton } from '../components/ListenButton';
import { SongCard } from '../components/SongCard';

const STATE = {
  IDLE: 'idle', RECORDING: 'recording', LOADING: 'loading',
  RESULT: 'result', NO_MATCH: 'no_match', ERROR: 'error',
};

export function HomeScreen() {
  const [appState, setAppState] = useState(STATE.IDLE);
  const [song, setSong] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);
  const { startRecording, durationMs } = useAudioRecorder();

  useEffect(() => {
    if (appState === STATE.RECORDING) {
      const startTime = Date.now();
      progressInterval.current = setInterval(() => {
        setProgress(Math.min((Date.now() - startTime) / durationMs, 1));
      }, 50);
    } else {
      clearInterval(progressInterval.current);
      setProgress(0);
    }
    return () => clearInterval(progressInterval.current);
  }, [appState]);

  const handleListen = async () => {
    if (![STATE.IDLE, STATE.NO_MATCH, STATE.ERROR].includes(appState)) return;

    setSong(null);
    setErrorMsg('');
    setAppState(STATE.RECORDING);

    try {
      const audioUri = await startRecording();

      if (!audioUri) {
        setAppState(STATE.ERROR);
        setErrorMsg('Could not access microphone.');
        return;
      }

      setAppState(STATE.LOADING);
      const result = await recognizeSong(audioUri);

      if (result) {
        setSong(result);
        setAppState(STATE.RESULT);
      } else {
        setAppState(STATE.NO_MATCH);
      }
    } catch (err) {
      setAppState(STATE.ERROR);
      setErrorMsg(err.message || 'Something went wrong.');
    }
  };

  const statusMessage = {
    [STATE.IDLE]: 'Hold your phone near the music',
    [STATE.RECORDING]: 'Listening to the music…',
    [STATE.LOADING]: 'Identifying the song…',
    [STATE.RESULT]: '',
    [STATE.NO_MATCH]: 'No match found. Try again?',
    [STATE.ERROR]: errorMsg || 'An error occurred.',
  }[appState];

  const showButton = [STATE.IDLE, STATE.RECORDING, STATE.LOADING, STATE.NO_MATCH, STATE.ERROR]
    .includes(appState);

  return (
    <LinearGradient colors={['#0d0d1a', '#0a1628', '#0d0d1a']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.appName}>SoundSnap</Text>
            <Text style={styles.tagline}>Music Recognition</Text>
          </View>

          {appState === STATE.RESULT && song && (
            <View style={styles.cardWrapper}>
              <SongCard song={song} onDismiss={() => { setSong(null); setAppState(STATE.IDLE); }} />
            </View>
          )}

          {showButton && (
            <View style={styles.buttonWrapper}>
              <ListenButton
                isRecording={appState === STATE.RECORDING}
                isLoading={appState === STATE.LOADING}
                onPress={handleListen}
                progress={progress}
              />
              {statusMessage ? (
                <Text style={[
                  styles.status,
                  appState === STATE.ERROR && styles.statusError,
                  appState === STATE.NO_MATCH && styles.statusWarn,
                ]}>
                  {statusMessage}
                </Text>
              ) : null}
            </View>
          )}

          {appState === STATE.IDLE && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Tap the button to identify any song playing around you
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingBottom: 48 },
  header: { alignItems: 'center', paddingTop: 48, paddingBottom: 32 },
  appName: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  tagline: {
    color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '500',
    letterSpacing: 2, textTransform: 'uppercase', marginTop: 4,
  },
  cardWrapper: { width: '100%', marginBottom: 40 },
  buttonWrapper: { alignItems: 'center', paddingTop: 24, gap: 32 },
  status: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '500', textAlign: 'center', maxWidth: 260 },
  statusError: { color: '#FC8181' },
  statusWarn: { color: '#F6AD55' },
  footer: { marginTop: 48, paddingHorizontal: 32 },
  footerText: { color: 'rgba(255,255,255,0.25)', textAlign: 'center', fontSize: 13, lineHeight: 20 },
});