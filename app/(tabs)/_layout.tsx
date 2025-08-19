import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Heart, Target, Gamepad2, Settings, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarContainer}>
      {/* Holographic Background */}
      <LinearGradient
        colors={['rgba(15, 12, 41, 0.95)', 'rgba(36, 36, 62, 0.9)', 'rgba(49, 49, 100, 0.85)']}
        locations={[0, 0.5, 1]}
        style={styles.tabBarGradient}
      >
        {/* Glow Effect Background */}
        <View style={styles.glowBackground} />
        
        {/* Top Border Glow */}
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topBorderGlow}
        />
        
        {/* Tab Items */}
        <View style={styles.tabItemsContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            // Get icon component
            const getIcon = () => {
              const iconProps = {
                size: isFocused ? 28 : 24,
                color: isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.6)'
              };
              
              switch (route.name) {
                case 'index':
                  return <Heart {...iconProps} />;
                case 'focus':
                  return <Target {...iconProps} />;
                case 'games':
                  return <Gamepad2 {...iconProps} />;
                case 'settings':
                  return <Settings {...iconProps} />;
                default:
                  return <Heart {...iconProps} />;
              }
            };

            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[styles.tabItem, isFocused && styles.activeTabItem]}
                activeOpacity={0.7}
              >
                {/* Active Tab Background */}
                {isFocused && (
                  <>
                    <LinearGradient
                      colors={['#00F260', '#0575E6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.activeTabBackground}
                    />
                    <View style={styles.activeTabGlow} />
                    <View style={styles.activeTabBorder} />
                  </>
                )}
                
                {/* Icon Container */}
                <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                  {getIcon()}
                  {isFocused && <View style={styles.iconGlow} />}
                </View>
                
                {/* Label */}
                <Text style={[
                  styles.tabLabel,
                  isFocused && styles.activeTabLabel
                ]}>
                  {label}
                </Text>
                
                {/* Active Indicator */}
                {isFocused && (
                  <>
                    <View style={styles.activeIndicator} />
                    <LinearGradient
                      colors={['transparent', '#00F260', 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.activeIndicatorGlow}
                    />
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Floating Elements */}
        <View style={styles.floatingElement1}>
          <Zap size={8} color="rgba(255,255,255,0.1)" />
        </View>
        <View style={styles.floatingElement2}>
          <Zap size={6} color="rgba(255,255,255,0.08)" />
        </View>
      </LinearGradient>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'BERANDA',
          tabBarIcon: ({ size, color }) => (
            <Heart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'FOKUS',
          tabBarIcon: ({ size, color }) => (
            <Target size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'GAMES',
          tabBarIcon: ({ size, color }) => (
            <Gamepad2 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTING',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const { TouchableOpacity } = require('react-native');

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  tabBarGradient: {
    flex: 1,
    position: 'relative',
    paddingBottom: 20,
    paddingTop: 15,
    paddingHorizontal: 10,
  },
  glowBackground: {
    position: 'absolute',
    top: -20,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 30,
  },
  topBorderGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  tabItemsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    position: 'relative',
    borderRadius: 15,
  },
  activeTabItem: {
    transform: [{ scale: 1.05 }],
  },
  activeTabBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 15,
    opacity: 0.8,
  },
  activeTabGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    backgroundColor: 'rgba(0, 242, 96, 0.3)',
    borderRadius: 18,
    opacity: 0.6,
  },
  activeTabBorder: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
    padding: 2,
  },
  activeIconContainer: {
    transform: [{ scale: 1.1 }],
  },
  iconGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    opacity: 0.15,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: '#00F260',
    borderRadius: 1,
  },
  activeIndicatorGlow: {
    position: 'absolute',
    bottom: -4,
    left: '15%',
    right: '15%',
    height: 1,
  },
  floatingElement1: {
    position: 'absolute',
    top: 20,
    left: 30,
  },
  floatingElement2: {
    position: 'absolute',
    top: 35,
    right: 40,
  },
});