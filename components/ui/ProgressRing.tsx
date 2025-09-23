import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string | [string, string];
  backgroundColor?: string;
  children?: React.ReactNode;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 200,
  strokeWidth = 12,
  color = '#007AFF',
  backgroundColor = '#E5E5EA',
  children,
}) => {
  const normalizedProgress = Math.max(0, Math.min(progress, 1));
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const animation = useRef(new Animated.Value(normalizedProgress)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: normalizedProgress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animation, normalizedProgress]);

  const strokeDasharray = circumference;
  const strokeDashoffset = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const gradientIdRef = useRef(
    `ring-gradient-${Math.random().toString(36).slice(2)}`
  );
  const ringStroke = Array.isArray(color)
    ? `url(#${gradientIdRef.current})`
    : color;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
        {Array.isArray(color) && (
          <Defs>
            <LinearGradient
              id={gradientIdRef.current}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <Stop offset="0%" stopColor={color[0]} />
              <Stop offset="100%" stopColor={color[1]} />
            </LinearGradient>
          </Defs>
        )}
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringStroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset as unknown as number}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
