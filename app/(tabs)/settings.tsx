import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Info,
  Heart,
  Trash2,
  TrendingUp,
  Target
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SettingsTab() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [totalDays, setTotalDays] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    loadSettings();
    loadStats();
    generateChartData();
  }, []);

  // Custom Chart Components
  const CustomLineChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.sessions));
    const chartHeight = 120;
    const chartWidth = width - 120;
    const pointSpacing = chartWidth / (data.length - 1);

    return (
      <View style={styles.customChart}>
        {/* Chart background grid */}
        <View style={styles.chartGrid}>
          {[...Array(4)].map((_, i) => (
            <View key={i} style={[styles.gridLine, { top: (i * chartHeight) / 3 }]} />
          ))}
        </View>

        {/* Line and points */}
        <View style={styles.chartLine}>
          {data.map((point, index) => {
            const x = index * pointSpacing;
            const y = chartHeight - (point.sessions / maxValue) * chartHeight;
            
            return (
              <View key={index}>
                {/* Data point */}
                <View 
                  style={[
                    styles.chartPoint,
                    { 
                      left: x - 6,
                      top: y - 6,
                    }
                  ]}
                >
                  <View style={styles.chartPointGlow} />
                </View>
                
                {/* Line to next point */}
                {index < data.length - 1 && (
                  <View
                    style={[
                      styles.chartSegment,
                      {
                        left: x,
                        top: y,
                        width: Math.sqrt(
                          Math.pow(pointSpacing, 2) + 
                          Math.pow((chartHeight - (data[index + 1].sessions / maxValue) * chartHeight) - y, 2)
                        ),
                        transform: [{
                          rotate: `${Math.atan2(
                            (chartHeight - (data[index + 1].sessions / maxValue) * chartHeight) - y,
                            pointSpacing
                          ) * 180 / Math.PI}deg`
                        }]
                      }
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* X-axis labels */}
        <View style={styles.chartLabels}>
          {data.map((point, index) => (
            <Text key={index} style={[styles.chartLabel, { left: (index * pointSpacing) - 10 }]}>
              {point.name}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const CustomProgressRing = ({ percentage, size = 80 }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference * (1 - percentage / 100);

    return (
      <View style={[styles.progressRing, { width: size, height: size }]}>
        {/* Background circle */}
        <View 
          style={[
            styles.progressRingBg, 
            { 
              width: size - 8, 
              height: size - 8, 
              borderRadius: (size - 8) / 2,
              borderWidth: 4,
            }
          ]} 
        />
        
        {/* Progress circle */}
        <View 
          style={[
            styles.progressRingFill, 
            { 
              width: size - 8, 
              height: size - 8, 
              borderRadius: (size - 8) / 2,
              borderWidth: 4,
              transform: [{ rotate: '-90deg' }]
            }
          ]} 
        />
        
        {/* Center content */}
        <View style={styles.progressRingCenter}>
          <Text style={styles.progressPercentage}>{Math.round(percentage)}%</Text>
        </View>
      </View>
    );
  };

  const loadSettings = async () => {
    try {
      const sound = await AsyncStorage.getItem('soundEnabled');
      const notif = await AsyncStorage.getItem('notifications');

      if (sound !== null) setSoundEnabled(JSON.parse(sound));
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

  const generateChartData = () => {
    // Generate weekly progress data
    const weekly = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      weekly.push({
        name: date.toLocaleDateString('id-ID', { weekday: 'short' }),
        sessions: Math.floor(Math.random() * 5) + 1,
      });
    }
    setWeeklyData(weekly);

    // Generate progress pie chart data
    const progress = [
      { name: 'Selesai', value: totalSessions || 15, color: '#22C55E' },
      { name: 'Target', value: Math.max(0, 30 - (totalSessions || 15)), color: '#374151' },
    ];
    setProgressData(progress);
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
              generateChartData();
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

     <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: 98 }]} // 🔹 tambah jarak bawah
           showsVerticalScrollIndicator={true}
            >

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
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerGlow}>
            <Text style={styles.appTitle}>⚙️ PENGATURAN</Text>
            <Text style={styles.appSubtitle}>SYSTEM CONTROL</Text>
          </View>
          
          <View style={styles.subtitleContainer}>
            <View style={styles.glowLine} />
            <Text style={styles.subtitle}>
              KUSTOMISASI PENGALAMAN APLIKASIMU
            </Text>
            <View style={styles.glowLine} />
          </View>
        </View>

        {/* Statistics Section with Charts */}
        <View style={styles.section}>
          <View style={styles.holoBorder1} />
          <View style={styles.holoBorder2} />
          <View style={styles.sectionGlow} />
          
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>STATISTIK NEURAL</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statCardGlow} />
              <View style={styles.statIcon}>
                <View style={styles.iconGlow} />
                <Target size={24} color="#22C55E" />
              </View>
              <Text style={styles.statNumber}>{totalDays}</Text>
              <Text style={styles.statLabel}>HARI AKTIF</Text>
              <View style={styles.statLine} />
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statCardGlow} />
              <View style={styles.statIcon}>
                <View style={styles.iconGlow} />
                <Heart size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statNumber}>{totalSessions}</Text>
              <Text style={styles.statLabel}>TOTAL SESI</Text>
              <View style={styles.statLine} />
            </View>
          </View>

          {/* Weekly Progress Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>PROGRES MINGGUAN</Text>
            </View>
            <View style={styles.chartWrapper}>
              <CustomLineChart data={weeklyData} />
            </View>
          </View>

          {/* Progress Ring */}
          <View style={styles.progressContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>TARGET BULANAN</Text>
            </View>
            <View style={styles.progressRingContainer}>
              <CustomProgressRing 
                percentage={(totalSessions / 30) * 100} 
                size={100}
              />
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  {totalSessions}/30 SESI
                </Text>
                <Text style={styles.progressSubtext}>
                  TERCAPAI BULAN INI
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <View style={styles.holoBorder1} />
          <View style={styles.holoBorder2} />
          <View style={styles.sectionGlow} />
          
          <View style={styles.sectionHeader}>
            <Volume2 size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>PREFERENSI SISTEM</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                <View style={styles.settingIconGlow} />
                {soundEnabled ? (
                  <Volume2 size={20} color="#FFFFFF" />
                ) : (
                  <VolumeX size={20} color="#FFFFFF" />
                )}
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>AUDIO & SUARA</Text>
                <Text style={styles.settingDescription}>
                  Aktifkan feedback audio neural
                </Text>
              </View>
            </View>
            <View style={styles.switchContainer}>
              <View style={styles.switchGlow} />
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#22C55E' }}
                thumbColor={soundEnabled ? '#FFFFFF' : '#9CA3AF'}
                ios_backgroundColor="rgba(255,255,255,0.2)"
              />
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                <View style={styles.settingIconGlow} />
                <Heart size={20} color="#FFFFFF" />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>NOTIFIKASI MOTIVASI</Text>
                <Text style={styles.settingDescription}>
                  Pengingat konsistensi harian
                </Text>
              </View>
            </View>
            <View style={styles.switchContainer}>
              <View style={styles.switchGlow} />
              <Switch
                value={notifications}
                onValueChange={toggleNotifications}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#F59E0B' }}
                thumbColor={notifications ? '#FFFFFF' : '#9CA3AF'}
                ios_backgroundColor="rgba(255,255,255,0.2)"
              />
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <View style={styles.holoBorder1} />
          <View style={styles.holoBorder2} />
          <View style={styles.sectionGlow} />
          
          <View style={styles.sectionHeader}>
            <RotateCcw size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>KONTROL SISTEM</Text>
          </View>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={resetProgress}
            activeOpacity={0.8}
          >
            <View style={styles.actionButtonGlow} />
            <View style={styles.actionIconContainer}>
              <Trash2 size={20} color="#EF4444" />
            </View>
            <Text style={[styles.actionText, styles.dangerText]}>
              RESET SEMUA DATA
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={showAbout}
            activeOpacity={0.8}
          >
            <View style={styles.actionButtonGlow} />
            <View style={styles.actionIconContainer}>
              <Info size={20} color="#6366F1" />
            </View>
            <Text style={[styles.actionText, styles.primaryText]}>
              TENTANG APLIKASI
            </Text>
          </TouchableOpacity>
        </View>

        {/* Neural Quote Section */}
        <View style={styles.quoteSection}>
          <View style={styles.holoBorder1} />
          <View style={styles.quoteGlow} />
          <Text style={styles.quoteText}>
            "KONSISTENSI ADALAH ALGORITMA KEUNGGULAN. EKSEKUSI HARIAN MENCIPTAKAN TRANSFORMASI EKSPONENSIAL."
          </Text>
          <Text style={styles.quoteAuthor}>- NEURAL PROTOCOL</Text>
        </View>
      </View>
      
    </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerGlow: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 4,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  appSubtitle: {
    fontSize: 16,
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
    fontSize: 11,
    color: '#E2E8F0',
    textAlign: 'center',
    letterSpacing: 1,
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'rgba(15, 12, 41, 0.8)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sectionGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: '#FFFFFF',
    opacity: 0.05,
    borderRadius: 25,
  },
  holoBorder1: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  holoBorder2: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginLeft: 10,
    letterSpacing: 2,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  statCardGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: '#FFFFFF',
    opacity: 0.05,
    borderRadius: 17,
  },
  statIcon: {
    marginBottom: 10,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: '#FFFFFF',
    opacity: 0.2,
    borderRadius: 20,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  statLine: {
    width: 30,
    height: 2,
    backgroundColor: '#FFD700',
    marginTop: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  chartContainer: {
    marginTop: 20,
  },
  chartHeader: {
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 1,
    textAlign: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  // Custom Chart Styles
  customChart: {
    height: 150,
    width: width - 120,
    position: 'relative',
  },
  chartGrid: {
    position: 'absolute',
    width: '100%',
    height: 120,
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  chartLine: {
    position: 'relative',
    height: 120,
  },
  chartPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 2,
  },
  chartPointGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: '#22C55E',
    borderRadius: 10,
    opacity: 0.3,
  },
  chartSegment: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    transformOrigin: 'left center',
  },
  chartLabels: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 30,
  },
  chartLabel: {
    position: 'absolute',
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
    width: 20,
    textAlign: 'center',
  },

  // Progress Ring Styles
  progressContainer: {
    marginTop: 25,
  },
  progressRingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressRing: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRingBg: {
    position: 'absolute',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  progressRingFill: {
    position: 'absolute',
    borderColor: '#22C55E',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressRingCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22C55E',
    letterSpacing: 1,
    marginBottom: 5,
  },
  progressSubtext: {
    fontSize: 11,
    color: '#E2E8F0',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Settings Styles
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    position: 'relative',
    marginRight: 15,
  },
  settingIconGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: '#FFFFFF',
    opacity: 0.1,
    borderRadius: 15,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 12,
    color: '#E2E8F0',
    letterSpacing: 0.5,
  },
  switchContainer: {
    position: 'relative',
  },
  switchGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: '#FFFFFF',
    opacity: 0.05,
    borderRadius: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  actionButtonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    opacity: 0.02,
    borderRadius: 10,
  },
  actionIconContainer: {
    marginRight: 15,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dangerText: {
    color: '#EF4444',
  },
  primaryText: {
    color: '#6366F1',
  },
  quoteSection: {
    backgroundColor: 'rgba(15, 12, 41, 0.6)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  quoteGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    backgroundColor: '#FFD700',
    opacity: 0.1,
    borderRadius: 23,
  },
  quoteText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 15,
  },
  quoteAuthor: {
    fontSize: 12,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 2,
  },
});