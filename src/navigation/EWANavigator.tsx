import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EWADashboardScreen } from '../screens/ewa/EWADashboardScreen';
import { EWAWithdrawScreen } from '../screens/ewa/EWAWithdrawScreen';
import { EWAHistoryScreen } from '../screens/ewa/EWAHistoryScreen';
import { EWAProfileScreen } from '../screens/ewa/EWAProfileScreen';

export type EWAStackParamList = {
  EWADashboard: undefined;
  EWAWithdraw: undefined;
  EWAHistory: undefined;
  EWAProfile: undefined;
};

const Stack = createNativeStackNavigator<EWAStackParamList>();

export function EWANavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EWADashboard" component={EWADashboardScreen} />
      <Stack.Screen
        name="EWAWithdraw"
        component={EWAWithdrawScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="EWAHistory" component={EWAHistoryScreen} />
      <Stack.Screen name="EWAProfile" component={EWAProfileScreen} />
    </Stack.Navigator>
  );
}
