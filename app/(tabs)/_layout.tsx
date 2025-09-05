import React from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import AuthGuard from '../../components/AuthGuard';
import { HEYWAY_COLORS } from '../../styles/HEYWAY_STYLE_GUIDE';

export default function TabLayout() {
  return (
    <AuthGuard>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
            tabBarActiveTintColor: 'white',
            tabBarInactiveTintColor: '#8E8E93',
            tabBarLabelStyle: { fontSize: 12, fontFamily: 'System', fontWeight: '500', marginTop: 2 },
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              href: '/(tabs)/home',
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              href: null, // hide settings tab
            }}
          />
        </Tabs>
      </View>
    </AuthGuard>
  );
}