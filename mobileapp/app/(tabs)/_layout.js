// ─── TheChatNest Mobile — Tab Bar Layout ───────────────────────────
//
// Floating glass tab bar in navy with gold active state. Custom icon
// pill that lifts the active tab. Unread badge in gold.

import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useSocket from '../../src/hooks/useSocket';
import { brand, colors } from '../../src/theme/colors';

const TabIcon = ({ name, focused }) => {
  const baseName = name.replace('-outline', '');
  const iconName = focused ? baseName : name;
  return (
    <View style={[st.iconWrap, focused && st.iconWrapActive]}>
      <Ionicons
        name={iconName}
        size={22}
        color={focused ? brand.goldInk : 'rgba(255,255,255,0.55)'}
      />
    </View>
  );
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);
  const { on } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsub = on('notification', () => setUnreadCount(c => c + 1));
    return () => unsub?.();
  }, [on]);

  const tabBarHeight = 60 + bottomPad;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brand.gold,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.55)',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(11,15,30,0.92)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.06)',
          height: tabBarHeight,
          paddingBottom: bottomPad,
          paddingTop: 10,
          paddingHorizontal: 8,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
            },
            android: { elevation: 16 },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          marginTop: 2,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: brand.gold,
            color: brand.goldInk,
            fontSize: 10,
            fontWeight: '900',
            minWidth: 18,
            height: 18,
            lineHeight: 16,
            borderWidth: 1.5,
            borderColor: brand.navy,
          },
          tabBarIcon: ({ focused }) => <TabIcon name="chatbubbles-outline" focused={focused} />,
        }}
        listeners={{ tabPress: () => setUnreadCount(0) }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'People',
          tabBarIcon: ({ focused }) => <TabIcon name="people-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="person-outline" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const st = StyleSheet.create({
  iconWrap: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: brand.gold,
    ...Platform.select({
      ios: {
        shadowColor: brand.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
});
