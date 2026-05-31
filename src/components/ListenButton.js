import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, Text } from 'react-native';

const RIPPLE_COUNT = 3;

export function ListenButton({ isRecording, isLoading, onPress, progress }) {
  const ripples = useRef(
    Array.from({ length: RIPPLE_COUNT }, () => new Animated.Value(0)),
  ).current;

  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isRecording) {
      ripples.forEach((r) => r.setValue(0));
      return;
    }

    const animations = ripples.map((ripple, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 400),
          Animated.timing(ripple, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(ripple, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ),
    );

    const parallel = Animated.parallel(animations);
    parallel.start();
    return () => parallel.stop();
  }, [isRecording]);

  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.93, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <View style={styles.container}>
      {ripples.map((anim, i) => (
        <Animated.View
          key={i}
          style={[styles.ripple, {
            opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 0.2, 0] }),
            transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }) }],
          }]}
        />
      ))}

      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isLoading}
          style={[
            styles.button,
            isRecording && styles.buttonRecording,
            isLoading && styles.buttonDisabled,
          ]}
        >
          {isLoading ? (
            <LoadingDots />
          ) : (
            <>
              <Text style={styles.icon}>{isRecording ? '⏹' : '🎵'}</Text>
              <Text style={styles.label}>{isRecording ? 'Listening…' : 'Tap to Listen'}</Text>
            </>
          )}
        </Pressable>
      </Animated.View>

      {isRecording && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      )}
    </View>
  );
}

function LoadingDots() {
  const dots = useRef([
    new Animated.Value(0), new Animated.Value(0), new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ),
    );
    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Text style={styles.label}>Identifying</Text>
      {dots.map((dot, i) => (
        <Animated.Text key={i} style={[styles.dot, { opacity: dot }]}>●</Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  ripple: {
    position: 'absolute', width: 160, height: 160,
    borderRadius: 80, backgroundColor: '#1DB954',
  },
  button: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: '#1DB954', alignItems: 'center',
    justifyContent: 'center', shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5,
    shadowRadius: 16, elevation: 10, gap: 8,
  },
  buttonRecording: { backgroundColor: '#E53E3E', shadowColor: '#E53E3E' },
  buttonDisabled: { backgroundColor: '#555', shadowOpacity: 0 },
  icon: { fontSize: 36 },
  label: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  dot: { color: '#fff', fontSize: 10 },
  progressContainer: {
    marginTop: 32, width: 200, height: 4,
    borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden',
  },
  progressBar: { height: '100%', borderRadius: 2, backgroundColor: '#1DB954' },
});