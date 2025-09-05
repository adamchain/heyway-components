/*
 * CHANGES:
 * - Created auth layout for authentication screens
 * - Stack navigation for login and register screens
 * - Clean navigation without headers
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="register">
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}