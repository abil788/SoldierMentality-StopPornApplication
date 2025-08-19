import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function FocusTab() {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timer, setTimer] = useState(0);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isBreathing) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathing]);

  useEffect(() => {
    let breathInterval: NodeJS.Timeout;
    
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
      }, 4000); // 4 seconds per phase
    }

    return () => {
      if (breathInterval) clearInterval(breathInterval);
    };
  }, [isBreathing]);

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
    setSessions(prev => prev + 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathInstruction = () => {
    switch (breathPhase) {
      case 'inhale': return 'Tarik Napas Dalam';
      case 'hold': return 'Tahan';
      case 'exhale': return 'Hembuskan Perlahan';
      default: return 'Bersiap';
    }
  };

  const getCircleScale = () => {
    switch (breathPhase) {
      case 'inhale': return 1.2;
      case 'hold': return 1.2;
      case 'exhale': return 0.8;
      default: return 1;
    }
  };

  return (
    <LinearGradient
      colors={['#a8e6cf', '#dcedc1', '#ffd3a5']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pusat Fokus</Text>
          <Text style={styles.subtitle}>Latihan pernapasan untuk ketenangan pikiran</Text>
        </View>

        {/* Breathing Circle */}
        <View style={styles.breathingContainer}>
          <View
            style={[
              styles.breathingCircle,
              {
                transform: [{ scale: isBreathing ? getCircleScale() : 1 }],
              },
            ]}
          >
            <Text style={styles.breathInstruction}>
              {isBreathing ? getBreathInstruction() : 'Siap Memulai'}
            </Text>
          </View>
        </View>

        {/* Timer */}
        <Text style={styles.timer}>{formatTime(timer)}</Text>

        {/* Phase Indicator */}
        {isBreathing && (
          <View style={styles.phaseContainer}>
            <View style={[styles.phaseDot, breathPhase === 'inhale' && styles.activeDot]} />
            <View style={[styles.phaseDot, breathPhase === 'hold' && styles.activeDot]} />
            <View style={[styles.phaseDot, breathPhase === 'exhale' && styles.activeDot]} />
          </View>
        )}

        {/* Controls */}
        <View style={styles.controlsContainer}>
          {!isBreathing ? (
            <TouchableOpacity
              style={[styles.controlButton, styles.playButton]}
              onPress={startBreathingSession}
              activeOpacity={0.8}
            >
              <Play size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Mulai Latihan</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.activeControls}>
              <TouchableOpacity
                style={[styles.controlButton, styles.pauseButton]}
                onPress={pauseSession}
                activeOpacity={0.8}
              >
                <Pause size={20} color="#FFFFFF" />
                <Text style={styles.smallButtonText}>Jeda</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.resetButton]}
                onPress={resetSession}
                activeOpacity={0.8}
              >
                <RotateCcw size={20} color="#FFFFFF" />
                <Text style={styles.smallButtonText}>Selesai</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{sessions}</Text>
            <Text style={styles.statLabel}>Sesi Hari Ini</Text>
          </View>
          <View style={styles.statItem}>
            <Volume2 size={20} color="#64748B" />
            <Text style={styles.statLabel}>Audio Tenang</Text>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tips Fokus</Text>
          <Text style={styles.tipsText}>
            • Lakukan latihan ini saat merasa terdistraksi{'\n'}
            • Fokus pada gerakan lingkaran dan ikuti ritmenya{'\n'}
            • 5-10 menit sudah cukup untuk menenangkan pikiran
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 3,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  breathInstruction: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366F1',
    textAlign: 'center',
  },
  timer: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  phaseContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  phaseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#6366F1',
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playButton: {
    backgroundColor: '#10B981',
    width: '100%',
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
    flex: 0.45,
  },
  resetButton: {
    backgroundColor: '#EF4444',
    flex: 0.45,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});