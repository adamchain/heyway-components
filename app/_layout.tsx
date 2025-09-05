/*
 * CHANGES:
 * - Added AuthProvider to wrap the entire app
 * - Enhanced error boundary for authentication errors
 * - Added better logging for debugging CORS and connection issues
 * - Maintained required useFrameworkReady hook
 * - ADDED AuthGuard for automatic navigation based on auth state
 */

import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CustomSplashScreen from '../components/SplashScreen';

SplashScreen.preventAutoHideAsync();

// Create QueryClient outside component to avoid recreation on rerenders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// AuthGuard component to handle navigation based on auth state
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    try {
      console.log('🔐 AuthGuard - Auth state:', { isAuthenticated, isLoading, segments });

      if (isLoading) {
        console.log('⏳ AuthGuard - Still loading, waiting...');
        return; // Don't navigate while loading
      }

      const inAuthGroup = segments[0] === 'auth';
      const inTabsGroup = segments[0] === '(tabs)';
      const isRootRoute = !segments[0] || segments[0] === undefined;

      console.log('🔐 AuthGuard - Navigation check:', {
        inAuthGroup,
        inTabsGroup,
        isRootRoute,
        isAuthenticated,
        currentSegments: segments
      });

      if (!isAuthenticated && !inAuthGroup) {
        // User is not authenticated and not in auth screens, redirect to register
        console.log('🚀 AuthGuard - Redirecting to register');
        router.replace('/auth/register');
      } else if (isAuthenticated && inAuthGroup) {
        // User is authenticated but in auth screens, redirect to main app
        console.log('🚀 AuthGuard - Redirecting to main app');
        router.replace('/(tabs)/home');
      } else if (isAuthenticated && isRootRoute) {
        // User is authenticated and at root, redirect to main app
        console.log('🚀 AuthGuard - Redirecting authenticated user to main app');
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      console.error('❌ AuthGuard error:', error);
      // Fallback: redirect to register if there's an error
      try {
        router.replace('/auth/register');
      } catch (routerError) {
        console.error('❌ Router error:', routerError);
      }
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return <>{children}</>;
}

// App initialization component
function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isAppReady, setIsAppReady] = useState(false);
  const { isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    // Simple initialization without any service calls
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing app...');
        
        // No service initialization - just basic app setup
        console.log('✅ App initialization complete (services disabled)');
      } catch (error) {
        console.error('❌ App initialization failed:', error);
      } finally {
        // Add a minimum delay to ensure splash screen is visible
        setTimeout(() => {
          setIsAppReady(true);
        }, 1500);
      }
    };

    initializeApp();
  }, []);

  // Show splash screen while app is initializing or auth is loading
  if (!isAppReady || isAuthLoading) {
    return <CustomSplashScreen visible={true} />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show splash screen until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return <CustomSplashScreen visible={true} />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppInitializer>
            <AuthGuard>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="light" />
            </AuthGuard>
          </AppInitializer>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

