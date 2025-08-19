import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  RotateCcw, 
  Info,
  Heart,
  Trash2
} from 'lucide-react-native';

export default function SettingsTab() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [totalDays, setTotalDays] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const sound = await AsyncStorage.getItem('soundEnabled');
      const dark = await AsyncStorage.getItem('darkMode');
      const notif = await AsyncStorage.getItem('notifications');

      if (sound !== null) setSoundEnabled(JSON.parse(sound));
      if (dark !== null) setDarkMode(JSON.parse(dark));
      if (notif !== null) setNotifications(JSON.parse(notif));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadStats = async () => {
    try {
      const currentDay = await AsyncStorage.getItem('currentDay');
      const sessions = await AsyncStorage.getItem('totalSessions');

      if (currentDay) setTotalDays(parseInt(currentDay, 10));
      if (sessions) setTotalSessions(parseInt(sessions, 10));
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const toggleSound = (value: boolean) => {
    setSoundEnabled(value);
    saveSetting('soundEnabled', value);
  };

  const toggleDarkMode = (value: boolean) => {
    setDarkMode(value);
    saveSetting('darkMode', value);
  };

  const toggleNotifications = (value: boolean) => {
    setNotifications(value);
    saveSetting('notifications', value);
  };

  const resetProgress = () => {
    Alert.alert(
      '⚠️ Reset Progres',
      'Apakah kamu yakin ingin menghapus semua data progres? Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'currentDay',
                'lastCommitDate',
                'totalSessions',
                'bestStreak',
              ]);
              setTotalDays(1);
              setTotalSessions(0);
              Alert.alert('✅ Berhasil', 'Semua data progres telah direset.');
            } catch (error) {
              Alert.alert('❌ Error', 'Gagal mereset data.');
            }
          },
        },
      ]
    );
  };

  const showAbout = () => {
    Alert.alert(
      '🛡️ Soldier Mentality',
      'Versi 1.0.0\n\nAplikasi ini dirancang untuk membantu kamu membangun kebiasaan positif dan meningkatkan fokus melalui konsistensi harian.\n\n• Pelacak konsistensi harian\n• Mini games untuk fokus\n• Latihan pernapasan\n• Antarmuka yang menenangkan\n\nDibuat dengan ❤️ untuk para pejuang yang ingin tumbuh setiap hari.',
      [{ text: 'Tutup', style: 'default' }]
    );
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Pengaturan</Text>
          <Text style={styles.subtitle}>Kustomisasi pengalaman aplikasimu</Text>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Statistik</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalDays}</Text>
              <Text style={styles.statLabel}>Hari Saat Ini</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalSessions}</Text>
              <Text style={styles.statLabel}>Total Sesi</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Preferensi</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              {soundEnabled ? (
                <Volume2 size={20} color="#1F2937" />
              ) : (
                <VolumeX size={20} color="#1F2937" />
              )}
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Audio & Suara</Text>
                <Text style={styles.settingDescription}>
                  Aktifkan suara ambient dan feedback audio
                </Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor={soundEnabled ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              {darkMode ? (
                <Moon size={20} color="#1F2937" />
              ) : (
                <Sun size={20} color="#1F2937" />
              )}
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Mode Gelap</Text>
                <Text style={styles.settingDescription}>
                  Tema gelap untuk kenyamanan mata
                </Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
              thumbColor={darkMode ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Heart size={20} color="#1F2937" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Notifikasi Motivasi</Text>
                <Text style={styles.settingDescription}>
                  Pengingat harian untuk tetap konsisten
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#D1D5DB', true: '#F59E0B' }}
              thumbColor={notifications ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ Tindakan</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={resetProgress}
            activeOpacity={0.8}
          >
            <Trash2 size={20} color="#EF4444" />
            <Text style={[styles.actionText, styles.dangerText]}>
              Reset Semua Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={showAbout}
            activeOpacity={0.8}
          >
            <Info size={20} color="#6366F1" />
            <Text style={[styles.actionText, styles.primaryText]}>
              Tentang Aplikasi
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quote Section */}
        <View style={styles.quoteSection}>
          <Text style={styles.quoteText}>
            "Konsistensi adalah ibu dari keunggulan. Kamu tidak perlu menjadi
            hebat untuk memulai, tapi kamu harus memulai untuk menjadi hebat."
          </Text>
          <Text style={styles.quoteAuthor}>- Zig Ziglar</Text>
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
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  dangerText: {
    color: '#EF4444',
  },
  primaryText: {
    color: '#6366F1',
  },
  quoteSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  quoteText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
});