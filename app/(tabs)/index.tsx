import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shield, Trophy, RotateCcw, Zap, Target, Star } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function HomeTab() {
  const [currentDay, setCurrentDay] = useState(1);
  const [lastCommitDate, setLastCommitDate] = useState<string | null>(null);
  const [hasCommittedToday, setHasCommittedToday] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProgress();
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Pulse animation for day counter
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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

    // Rotate animation for shield
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  };

  const loadProgress = async () => {
    try {
      const savedDay = await AsyncStorage.getItem('currentDay');
      const savedDate = await AsyncStorage.getItem('lastCommitDate');
      const today = new Date().toDateString();

      if (savedDay) {
        setCurrentDay(parseInt(savedDay, 10));
      }

      if (savedDate) {
        setLastCommitDate(savedDate);
        setHasCommittedToday(savedDate === today);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async (day: number, date: string) => {
    try {
      await AsyncStorage.setItem('currentDay', day.toString());
      await AsyncStorage.setItem('lastCommitDate', date);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleCommitment = async (committed: boolean) => {
    const today = new Date().toDateString();
    
    if (committed) {
      const newDay = currentDay + 1;
      setCurrentDay(newDay);
      setLastCommitDate(today);
      setHasCommittedToday(true);
      await saveProgress(newDay, today);
      
      Alert.alert(
        '🎯 Komitmen Berhasil!',
        `Selamat! Kamu telah memasuki Hari ke-${newDay}. Tetap semangat, pejuang!`,
        [{ text: 'Lanjutkan', style: 'default' }]
      );
    } else {
      Alert.alert(
        '🔄 Memulai Kembali',
        'Tidak apa-apa, setiap pejuang kadang perlu memulai kembali. Yang penting adalah bangkit lagi!',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: async () => {
              setCurrentDay(1);
              setLastCommitDate(today);
              setHasCommittedToday(true);
              await saveProgress(1, today);
            },
          },
        ]
      );
    }
  };

  const getDayMessage = () => {
    if (currentDay === 1) return 'Mulai perjalananmu sebagai pejuang!';
    if (currentDay < 7) return 'Kamu sedang membangun momentum!';
    if (currentDay < 30) return 'Pejuang sejati sedang terbentuk!';
    if (currentDay < 100) return 'Kamu sudah menjadi pejuang hebat!';
    return 'Pejuang legendaris! Terus pertahankan!';
  };

  const getProgressColor = () => {
    if (currentDay < 7) return ['#FF6B6B', '#4ECDC4'];
    if (currentDay < 30) return ['#45B7D1', '#96CEB4'];
    if (currentDay < 100) return ['#FFA07A', '#FFE66D'];
    return ['#FF6B9D', '#C44569'];
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    
      <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: 98 }]} // 🔹 tambah jarak bawah
       showsVerticalScrollIndicator={true}
        >

      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#0F0C29', '#24243e', '#313164', '#2B1B69']}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.container}
      >
        {/* Animated background elements */}
        <View style={styles.backgroundElements}>
          <Animated.View style={[styles.floatingElement, { top: '10%', left: '10%', transform: [{ rotate: spin }] }]}>
            <Star size={20} color="rgba(255,255,255,0.1)" />
          </Animated.View>
          <Animated.View style={[styles.floatingElement, { top: '60%', right: '15%', transform: [{ rotate: spin }] }]}>
            <Target size={16} color="rgba(255,255,255,0.08)" />
          </Animated.View>
          <Animated.View style={[styles.floatingElement, { top: '30%', right: '8%', transform: [{ rotate: spin }] }]}>
            <Zap size={18} color="rgba(255,255,255,0.06)" />
          </Animated.View>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          {/* Futuristic Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
              style={styles.headerGlow}
            >
              <Text style={styles.appTitle}>SOLDIER</Text>
              <Text style={styles.appSubtitle}>MENTALITY</Text>
            </LinearGradient>
            <View style={styles.subtitleContainer}>
              <View style={styles.glowLine} />
              <Text style={styles.subtitle}>MAMA RAISED A SOLDIER NOT A B*TCH</Text>
              <View style={styles.glowLine} />
            </View>
          </View>

          {/* Holographic Day Counter */}
          <Animated.View style={[styles.dayContainer, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={getProgressColor()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dayGradient}
            >
              <View style={styles.dayInner}>
                <Animated.View style={[styles.shieldContainer, { transform: [{ rotate: spin }] }]}>
                  <Shield size={50} color="#FFFFFF" />
                  <View style={styles.shieldGlow} />
                </Animated.View>
                
                <View style={styles.dayTextContainer}>
                  <Text style={styles.dayLabel}>HARI KE</Text>
                  <Text style={styles.dayNumber}>{currentDay}</Text>
                  <View style={styles.dayNumberGlow} />
                </View>
              </View>
            </LinearGradient>
            
            {/* Holographic border effect */}
            <View style={styles.holoBorder1} />
            <View style={styles.holoBorder2} />
            <View style={styles.holoBorder3} />
          </Animated.View>

          {/* Neon Progress Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.progressMessage}>{getDayMessage()}</Text>
            <View style={styles.messageGlow} />
          </View>

          {/* Futuristic Stats */}
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.statsContainer}
          >
            <View style={styles.statItem}>
              <View style={styles.trophyContainer}>
                <Trophy size={32} color="#FFD700" />
                <View style={styles.trophyGlow} />
              </View>
              <Text style={styles.statLabel}>STREAK TERBAIK</Text>
              <Text style={styles.statValue}>{currentDay}</Text>
              <View style={styles.statLine} />
            </View>
          </LinearGradient>

          {/* Cyberpunk Buttons */}
          {!hasCommittedToday && (
            <View style={styles.buttonContainer}>
              <Text style={styles.commitmentTitle}>
                BAGAIMANA HARI MU HARI INI, PEJUANG?
              </Text>
              
              <TouchableOpacity
                style={styles.commitButton}
                onPress={() => handleCommitment(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#00F260', '#0575E6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Shield size={24} color="#FFFFFF" />
                  <Text style={styles.buttonText}>I'M THE SOLDIER</Text>
                  <View style={styles.buttonGlow} />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => handleCommitment(false)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FC466B', '#3F5EFB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <RotateCcw size={24} color="#FFFFFF" />
                  <Text style={styles.buttonText}>I'M JUST A B*TCH</Text>
                  <View style={styles.buttonGlow} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {hasCommittedToday && (
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.1)']}
              style={styles.completedContainer}
            >
              <Text style={styles.completedText}>
                ✅ KAMU SUDAH BERKOMITMEN HARI INI!
              </Text>
              <Text style={styles.nextDayText}>
                Kembali lagi besok untuk melanjutkan perjalananmu
              </Text>
              <View style={styles.completedGlow} />
            </LinearGradient>
          )}
        </Animated.View>
      </LinearGradient>
    
    </ScrollView>
  );
}

const styles = StyleSheet.create({
   container: {
    flexGrow: 1, // 🔹 biar konten ngikutin isi, bukan fix 1 layar
   
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingElement: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  headerGlow: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 4,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  appSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 4,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  glowLine: {
    width: 40,
    height: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#E2E8F0',
    textAlign: 'center',
    letterSpacing: 1,
    fontWeight: '500',
  },
  dayContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  dayGradient: {
    borderRadius: 30,
    padding: 3,
  },
  dayInner: {
    backgroundColor: 'rgba(15, 12, 41, 0.8)',
    borderRadius: 27,
    padding: 40,
    alignItems: 'center',
    minWidth: 280,
  },
  shieldContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  shieldGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    opacity: 0.1,
  },
  dayTextContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 8,
  },
  dayNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  dayNumberGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    opacity: 0.1,
    borderRadius: 10,
  },
  holoBorder1: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  holoBorder2: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  holoBorder3: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  messageContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  progressMessage: {
    fontSize: 18,
    color: '#E2E8F0',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontWeight: '500',
    letterSpacing: 1,
  },
  messageGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: '#FFFFFF',
    opacity: 0.05,
    borderRadius: 10,
  },
  statsContainer: {
    borderRadius: 20,
    padding: 30,
    marginBottom: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
    position: 'relative',
  },
  trophyContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  trophyGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: '#FFD700',
    borderRadius: 25,
    opacity: 0.2,
  },
  statLabel: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  statLine: {
    width: 50,
    height: 2,
    backgroundColor: '#FFD700',
    marginTop: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  commitmentTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
    letterSpacing: 1,
  },
  commitButton: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  resetButton: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: 1,
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    opacity: 0.1,
  },
  completedContainer: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    position: 'relative',
    width: '100%',
  },
  completedText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  nextDayText: {
    fontSize: 14,
    color: '#E2E8F0',
    textAlign: 'center',
    fontWeight: '500',
  },
  completedGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#22C55E',
    borderRadius: 30,
    opacity: 0.1,
  },
});