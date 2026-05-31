import React, { useEffect, useRef } from 'react';
import {
  Animated, Image, Linking, Pressable,
  StyleSheet, Text, View,
} from 'react-native';

export function SongCard({ song, onDismiss }) {
  const slideAnim   = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim,   { toValue: 0, friction: 7, tension: 50, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const openLink = (url) => { if (url) Linking.openURL(url).catch(console.error); };

  // Popularity bar width  0–100 → 0–100%
  const popularityWidth = song.popularity != null ? `${song.popularity}%` : null;

  return (
    <Animated.View style={[styles.card, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>

      {/* ── Album Art ── */}
      {song.albumArt ? (
        <Image source={{ uri: song.albumArt }} style={styles.albumArt} />
      ) : (
        <View style={[styles.albumArt, styles.albumArtPlaceholder]}>
          <Text style={styles.albumArtIcon}>🎵</Text>
        </View>
      )}

      <View style={styles.body}>

        {/* ── Title & Artist ── */}
        <Text style={styles.title} numberOfLines={2}>{song.title}</Text>
        <Text style={styles.artist}>{song.artistsList || song.artist}</Text>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Details Grid ── */}
        <View style={styles.grid}>
          {song.album && (
            <DetailItem icon="💿" label="Album" value={song.album} />
          )}
          {song.releaseDate && (
            <DetailItem icon="📅" label="Released" value={song.releaseDate} />
          )}
          {song.duration && (
            <DetailItem icon="⏱️" label="Duration" value={song.duration} />
          )}
          {song.label && (
            <DetailItem icon="🏷️" label="Label" value={song.label} />
          )}
          {song.timecode && (
            <DetailItem icon="📍" label="Matched at" value={song.timecode + ' in track'} />
          )}
          {song.genres?.length > 0 && (
            <DetailItem icon="🎸" label="Genre" value={song.genres.slice(0, 2).join(', ')} />
          )}
        </View>

        {/* ── Popularity Bar ── */}
        {popularityWidth && (
          <View style={styles.popularitySection}>
            <Text style={styles.popularityLabel}>
              Popularity  <Text style={styles.popularityNumber}>{song.popularity}/100</Text>
            </Text>
            <View style={styles.popularityTrack}>
              <View style={[styles.popularityFill, { width: popularityWidth }]} />
            </View>
          </View>
        )}

        {/* ── Genre Tags ── */}
        {song.genres?.length > 0 && (
          <View style={styles.tags}>
            {song.genres.slice(0, 4).map((g, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{g}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Streaming Buttons ── */}
        <View style={styles.links}>
          {song.links.spotify && (
            <Pressable style={[styles.linkBtn, styles.spotifyBtn]} onPress={() => openLink(song.links.spotify)}>
              <Text style={styles.linkBtnText}>▶  Open in Spotify</Text>
            </Pressable>
          )}
          {song.links.appleMusic && (
            <Pressable style={[styles.linkBtn, styles.appleMusicBtn]} onPress={() => openLink(song.links.appleMusic)}>
              <Text style={styles.linkBtnText}>♪  Open in Apple Music</Text>
            </Pressable>
          )}
        </View>

        {/* ── Dismiss ── */}
        <Pressable onPress={onDismiss} style={styles.dismissBtn}>
          <Text style={styles.dismissText}>✕  Try Again</Text>
        </Pressable>

      </View>
    </Animated.View>
  );
}

// Small reusable row inside the details grid
function DetailItem({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  albumArt: { width: '100%', height: 260, resizeMode: 'cover' },
  albumArtPlaceholder: {
    backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center',
  },
  albumArtIcon: { fontSize: 80 },
  body: { padding: 20, gap: 12 },

  title:  { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  artist: { color: '#1DB954', fontSize: 16, fontWeight: '700' },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 4 },

  // Details grid
  grid:      { gap: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailIcon:  { fontSize: 16, width: 24 },
  detailLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 },
  detailValue: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 1 },

  // Popularity
  popularitySection: { gap: 6 },
  popularityLabel:   { color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  popularityNumber:  { color: '#1DB954', fontWeight: '700' },
  popularityTrack:   { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  popularityFill:    { height: '100%', backgroundColor: '#1DB954', borderRadius: 3 },

  // Genre tags
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:  { backgroundColor: 'rgba(29,185,84,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(29,185,84,0.3)' },
  tagText: { color: '#1DB954', fontSize: 12, fontWeight: '600' },

  // Buttons
  links:   { gap: 10, marginTop: 4 },
  linkBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  spotifyBtn:    { backgroundColor: '#1DB954' },
  appleMusicBtn: { backgroundColor: '#FC3C44' },
  linkBtnText:   { color: '#fff', fontWeight: '700', fontSize: 15 },

  dismissBtn:  { alignItems: 'center', paddingVertical: 10 },
  dismissText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' },
});