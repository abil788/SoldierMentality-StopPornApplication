import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, RotateCcw, Volume2, Brain, Zap, Activity, Waves } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function FocusTab() {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timer, setTimer] = useState(0);
  const [sessions, setSessions] = useState(0);

  // Animation refs
  const circleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🔹 Load sessions (sekali saat mount) + migrasi dari key lama
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // coba baca dari key baru
        let value = await AsyncStorage.getItem('totalSessions');

        // migrasi dari key lama jika ada
        if (value == null) {
          const legacy = await AsyncStorage.getItem('focus_sessions');
          if (legacy != null) {
            value = legacy;
            await AsyncStorage.setItem('totalSessions', legacy);
            await AsyncStorage.removeItem('focus_sessions');
          }
        }

        const n = parseInt(value ?? '0', 10);
        if (mounted) setSessions(Number.isNaN(n) ? 0 : n);
      } catch (e) {
        console.log('Gagal load sessions:', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 🔹 Simpan sessions setiap kali berubah (ke key baru)
  useEffect(() => {
    AsyncStorage.setItem('totalSessions', String(sessions)).catch(e =>
      console.log('Gagal simpan sessions:', e)
    );
  }, [sessions]);

  // 🔹 Animasi awal
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 🔹 Timer detik
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isBreathing) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathing]);

  // 🔹 Perpindahan fase napas
  useEffect(() => {
    let breathInterval: NodeJS.Timeout | undefined;
    if (isBreathing) {
      breathInterval = setInterval(() => {
        setBreathPhase(prev => {
          switch (prev) {
            case 'inhale': return 'hold';
            case 'hold': return 'exhale';
            case 'exhale': return 'inhale';
            default: return 'inhale';
          }
        });
      }, 4000);
    }
    return () => {
      if (breathInterval) clearInterval(breathInterval);
    };
  }, [isBreathing]);

  // 🔹 Animasi sesuai fase
  useEffect(() => {
    if (isBreathing) {
      const scale = getCircleScale();
      Animated.timing(circleAnim, {
        toValue: scale,
        duration: 4000,
        useNativeDriver: true,
      }).start();

      const glowIntensity = breathPhase === 'hold' ? 1 : 0.6;
      Animated.timing(glowAnim, {
        toValue: glowIntensity,
        duration: 2000,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(circleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [breathPhase, isBreathing]);

  const startBreathingSession = () => {
    setIsBreathing(true);
    setTimer(0);
    setBreathPhase('inhale');
  };

  const pauseSession = () => {
    setIsBreathing(false);
  };

  const resetSession = () => {
    setIsBreathing(false);
    setTimer(0);
    setBreathPhase('inhale');
    setSessions(prev => prev + 1); // tersimpan via useEffect
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathInstruction = () => {
    switch (breathPhase) {
      case 'inhale': return 'TARIK NAPAS DALAM';
      case 'hold': return 'TAHAN';
      case 'exhale': return 'HEMBUSKAN PERLAHAN';
      default: return 'BERSIAP';
    }
  };

  const getCircleScale = () => {
    switch (breathPhase) {
      case 'inhale': return 1.4;
      case 'hold': return 1.4;
      case 'exhale': return 0.7;
      default: return 1;
    }
  };

  const getPhaseColor = () => {
    switch (breathPhase) {
      case 'inhale': return ['#00F260', '#0575E6'];
      case 'hold': return ['#FFD700', '#FF6B6B'];
      case 'exhale': return ['#A8E6CF', '#88D8C0'];
      default: return ['#667eea', '#764ba2'];
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#0F0C29', '#24243e', '#313164', '#2B1B69']}
      locations={[0, 0.3, 0.7, 1]}
      style={styles.container}
    >
      {/* Floating Background Elements */}
      <View style={styles.backgroundElements}>
        <Animated.View style={[styles.floatingElement, { top: '15%', left: '10%', transform: [{ rotate: spin }] }]}>
          <Brain size={24} color="rgba(255,255,255,0.08)" />
        </Animated.View>
        <Animated.View style={[styles.floatingElement, { top: '70%', right: '15%', transform: [{ rotate: spin }] }]}>
          <Waves size={20} color="rgba(255,255,255,0.06)" />
        </Animated.View>
        <Animated.View style={[styles.floatingElement, { top: '40%', right: '8%', transform: [{ rotate: spin }] }]}>
          <Activity size={18} color="rgba(255,255,255,0.05)" />
        </Animated.View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Holographic Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.headerContainer}
          >
            <Text style={styles.title}>PUSAT FOKUS</Text>
            <View style={styles.subtitleContainer}>
              <View style={styles.glowLine} />
              <Text style={styles.subtitle}>NEURAL BREATHING PROTOCOL</Text>
              <View style={styles.glowLine} />
            </View>
          </LinearGradient>
        </View>

        {/* Quantum Breathing Circle */}
        <View style={styles.breathingContainer}>
          <Animated.View style={[styles.outerRing1, { transform: [{ scale: pulseAnim }] }]} />
          <Animated.View style={[styles.outerRing2, { transform: [{ scale: pulseAnim }, { rotate: spin }] }]} />
          <Animated.View style={[styles.outerRing3, { transform: [{ rotate: spin }] }]} />

          <Animated.View style={[
            styles.breathingCircle,
            { transform: [{ scale: circleAnim }] }
          ]}>
            <LinearGradient
              colors={getPhaseColor()}
              style={styles.circleGradient}
            >
              <View style={styles.circleInner}>
                <Text style={styles.breathInstruction}>
                  {isBreathing ? getBreathInstruction() : 'SIAP MEMULAI'}
                </Text>
                <View style={styles.centerDot} />
              </View>
            </LinearGradient>

            {/* Glow Effect */}
            <Animated.View style={[
              styles.circleGlow,
              { opacity: glowAnim }
            ]} />
          </Animated.View>
        </View>

        {/* Holographic Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{formatTime(timer)}</Text>
          <View style={styles.timerGlow} />
        </View>

        {/* Quantum Phase Indicators */}
        {isBreathing && (
          <View style={styles.phaseContainer}>
            <View style={[styles.phaseDot, breathPhase === 'inhale' && styles.activeDot]}>
              {breathPhase === 'inhale' && <View style={styles.dotGlow} />}
            </View>
            <View style={styles.phaseConnector} />
            <View style={[styles.phaseDot, breathPhase === 'hold' && styles.activeDot]}>
              {breathPhase === 'hold' && <View style={styles.dotGlow} />}
            </View>
            <View style={styles.phaseConnector} />
            <View style={[styles.phaseDot, breathPhase === 'exhale' && styles.activeDot]}>
              {breathPhase === 'exhale' && <View style={styles.dotGlow} />}
            </View>
          </View>
        )}

        {/* Cyberpunk Controls */}
        <View style={styles.controlsContainer}>
          {!isBreathing ? (
            <TouchableOpacity
              style={styles.playButton}
              onPress={startBreathingSession}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#00F260', '#0575E6']}
                style={styles.buttonGradient}
              >
                <Play size={28} color="#FFFFFF" />
                <Text style={styles.buttonText}>MULAI LATIHAN</Text>
                <View style={styles.buttonGlow} />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.activeControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={pauseSession}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FFD700', '#FF6B6B']}
                  style={styles.smallButtonGradient}
                >
                  <Pause size={20} color="#FFFFFF" />
                  <Text style={styles.smallButtonText}>JEDA</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={resetSession}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FC466B', '#3F5EFB']}
                  style={styles.smallButtonGradient}
                >
                  <RotateCcw size={20} color="#FFFFFF" />
                  <Text style={styles.smallButtonText}>SELESAI</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Neural Stats Dashboard */}
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          style={styles.statsContainer}
        >
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Zap size={24} color="#00F260" />
              <View style={styles.statIconGlow} />
            </View>
            <Text style={styles.statNumber}>{sessions}</Text>
            <Text style={styles.statLabel}>SESI TOTAL</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Volume2 size={24} color="#0575E6" />
              <View style={styles.statIconGlow} />
            </View>
            <Text style={styles.statLabel2}>AUDIO NEURAL</Text>
            <Text style={styles.statSubtext}>AKTIF</Text>
          </View>
        </LinearGradient>

        
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundElements: { position: 'absolute', width: '100%', height: '100%' },
  floatingElement: { position: 'absolute' },
  content: { flex: 1, paddingTop: 80, paddingHorizontal: 24, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  headerContainer: {
    padding: 20, borderRadius: 20, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 32, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', letterSpacing: 3,
    textShadowColor: 'rgba(255,255,255,0.3)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  subtitleContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  glowLine: {
    width: 30, height: 1, backgroundColor: '#00F260', marginHorizontal: 12,
    shadowColor: '#00F260', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 5,
  },
  subtitle: { fontSize: 12, color: '#E2E8F0', textAlign: 'center', letterSpacing: 1, fontWeight: '600' },
  breathingContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 40, position: 'relative' },
  outerRing1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  outerRing2: { position: 'absolute', width: 320, height: 320, borderRadius: 160, borderWidth: 1, borderColor: 'rgba(0, 242, 96, 0.2)', borderStyle: 'dashed' },
  outerRing3: { position: 'absolute', width: 360, height: 360, borderRadius: 180, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  breathingCircle: { width: 220, height: 220, borderRadius: 110, position: 'relative' },
  circleGradient: { width: '100%', height: '100%', borderRadius: 110, padding: 3 },
  circleInner: { flex: 1, borderRadius: 107, backgroundColor: 'rgba(15, 12, 41, 0.8)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  breathInstruction: {
    fontSize: 16, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', letterSpacing: 1,
    textShadowColor: 'rgba(255,255,255,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5,
  },
  centerDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#00F260', marginTop: 10,
    shadowColor: '#00F260', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 5,
  },
  circleGlow: { position: 'absolute', top: -20, left: -20, right: -20, bottom: -20, borderRadius: 130, backgroundColor: '#00F260', opacity: 0.2 },
  timerContainer: { position: 'relative', marginBottom: 30 },
  timer: {
    fontSize: 48, fontWeight: '900', color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  timerGlow: { position: 'absolute', top: -10, left: -20, right: -20, bottom: -10, backgroundColor: '#FFFFFF', opacity: 0.05, borderRadius: 10 },
  phaseContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  phaseDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  activeDot: { backgroundColor: '#00F260', shadowColor: '#00F260', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10 },
  dotGlow: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#00F260', opacity: 0.3 },
  phaseConnector: { width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 8 },
  controlsContainer: { width: '100%', alignItems: 'center', marginBottom: 40 },
  playButton: { width: '100%', borderRadius: 15, overflow: 'hidden' },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginLeft: 12, letterSpacing: 1 },
  buttonGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', opacity: 0.1 },
  activeControls: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  controlButton: { flex: 0.48, borderRadius: 12, overflow: 'hidden' },
  smallButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16 },
  smallButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginLeft: 8, letterSpacing: 0.5 },
  statsContainer: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%',
    borderRadius: 20, padding: 25, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statIconContainer: { position: 'relative', marginBottom: 10 },
  statIconGlow: { position: 'absolute', top: -5, left: -5, right: -5, bottom: -5, backgroundColor: '#00F260', borderRadius: 20, opacity: 0.2 },
  statNumber: {
    fontSize: 28, fontWeight: '900', color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.3)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5,
  },
  statLabel: { fontSize: 12, color: '#E2E8F0', fontWeight: '600', letterSpacing: 0.5, marginTop: 4 },
  statLabel2: { fontSize: 12, color: '#E2E8F0', fontWeight: '600', letterSpacing: 0.5 },
  statSubtext: { fontSize: 10, color: '#00F260', fontWeight: '500', marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 20 },
  tipsContainer: {
    width: '100%', borderRadius: 20, padding: 25, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', position: 'relative',
  },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginLeft: 10, letterSpacing: 1 },
  tipsText: { fontSize: 13, color: '#E2E8F0', lineHeight: 22, fontWeight: '400' },
  tipsGlow: { position: 'absolute', top: -5, left: -5, right: -5, bottom: -5, backgroundColor: '#00F260', borderRadius: 25, opacity: 0.05 },
});
