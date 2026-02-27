/**
 * ดาวเทวา — Dao Thewa
 * Thai Horology × Astrology App
 * Root application component
 */

import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {TabNavigator} from './navigation/TabNavigator';
import {Colors} from './theme/colors';

// ─────────────────────────────────────────────
// React Query Client
// Configured for astro data: 6hr stale time
// ─────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 6 * 60 * 60 * 1000, // 6 hours
      gcTime: 12 * 60 * 60 * 1000,   // 12 hours
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// ─────────────────────────────────────────────
// Navigation Theme — deep indigo night sky
// ─────────────────────────────────────────────
const DaoThewaTheme = {
  dark: true,
  colors: {
    primary: Colors.gold.bright,
    background: Colors.bg.deep,
    card: Colors.bg.dark,
    text: Colors.text.primary,
    border: Colors.bg.subtle,
    notification: Colors.gold.warm,
  },
  fonts: {
    regular: {fontFamily: 'System', fontWeight: '400' as const},
    medium: {fontFamily: 'System', fontWeight: '500' as const},
    bold: {fontFamily: 'System', fontWeight: '700' as const},
    heavy: {fontFamily: 'System', fontWeight: '900' as const},
  },
};

// ─────────────────────────────────────────────
// Root App
// ─────────────────────────────────────────────
function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer theme={DaoThewaTheme}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={Colors.bg.deep}
          />
          <View style={styles.root}>
            <TabNavigator />
          </View>
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg.deep,
  },
});

export default App;
