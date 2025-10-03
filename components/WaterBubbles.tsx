import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface BubbleProps {
  size: number;
  delay: number;
  duration: number;
  startX: number;
}

const Bubble: React.FC<BubbleProps> = ({ size, delay, duration, startX }) => {
  const translateY = useSharedValue(screenHeight + 50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // アニメーション開始
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-50, {
          duration,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        false
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: duration * 0.1,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        true
      )
    );
  }, [delay, duration, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateY.value,
      [screenHeight + 50, screenHeight * 0.5, -50],
      [0.3, 1, 1.2]
    );

    return {
      transform: [
        { translateY: translateY.value },
        { scale },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          left: startX,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

export const WaterBubbles: React.FC = () => {
  // 複数の水疱を生成
  const bubbles = [
    { size: 8, delay: 0, duration: 8000, startX: screenWidth * 0.1 },
    { size: 12, delay: 2000, duration: 10000, startX: screenWidth * 0.2 },
    { size: 6, delay: 4000, duration: 12000, startX: screenWidth * 0.3 },
    { size: 10, delay: 1000, duration: 9000, startX: screenWidth * 0.4 },
    { size: 14, delay: 3000, duration: 11000, startX: screenWidth * 0.5 },
    { size: 8, delay: 5000, duration: 13000, startX: screenWidth * 0.6 },
    { size: 11, delay: 1500, duration: 8500, startX: screenWidth * 0.7 },
    { size: 9, delay: 3500, duration: 9500, startX: screenWidth * 0.8 },
    { size: 7, delay: 2500, duration: 10500, startX: screenWidth * 0.9 },
    { size: 13, delay: 6000, duration: 14000, startX: screenWidth * 0.15 },
    { size: 5, delay: 7000, duration: 15000, startX: screenWidth * 0.25 },
    { size: 16, delay: 8000, duration: 16000, startX: screenWidth * 0.35 },
    { size: 9, delay: 9000, duration: 17000, startX: screenWidth * 0.45 },
    { size: 12, delay: 10000, duration: 18000, startX: screenWidth * 0.55 },
    { size: 8, delay: 11000, duration: 19000, startX: screenWidth * 0.65 },
    { size: 10, delay: 12000, duration: 20000, startX: screenWidth * 0.75 },
    { size: 6, delay: 13000, duration: 21000, startX: screenWidth * 0.85 },
    { size: 14, delay: 14000, duration: 22000, startX: screenWidth * 0.95 },
  ];

  return (
    <View style={styles.container} pointerEvents="none">
      {bubbles.map((bubble, index) => (
        <Bubble
          key={index}
          size={bubble.size}
          delay={bubble.delay}
          duration={bubble.duration}
          startX={bubble.startX}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
});
