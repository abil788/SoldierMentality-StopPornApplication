import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, RefreshCw, Star, Clock } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type GameType = 'pattern' | 'reaction' | 'meditation' | null;

export default function GamesTab() {
  const [currentGame, setCurrentGame] = useState<GameType>(null);
  const [score, setScore] = useState(0);
  const [gameTimer, setGameTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  
  // Pattern Game State
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [showingPattern, setShowingPattern] = useState(false);
  
  // Reaction Game State
  const [reactionReady, setReactionReady] = useState(false);
  const [reactionStartTime, setReactionStartTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameActive) {
      interval = setInterval(() => {
        setGameTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameActive]);

  const startGame = (gameType: GameType) => {
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
    setCurrentGame(null);
    setIsGameActive(false);
    setGameTimer(0);
    setPattern([]);
    setUserPattern([]);
    setReactionReady(false);
    
    if (score > 0) {
      Alert.alert(
        '🎮 Permainan Selesai!',
        `Skor akhir: ${score}\nWaktu: ${formatTime(gameTimer)}\n\nPermainan mini ini membantu melatih fokus dan ketenangan pikiranmu.`,
        [{ text: 'Baik', style: 'default' }]
      );
    }
  };

  // Pattern Game Logic
  const startPatternGame = () => {
    const newPattern = generatePattern(3);
    setPattern(newPattern);
    setUserPattern([]);
    showPattern(newPattern);
  };

  const generatePattern = (length: number): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * 4));
  };

  const showPattern = (patternToShow: number[]) => {
    setShowingPattern(true);
    setTimeout(() => {
      setShowingPattern(false);
    }, patternToShow.length * 800 + 500);
  };

  const handlePatternPress = (index: number) => {
    if (showingPattern) return;
    
    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);
    
    // Check if current input is correct
    if (pattern[newUserPattern.length - 1] !== index) {
      // Wrong pattern
      Alert.alert('❌ Tidak Tepat', 'Pola tidak sesuai. Coba lagi!');
      startPatternGame(); // Restart with same difficulty
      return;
    }
    
    // Check if pattern is complete
    if (newUserPattern.length === pattern.length) {
      setScore(prev => prev + 1);
      setTimeout(() => {
        startPatternGame(); // Start new round
      }, 1000);
    }
  };

  // Reaction Game Logic
  const startReactionGame = () => {
    setReactionReady(false);
    const delay = Math.random() * 3000 + 2000; // 2-5 seconds
    
    setTimeout(() => {
      setReactionReady(true);
      setReactionStartTime(Date.now());
    }, delay);
  };

  const handleReactionPress = () => {
    if (!reactionReady) {
      Alert.alert('🐢 Terlalu Cepat!', 'Tunggu hingga lingkaran berubah hijau.');
      return;
    }
    
    const reactionTime = Date.now() - reactionStartTime;
    setScore(prev => prev + 1);
    
    Alert.alert(
      '⚡ Bagus!',
      `Waktu reaksi: ${reactionTime}ms\n\nSemakin lambat dan terkontrol reaksimu, semakin baik!`,
      [
        {
          text: 'Lanjut',
          onPress: () => startReactionGame(),
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentGame === 'pattern') {
    return (
      <LinearGradient colors={['#ffd89b', '#19547b']} style={styles.container}>
        <View style={styles.gameContent}>
          <View style={styles.gameHeader}>
            <Text style={styles.gameTitle}>🧩 Game Pola</Text>
            <Text style={styles.gameDescription}>
              Ingat dan ulangi pola yang ditampilkan
            </Text>
            <View style={styles.gameStats}>
              <Text style={styles.statText}>Skor: {score}</Text>
              <Text style={styles.statText}>Waktu: {formatTime(gameTimer)}</Text>
            </View>
          </View>

          <View style={styles.patternGrid}>
            {[0, 1, 2, 3].map((index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.patternButton,
                  {
                    backgroundColor: showingPattern && pattern.includes(index)
                      ? '#10B981' : userPattern.includes(index)
                      ? '#6366F1' : '#E5E7EB',
                  },
                ]}
                onPress={() => handlePatternPress(index)}
                disabled={showingPattern}
              >
                <Text style={styles.patternButtonText}>{index + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.endGameButton} onPress={endGame}>
            <Text style={styles.endGameText}>Selesai</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (currentGame === 'reaction') {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.gameContent}>
          <View style={styles.gameHeader}>
            <Text style={styles.gameTitle}>⚡ Game Reaksi Lambat</Text>
            <Text style={styles.gameDescription}>
              Tekan lingkaran HANYA saat berubah hijau
            </Text>
            <View style={styles.gameStats}>
              <Text style={styles.statText}>Skor: {score}</Text>
              <Text style={styles.statText}>Waktu: {formatTime(gameTimer)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.reactionCircle,
              { backgroundColor: reactionReady ? '#10B981' : '#EF4444' },
            ]}
            onPress={handleReactionPress}
          >
            <Text style={styles.reactionText}>
              {reactionReady ? 'TEKAN SEKARANG!' : 'TUNGGU...'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.endGameButton} onPress={endGame}>
            <Text style={styles.endGameText}>Selesai</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Main Games Menu
  return (
    <LinearGradient colors={['#a18cd1', '#fbc2eb']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🎮 Mini Games</Text>
          <Text style={styles.subtitle}>
            Permainan sederhana untuk melatih fokus dan ketenangan
          </Text>
        </View>

        <View style={styles.gamesContainer}>
          {/* Pattern Game */}
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => startGame('pattern')}
            activeOpacity={0.8}
          >
            <View style={styles.gameIcon}>
              <Text style={styles.gameEmoji}>🧩</Text>
            </View>
            <Text style={styles.gameCardTitle}>Game Pola</Text>
            <Text style={styles.gameCardDescription}>
              Latih memori dan konsentrasi dengan mengulangi pola warna
            </Text>
            <View style={styles.gameCardFooter}>
              <Play size={16} color="#6366F1" />
              <Text style={styles.playText}>Mulai Main</Text>
            </View>
          </TouchableOpacity>

          {/* Reaction Game */}
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => startGame('reaction')}
            activeOpacity={0.8}
          >
            <View style={styles.gameIcon}>
              <Text style={styles.gameEmoji}>⚡</Text>
            </View>
            <Text style={styles.gameCardTitle}>Reaksi Lambat</Text>
            <Text style={styles.gameCardDescription}>
              Latih kontrol diri dengan bereaksi pada waktu yang tepat
            </Text>
            <View style={styles.gameCardFooter}>
              <Play size={16} color="#6366F1" />
              <Text style={styles.playText}>Mulai Main</Text>
            </View>
          </TouchableOpacity>

          {/* Meditation Game */}
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => Alert.alert('🧘‍♂️ Meditasi Visual', 'Fitur ini akan segera hadir!')}
            activeOpacity={0.8}
          >
            <View style={styles.gameIcon}>
              <Text style={styles.gameEmoji}>🧘‍♂️</Text>
            </View>
            <Text style={styles.gameCardTitle}>Meditasi Visual</Text>
            <Text style={styles.gameCardDescription}>
              Ikuti gerakan visual yang lambat untuk menenangkan pikiran
            </Text>
            <View style={styles.gameCardFooter}>
              <Clock size={16} color="#9CA3AF" />
              <Text style={styles.comingSoonText}>Segera Hadir</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Manfaat Mini Games</Text>
          <Text style={styles.tipsText}>
            • Membantu mengalihkan perhatian dari distraksi{'\n'}
            • Melatih fokus dan konsentrasi{'\n'}
            • Memberikan jeda yang menyegarkan pikiran{'\n'}
            • Mengembangkan kontrol diri dan kesabaran
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
  },
  gamesContainer: {
    flex: 1,
  },
  gameCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gameIcon: {
    alignItems: 'center',
    marginBottom: 12,
  },
  gameEmoji: {
    fontSize: 32,
  },
  gameCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  gameCardDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  gameCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  comingSoonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  tipsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  // Game Screen Styles
  gameContent: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  gameHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  gameDescription: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 16,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 200,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  patternGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 200,
    marginBottom: 40,
  },
  patternButton: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patternButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  reactionCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  reactionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  endGameButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  endGameText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});