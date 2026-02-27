/**
 * ดาวเทวา — Bottom Tab Navigator
 * 5 screens: Clock, Daily Brief, Calendar, Almanac, Watch Face
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';

// Screens (placeholder imports — implemented by Agent 4)
import ClockScreen from '../screens/ClockScreen';
import DailyBriefScreen from '../screens/DailyBriefScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AlmanacScreen from '../screens/AlmanacScreen';
import WatchFaceScreen from '../screens/WatchFaceScreen';

export type RootTabParamList = {
  Clock: undefined;
  DailyBrief: undefined;
  Calendar: undefined;
  Almanac: undefined;
  WatchFace: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

interface TabIconProps {
  symbol: string;
  focused: boolean;
}

function TabIcon({symbol, focused}: TabIconProps) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, focused && styles.iconFocused]}>
        {symbol}
      </Text>
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.gold.bright,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tab.Screen
        name="Clock"
        component={ClockScreen}
        options={{
          tabBarLabel: 'นาฬิกา',
          tabBarIcon: ({focused}) => <TabIcon symbol="🌌" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="DailyBrief"
        component={DailyBriefScreen}
        options={{
          tabBarLabel: 'ทำนาย',
          tabBarIcon: ({focused}) => <TabIcon symbol="✨" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'ปฏิทิน',
          tabBarIcon: ({focused}) => <TabIcon symbol="🗓" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Almanac"
        component={AlmanacScreen}
        options={{
          tabBarLabel: 'คัมภีร์',
          tabBarIcon: ({focused}) => <TabIcon symbol="📖" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="WatchFace"
        component={WatchFaceScreen}
        options={{
          tabBarLabel: 'นาฬิกาข้อมือ',
          tabBarIcon: ({focused}) => <TabIcon symbol="⌚" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bg.dark,
    borderTopColor: Colors.bg.subtle,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'NotoSansThai-Regular',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
});
