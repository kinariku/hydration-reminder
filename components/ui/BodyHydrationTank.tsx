import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

interface BodyHydrationTankProps {
  progress: number;
  size?: number;
  accentColor?: string;
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const BodyHydrationTank: React.FC<BodyHydrationTankProps> = ({
  progress,
  size = 220,
  accentColor = '#48A9FF',
}) => {
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const animation = useRef(new Animated.Value(clampedProgress)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: clampedProgress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animation, clampedProgress]);

  const centerX = size / 2;
  const headRadius = size * 0.14;
  const headCenterY = headRadius + size * 0.02;
  const bodyTop = headCenterY + headRadius * 0.75;
  const bodyBottom = size * 0.92;
  const silhouetteHeight = bodyBottom - bodyTop;

  const waterHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, silhouetteHeight],
  });

  const waterY = Animated.subtract(bodyBottom, waterHeight);

  const bubbleConfigs = useMemo(
    () => [
      { radius: size * 0.028, x: centerX - size * 0.12, delay: 0 },
      { radius: size * 0.022, x: centerX + size * 0.1, delay: 500 },
      { radius: size * 0.018, x: centerX - size * 0.02, delay: 1000 },
    ],
    [centerX, size]
  );

  const bubbleAnimations = useRef<Animated.Value[]>([]);

  if (bubbleAnimations.current.length !== bubbleConfigs.length) {
    bubbleAnimations.current = bubbleConfigs.map(() => new Animated.Value(0));
  }

  useEffect(() => {
    const loops = bubbleAnimations.current.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(bubbleConfigs[index].delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 3200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      )
    );

    loops.forEach((loop) => loop.start());

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [bubbleConfigs]);

  const neckWidth = size * 0.18;
  const shoulderWidth = size * 0.6;
  const waistWidth = size * 0.38;
  const hipWidth = size * 0.46;

  const bodyPath = `
    M ${centerX - shoulderWidth / 2} ${bodyTop}
    Q ${centerX - shoulderWidth / 2} ${bodyTop + silhouetteHeight * 0.2} ${centerX - waistWidth / 2} ${bodyTop + silhouetteHeight * 0.45}
    Q ${centerX - hipWidth / 2} ${bodyBottom} ${centerX} ${bodyBottom}
    Q ${centerX + hipWidth / 2} ${bodyBottom} ${centerX + waistWidth / 2} ${bodyTop + silhouetteHeight * 0.45}
    Q ${centerX + shoulderWidth / 2} ${bodyTop + silhouetteHeight * 0.2} ${centerX + shoulderWidth / 2} ${bodyTop}
    Q ${centerX + neckWidth / 2} ${bodyTop - headRadius * 0.5} ${centerX + neckWidth / 2} ${bodyTop - headRadius}
    L ${centerX - neckWidth / 2} ${bodyTop - headRadius}
    Q ${centerX - neckWidth / 2} ${bodyTop - headRadius * 0.5} ${centerX - shoulderWidth / 2} ${bodyTop}
    Z
  `;

  const gradientId = useRef(`body-gradient-${Math.random().toString(36).slice(2)}`).current;
  const waterGradientId = useRef(`water-gradient-${Math.random().toString(36).slice(2)}`).current;
  const shineGradientId = useRef(`shine-gradient-${Math.random().toString(36).slice(2)}`).current;

  return (
    <Svg width={size} height={size}>
      <Defs>
        <LinearGradient id={gradientId} x1="50%" y1="0%" x2="50%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
        </LinearGradient>
        <LinearGradient id={waterGradientId} x1="50%" y1="0%" x2="50%" y2="100%">
          <Stop offset="0%" stopColor="#9FE4FF" stopOpacity="0.9" />
          <Stop offset="100%" stopColor={accentColor} stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id={shineGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
          <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
        </LinearGradient>
        <ClipPath id="bodyClip">
          <Circle cx={centerX} cy={headCenterY} r={headRadius} />
          <Path d={bodyPath} />
        </ClipPath>
      </Defs>

      <G clipPath="url(#bodyClip)">
        <Rect x={0} y={0} width={size} height={size} fill={`url(#${gradientId})`} />
        <AnimatedRect
          x={0}
          width={size}
          y={waterY as unknown as number}
          height={waterHeight as unknown as number}
          fill={`url(#${waterGradientId})`}
        />
        <Rect
          x={centerX - shoulderWidth / 2}
          y={bodyTop - headRadius * 0.8}
          width={shoulderWidth}
          height={size * 0.2}
          fill={`url(#${shineGradientId})`}
          opacity={0.35}
        />
        {clampedProgress > 0.1 &&
          bubbleConfigs.map((bubble, index) => {
            const bubbleY = bubbleAnimations.current[index].interpolate({
              inputRange: [0, 1],
              outputRange: [bodyBottom - bubble.radius * 1.5, bodyTop + bubble.radius * 2],
            });

            const bubbleOpacity = bubbleAnimations.current[index].interpolate({
              inputRange: [0, 0.4, 1],
              outputRange: [0, 0.7, 0],
            });

            return (
              <AnimatedCircle
                key={`bubble-${index}`}
                cx={bubble.x}
                cy={bubbleY as unknown as number}
                r={bubble.radius}
                fill="rgba(255,255,255,0.65)"
                opacity={bubbleOpacity as unknown as number}
              />
            );
          })}
      </G>

      <Circle
        cx={centerX}
        cy={headCenterY}
        r={headRadius}
        stroke="rgba(255,255,255,0.75)"
        strokeWidth={size * 0.015}
        fill="none"
      />
      <Path
        d={bodyPath}
        stroke="rgba(255,255,255,0.75)"
        strokeWidth={size * 0.015}
        fill="none"
      />
    </Svg>
  );
};
