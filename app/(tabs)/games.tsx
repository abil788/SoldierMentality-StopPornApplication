import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Clock } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type GameType = 'pattern' | 'reaction' | 'meditation' | null;

// Pengaturan Reaction Cepat
const MAX_AFTER_GREEN = 3500; // ms maksimal sebelum dianggap terlambat

export default function GamesTab() {
  const [currentGame, setCurrentGame] = useState<GameType>(null);
  const [score, setScore] = useState(0);
  const [gameTimer, setGameTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);

  // Pattern Game State
  const [pattern, setPattern] = useState<number | null>(null);

  // Reaction Game State
  const [reactionReady, setReactionReady] = useState(false); // hijau aktif?
  const [reactionStartTime, setReactionStartTime] = useState(0); // waktu mulai hijau
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const pushTimeout = (t: NodeJS.Timeout) => {
    timeoutsRef.current.push(t);
  };
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGameActive) {
      interval = setInterval(() => setGameTimer((p) => p + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameActive]);

  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  const startGame = (gameType: GameType) => {
    clearAllTimeouts();
    setCurrentGame(gameType);
    setScore(0);
    setGameTimer(0);
    setIsGameActive(true);

    if (gameType === 'pattern') {
      startPatternGame();
    } else if (gameType === 'reaction') {
      startReactionGame();
    }
  };

  const endGame = () => {
    clearAllTimeouts();
    setCurrentGame(null);
    setIsGameActive(false);
    setGameTimer(0);
    setPattern(null);
    setReactionReady(false);

    if (score > 0) {
      Alert.alert(
        '🎮 Permainan Selesai!',
        `Skor akhir: ${score}\nWaktu: ${formatTime(gameTimer)}\n\nPermainan mini ini membantu melatih fokus & refleksmu.`,
        [{ text: 'Baik', style: 'default' }]
      );
    }
  };

  // ==========================
  // Pattern Game
  // ==========================
  const startPatternGame = () => {
    const newPattern = Math.floor(Math.random() * 4);
    setPattern(newPattern);
  };

  const handlePatternPress = (index: number) => {
    if (pattern === index) {
      setScore((prev) => prev + 1);
      const next = Math.floor(Math.random() * 4);
      setPattern(next === pattern ? (next + 1) % 4 : next);
    } else {
      Alert.alert('💀 Game Over', `Skor akhir kamu: ${score}`);
      setScore(0);
      setPattern(null);
      setCurrentGame(null);
      setIsGameActive(false);
    }
  };

  // ==========================
  // Reaction Game Cepat
  // ==========================
  const startReactionGame = () => {
    clearAllTimeouts();
    setReactionReady(false);

    const delay = Math.random() * 3000 + 2000; // 2-5 detik merah dulu
    const toGreen = setTimeout(() => {
      setReactionReady(true);
      const now = Date.now();
      setReactionStartTime(now);

      // kalau user terlalu lambat
      const tooSlow = setTimeout(() => {
        if (!reactionReady) return;
        setReactionReady(false);
        Alert.alert('🐢 Terlalu Lambat', 'Kamu tidak menekan tepat waktu.');
        startReactionGame();
      }, MAX_AFTER_GREEN);

      pushTimeout(tooSlow);
    }, delay);

    pushTimeout(toGreen);
  };

  const handleReactionPress = () => {
    if (!reactionReady) {
      clearAllTimeouts();
      Alert.alert('🚫 Terlalu Cepat!', 'Tunggu sampai lingkaran berubah HIJAU.');
      startReactionGame();
      return;
    }

    // Tekan saat hijau
    const elapsed = Date.now() - reactionStartTime;
    setReactionReady(false);
    clearAllTimeouts();

    if (elapsed > MAX_AFTER_GREEN) {
      Alert.alert('🐢 Terlalu Lambat', `Reaksi ${elapsed}ms (kelebihan waktu).`);
      startReactionGame();
      return;
    }

    // Skor = semakin cepat, semakin besar poin
    let points = 0;
    if (elapsed < 200) points = 5;
    else if (elapsed < 400) points = 4;
    else if (elapsed < 600) points = 3;
    else if (elapsed < 1000) points = 2;
    else points = 1;

    setScore((prev) => prev + points);

    Alert.alert(
      '⚡ Reflek Cepat!',
      `Waktu reaksi: ${elapsed}ms\nPoin: +${points}`
    );

    startReactionGame();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // ==========================
  // RENDER
  // ==========================
  if (currentGame === 'pattern') {
    return (
      <LinearGradient colors={['#0f0c29', '#24243e', '#313862']} style={styles.container}>
        <View style={styles.backgroundElements}>
          <View style={[styles.floatingElement, { top: 100, left: 50, opacity: 0.1 }]}>
            <View style={styles.floatingOrb} />
          </View>
          <View style={[styles.floatingElement, { top: 200, right: 30, opacity: 0.08 }]}>
            <View style={styles.floatingOrb} />
          </View>
          <View style={[styles.floatingElement, { bottom: 150, left: 20, opacity: 0.06 }]}>
            <View style={styles.floatingOrb} />
          </View>
        </View>

        <View style={styles.gameContent}>
          <View style={styles.gameHeader}>
            <View style={styles.headerGlow}>
              <Text style={styles.gameTitle}>🧩 GAME POLA</Text>
              <View style={styles.subtitleContainer}>
                <View style={styles.glowLine} />
                <Text style={styles.gameDescription}>
                  PILIH KOTAK HIJAU YANG MUNCUL
                </Text>
                <View style={styles.glowLine} />
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>SKOR</Text>
                <Text style={styles.statValue}>{score}</Text>
                <View style={styles.statLine} />
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>WAKTU</Text>
                <Text style={styles.statValue}>{formatTime(gameTimer)}</Text>
                <View style={styles.statLine} />
              </View>
            </View>
          </View>

          <View style={styles.patternGameContainer}>
            <View style={styles.holoBorder1} />
            <View style={styles.holoBorder2} />
            <View style={styles.holoBorder3} />
            
            <View style={styles.patternGrid}>
              {[0, 1, 2, 3].map((index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.patternButton,
                    pattern === index && styles.patternButtonActive
                  ]}
                  onPress={() => handlePatternPress(index)}
                  activeOpacity={0.8}
                >
                  {pattern === index && <View style={styles.patternButtonGlow} />}
                  <Text style={[
                    styles.patternButtonText,
                    pattern === index && styles.patternButtonTextActive
                  ]}>
                    {index + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.endGameButton} onPress={endGame} activeOpacity={0.8}>
            <LinearGradient
              colors={['#ff6b6b', '#ee5a52']}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonGlow} />
              <Text style={styles.endGameText}>SELESAI</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (currentGame === 'reaction') {
    return (
      <LinearGradient colors={['#0f0c29', '#24243e', '#313862']} style={styles.container}>
        <View style={styles.backgroundElements}>
          <View style={[styles.floatingElement, { top: 120, right: 60, opacity: 0.1 }]}>
            <View style={styles.floatingOrb} />
          </View>
          <View style={[styles.floatingElement, { top: 300, left: 40, opacity: 0.08 }]}>
            <View style={styles.floatingOrb} />
          </View>
          <View style={[styles.floatingElement, { bottom: 200, right: 20, opacity: 0.06 }]}>
            <View style={styles.floatingOrb} />
          </View>
        </View>

        <View style={styles.gameContent}>
          <View style={styles.gameHeader}>
            <View style={styles.headerGlow}>
              <Text style={styles.gameTitle}>⚡ REFLEK CEPAT</Text>
              <View style={styles.subtitleContainer}>
                <View style={styles.glowLine} />
                <Text style={styles.gameDescription}>
                  TEKAN SECEPAT MUNGKIN SETELAH HIJAU!
                </Text>
                <View style={styles.glowLine} />
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>SKOR</Text>
                <Text style={styles.statValue}>{score}</Text>
                <View style={styles.statLine} />
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>WAKTU</Text>
                <Text style={styles.statValue}>{formatTime(gameTimer)}</Text>
                <View style={styles.statLine} />
              </View>
            </View>
          </View>

          <View style={styles.reactionGameContainer}>
            <View style={styles.holoBorder1} />
            <View style={styles.holoBorder2} />
            <View style={styles.holoBorder3} />
            
            <TouchableOpacity
              style={[
                styles.reactionCircle,
                reactionReady && styles.reactionCircleReady
              ]}
              onPress={handleReactionPress}
              activeOpacity={0.9}
            >
              {reactionReady && <View style={styles.reactionCircleGlow} />}
              <Text style={[
                styles.reactionText,
                reactionReady && styles.reactionTextReady
              ]}>
                {reactionReady ? 'TEKAN SEKARANG!' : 'TUNGGU…'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.endGameButton} onPress={endGame} activeOpacity={0.8}>
            <LinearGradient
              colors={['#ff6b6b', '#ee5a52']}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonGlow} />
              <Text style={styles.endGameText}>SELESAI</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Main Games Menu
  return (
    <LinearGradient colors={['#0f0c29', '#24243e', '#313862']} style={styles.container}>
      <View style={styles.backgroundElements}>
        <View style={[styles.floatingElement, { top: 100, left: 30, opacity: 0.1 }]}>
          <View style={styles.floatingOrb} />
        </View>
        <View style={[styles.floatingElement, { top: 250, right: 50, opacity: 0.08 }]}>
          <View style={styles.floatingOrb} />
        </View>
        <View style={[styles.floatingElement, { bottom: 200, left: 60, opacity: 0.06 }]}>
          <View style={styles.floatingOrb} />
        </View>
        <View style={[styles.floatingElement, { bottom: 300, right: 40, opacity: 0.05 }]}>
          <View style={styles.floatingOrb} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerGlow}>
            <Text style={styles.appTitle}>🎮 MINI GAMES</Text>
            <Text style={styles.appSubtitle}>NEURAL TRAINING</Text>
          </View>
          
          <View style={styles.subtitleContainer}>
            <View style={styles.glowLine} />
            <Text style={styles.subtitle}>
              PERMAINAN UNTUK MELATIH FOKUS & KETENANGAN
            </Text>
            <View style={styles.glowLine} />
          </View>
        </View>

        <View style={styles.gamesContainer}>
          {/* Pattern Game */}
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => startGame('pattern')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.gameCardGradient}
            >
              <View style={styles.gameCardGlow} />
              <View style={styles.gameCardBorder1} />
              <View style={styles.gameCardBorder2} />
              
              <View style={styles.gameIcon}>
                <View style={styles.iconGlow} />
                <Text style={styles.gameEmoji}>🧩</Text>
              </View>
              
              <Text style={styles.gameCardTitle}>GAME POLA</Text>
              <Text style={styles.gameCardDescription}>
                Cari kotak hijau yang muncul secara acak
              </Text>
              
              <View style={styles.gameCardFooter}>
                <View style={styles.playIconGlow} />
                <Play size={16} color="#FFFFFF" />
                <Text style={styles.playText}>MULAI MAIN</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Reaction Game */}
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => startGame('reaction')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.gameCardGradient}
            >
              <View style={styles.gameCardGlow} />
              <View style={styles.gameCardBorder1} />
              <View style={styles.gameCardBorder2} />
              
              <View style={styles.gameIcon}>
                <View style={styles.iconGlow} />
                <Text style={styles.gameEmoji}>⚡</Text>
              </View>
              
              <Text style={styles.gameCardTitle}>REFLEK CEPAT</Text>
              <Text style={styles.gameCardDescription}>
                Tunggu hijau, lalu tekan secepat mungkin
              </Text>
              
              <View style={styles.gameCardFooter}>
                <View style={styles.playIconGlow} />
                <Play size={16} color="#FFFFFF" />
                <Text style={styles.playText}>MULAI MAIN</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Meditation Game */}
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() =>
              Alert.alert('🧘‍♂️ Meditasi Visual', 'Fitur ini akan segera hadir!')
            }
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
              style={styles.gameCardGradient}
            >
              <View style={styles.gameCardBorder1} />
              
              <View style={styles.gameIcon}>
                <Text style={[styles.gameEmoji, styles.gameEmojiDisabled]}>🧘‍♂️</Text>
              </View>
              
              <Text style={[styles.gameCardTitle, styles.gameCardTitleDisabled]}>MEDITASI VISUAL</Text>
              <Text style={[styles.gameCardDescription, styles.gameCardDescriptionDisabled]}>
                Ikuti gerakan visual untuk menenangkan pikiran
              </Text>
              
              <View style={styles.gameCardFooter}>
                <Clock size={16} color="#9CA3AF" />
                <Text style={styles.comingSoonText}>SEGERA HADIR</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

// ==========================
// Enhanced Styles
// ==========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingElement: {
    position: 'absolute',
  },
  floatingOrb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
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
  gamesContainer: {
    flex: 1,
    width: '100%',
  },
  gameCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gameCardGradient: {
    padding: 25,
    position: 'relative',
  },
  gameCardGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: '#FFFFFF',
    opacity: 0.05,
    borderRadius: 25,
  },
  gameCardBorder1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  gameCardBorder2: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gameIcon: {
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    opacity: 0.1,
  },
  gameEmoji: {
    fontSize: 32,
  },
  gameEmojiDisabled: {
    opacity: 0.5,
  },
  gameCardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  gameCardTitleDisabled: {
    color: '#9CA3AF',
  },
  gameCardDescription: {
    fontSize: 14,
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  gameCardDescriptionDisabled: {
    color: '#6B7280',
  },
  gameCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  playIconGlow: {
    position: 'absolute',
    left: -5,
    top: -5,
    width: 26,
    height: 26,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    opacity: 0.2,
  },
  playText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 1,
  },
  comingSoonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
    letterSpacing: 1,
  },

  // Game Content Styles
  gameContent: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  gameHeader: {
    alignItems: 'center',
    marginBottom: 50,
    width: '100%',
  },
  gameTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 3,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  gameDescription: {
    fontSize: 12,
    color: '#E2E8F0',
    textAlign: 'center',
    letterSpacing: 1,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    position: 'relative',
  },
  statLabel: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  statLine: {
    width: 40,
    height: 2,
    backgroundColor: '#FFD700',
    marginTop: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },

  // Pattern Game Styles
  patternGameContainer: {
    position: 'relative',
    marginBottom: 40,
    alignItems: 'center',
    padding: 30,
  },
  patternGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 200,
  },
  patternButton: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
  },
  patternButtonActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderColor: '#22C55E',
  },
  patternButtonGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: '#22C55E',
    borderRadius: 17,
    opacity: 0.3,
  },
  patternButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  patternButtonTextActive: {
    color: '#FFFFFF',
    textShadowColor: '#22C55E',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Reaction Game Styles
  reactionGameContainer: {
    position: 'relative',
    marginBottom: 40,
    alignItems: 'center',
    padding: 50,
  },
  reactionCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 2,
    borderColor: '#EF4444',
    position: 'relative',
  },
  reactionCircleReady: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderColor: '#22C55E',
  },
  reactionCircleGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#22C55E',
    borderRadius: 110,
    opacity: 0.3,
  },
  reactionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  reactionTextReady: {
    textShadowColor: '#22C55E',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Holographic Borders
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

  // Button Styles
  endGameButton: {
    borderRadius: 15,
    overflow: 'hidden',
    width: '80%',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    position: 'relative',
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
  endGameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});