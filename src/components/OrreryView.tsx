/**
 * ดาวเทวา — OrreryView
 * Reusable animated Nava Graha orrery (SVG + Animated)
 * Used in ClockScreen and WatchFaceScreen
 */
import React, {useEffect, useRef} from 'react';
import {View, Animated, Easing, StyleSheet} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {Colors} from '../theme/colors';

interface Props {
  size: number;
  showOrbits?: boolean;
}

const ORBIT_RADII = [22, 38, 54, 72, 90, 108, 120];
const PLANET_COLORS = [
  Colors.planet.moon,
  Colors.planet.mercury,
  Colors.planet.venus,
  Colors.planet.mars,
  Colors.planet.jupiter,
  Colors.planet.saturn,
  Colors.planet.saturn,
];
const DURATIONS = [8000, 14000, 22000, 36000, 58000, 72000, 90000];

export function OrreryView({size, showOrbits = true}: Props) {
  const rotations = useRef(
    ORBIT_RADII.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const anims = rotations.map((rot, i) =>
      Animated.loop(
        Animated.timing(rot, {
          toValue: i % 2 === 0 ? 1 : -1,
          duration: DURATIONS[i],
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
    );
    Animated.parallel(anims).start();
  }, [rotations]);

  const center = size / 2;

  return (
    <View style={{width: size, height: size}}>
      {/* Static orbit rings + Sun via SVG */}
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={StyleSheet.absoluteFill}>
        {showOrbits &&
          ORBIT_RADII.map((r, i) => (
            <Circle
              key={i}
              cx={center}
              cy={center}
              r={r}
              stroke="rgba(212,160,23,0.15)"
              strokeWidth={0.6}
              fill="none"
            />
          ))}
        {/* Sun */}
        <Circle cx={center} cy={center} r={9} fill={Colors.planet.sun} opacity={0.9} />
        <Circle cx={center} cy={center} r={6} fill="#FFE08A" />
      </Svg>

      {/* Animated planets */}
      {rotations.map((rot, i) => {
        const r = ORBIT_RADII[i];
        const spin = rot.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-360deg', '0deg', '360deg'],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.orbitRing,
              {
                width: r * 2,
                height: r * 2,
                borderRadius: r,
                top: center - r,
                left: center - r,
                transform: [{rotate: spin}],
              },
            ]}>
            <View
              style={[
                styles.planet,
                {
                  width: i < 2 ? 5 : 7,
                  height: i < 2 ? 5 : 7,
                  borderRadius: i < 2 ? 2.5 : 3.5,
                  backgroundColor: PLANET_COLORS[i],
                },
              ]}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  orbitRing: {
    position: 'absolute',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  planet: {
    marginLeft: -3.5,
  },
});
