// ─── TheChatNest Mobile — Bottom Tab Bar ───────────────────────────
//
// Custom floating pill tab bar. Active tab shows gold tile + bold label,
// inactive tabs show only the icon. Sits above content with a margin so
// it feels like a floating dock, not a stuck-to-bottom strip.

import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import useSocket from '../../src/hooks/useSocket';
import { brand } from '../../src/theme/colors';

const TABS = [
  { name: 'chats',    label: 'Chats',   icon: 'chatbubbles' },
  { name: 'contacts', label: 'People',  icon: 'people' },
  { name: 'profile',  label: 'Profile', icon: 'person' },
];

function CustomTabBar({ state, navigation, unreadCount, setUnreadCount }) {
  const insets = useSafeAreaInsets();
  const bottomGap = Math.max(insets.bottom - 4, 10);

  return (
    <View
      pointerEvents="box-none"
      style={[st.barWrap, { bottom: bottomGap }]}
    >
      <View style={st.bar}>
        {state.routes.map((route, index) => {
          const tab = TABS.find((t) => t.name === route.name);
          if (!tab) return null;

          const isFocused = state.index === index;
          const showBadge = route.name === 'chats' && unreadCount > 0;

          const onPress = () => {
            try { Haptics.selectionAsync(); } catch {}
            if (route.name === 'chats') setUnreadCount(0);
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={tab.label}
              onPress={onPress}
              hitSlop={8}
              style={({ pressed }) => [
                st.tab,
                isFocused && st.tabActive,
                pressed && !isFocused && { opacity: 0.7 },
              ]}
            >
              <View style={{ position: 'relative' }}>
                <Ionicons
                  name={isFocused ? tab.icon : `${tab.icon}-outline`}
                  size={22}
                  color={isFocused ? brand.goldInk : 'rgba(255,255,255,0.6)'}
                />
                {showBadge && (
                  <View style={st.badge}>
                    <Text style={st.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              {isFocused && (
                <Text style={st.tabLabel} numberOfLines={1}>
                  {tab.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { on } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsub = on('notification', () => setUnreadCount((c) => c + 1));
    return () => unsub?.();
  }, [on]);

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <CustomTabBar
          {...props}
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
        />
      )}
    >
      <Tabs.Screen name="chats" />
      <Tabs.Screen name="contacts" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const BAR_HEIGHT = 64;

const st = StyleSheet.create({
  barWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: BAR_HEIGHT,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(17,22,42,0.97)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,213,74,0.12)',
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
      },
      android: { elevation: 18 },
    }),
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    minWidth: 56,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: brand.gold,
    paddingHorizontal: 18,
    ...Platform.select({
      ios: {
        shadowColor: brand.gold,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
    }),
  },
  tabLabel: {
    color: brand.goldInk,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: brand.gold,
    borderWidth: 1.5,
    borderColor: '#11162a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: brand.goldInk,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 12,
  },
});
