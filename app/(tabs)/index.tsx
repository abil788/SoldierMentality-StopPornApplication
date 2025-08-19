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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shield, Trophy, RotateCcw } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function HomeTab() {
  const [currentDay, setCurrentDay] = useState(1);
  const [lastCommitDate, setLastCommitDate] = useState<string | null>(null);
  const [hasCommittedToday, setHasCommittedToday] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

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

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#a8e6cf']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Soldier Mentality</Text>
          <Text style={styles.subtitle}>Membangun Konsistensi Harian</Text>
        </View>

        {/* Day Counter */}
        <View style={styles.dayContainer}>
          <Shield size={40} color="#FFFFFF" style={styles.shieldIcon} />
          <Text style={styles.dayText}>Hari ke-</Text>
          <Text style={styles.dayNumber}>{currentDay}</Text>
        </View>

        {/* Progress Message */}
        <Text style={styles.progressMessage}>{getDayMessage()}</Text>

        {/* Stats Container */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Trophy size={24} color="#FFD700" />
            <Text style={styles.statLabel}>Streak Terbaik</Text>
            <Text style={styles.statValue}>{currentDay}</Text>
          </View>
        </View>

        {/* Commitment Buttons */}
        {!hasCommittedToday && (
          <View style={styles.buttonContainer}>
            <Text style={styles.commitmentTitle}>
              Bagaimana hari mu hari ini, pejuang?
            </Text>
            
            <TouchableOpacity
              style={[styles.button, styles.commitButton]}
              onPress={() => handleCommitment(true)}
              activeOpacity={0.8}
            >
              <Shield size={20} color="#FFFFFF" />
              <Text style={styles.commitButtonText}>
                Saya Tetap Berkomitmen
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={() => handleCommitment(false)}
              activeOpacity={0.8}
            >
              <RotateCcw size={20} color="#FFFFFF" />
              <Text style={styles.resetButtonText}>
                Saya Perlu Memulai Kembali
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {hasCommittedToday && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>
              ✅ Kamu sudah berkomitmen hari ini!
            </Text>
            <Text style={styles.nextDayText}>
              Kembali lagi besok untuk melanjutkan perjalananmu
            </Text>
          </View>
        )}
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
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
  },
  dayContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 30,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  shieldIcon: {
    marginBottom: 10,
  },
  dayText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dayNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressMessage: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 40,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#E2E8F0',
    marginTop: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  commitmentTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  commitButton: {
    backgroundColor: '#10B981',
  },
  resetButton: {
    backgroundColor: '#EF4444',
  },
  commitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  completedContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  completedText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  nextDayText: {
    fontSize: 14,
    color: '#E2E8F0',
    textAlign: 'center',
  },
});