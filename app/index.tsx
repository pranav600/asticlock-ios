import { View, Text, StyleSheet, useWindowDimensions, Platform } from "react-native";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
  interpolate,
} from "react-native-reanimated";

// A single static half of a card
const CardHalf = ({ 
  value, 
  isTop, 
  cardWidth, 
  cardHeight, 
  borderRadius, 
  fontSize 
}: any) => {
  const halfHeight = cardHeight / 2;
  return (
    <View style={[
      styles.halfContainer, 
      { 
        width: cardWidth, 
        height: halfHeight,
        borderTopLeftRadius: isTop ? borderRadius : 0,
        borderTopRightRadius: isTop ? borderRadius : 0,
        borderBottomLeftRadius: !isTop ? borderRadius : 0,
        borderBottomRightRadius: !isTop ? borderRadius : 0,
        top: isTop ? 0 : halfHeight,
      }
    ]}>
      <View style={[styles.textWrapper, { height: cardHeight, top: isTop ? 0 : -halfHeight }]}>
        <Text style={[styles.text, { fontSize }]} adjustsFontSizeToFit numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
};

// Animated Flip Card
const AnimatedFlipCard = ({ 
  value, 
  label, 
  pad = true, 
  cardWidth, 
  cardHeight 
}: { 
  value: number | string, 
  label?: string, 
  pad?: boolean,
  cardWidth: number,
  cardHeight: number
}) => {
  const displayValue = pad && typeof value === 'number' ? value.toString().padStart(2, '0') : value;
  
  const [currentValue, setCurrentValue] = useState(displayValue);
  const nextValue = displayValue; // Derive next value directly to prevent extra render
  
  const flipRotation = useSharedValue(0);

  useEffect(() => {
    if (displayValue !== currentValue) {
      // Ensure we start from 0 exactly when values differ
      flipRotation.value = 0;
      flipRotation.value = withTiming(
        180,
        { duration: 450, easing: Easing.inOut(Easing.quad) }, // Smooth quad easing
        (finished) => {
          if (finished) {
            runOnJS(setCurrentValue)(displayValue);
          }
        }
      );
    } else {
      // If they are equal, ensure rotation is 0
      flipRotation.value = 0;
    }
  }, [displayValue, currentValue]);

  // Dynamic values
  const fontSize = Math.min(cardHeight * 0.75, cardWidth * 0.65);
  const labelFontSize = Math.max(16, cardWidth * 0.08);
  const borderRadius = Math.max(20, Math.min(cardWidth * 0.15, 40));

  // The Top Flap layer
  const frontAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 }, 
        { rotateX: `-${flipRotation.value}deg` }
      ],
      zIndex: flipRotation.value < 90 ? 20 : 0,
      opacity: flipRotation.value < 90 ? 1 : 0,
    };
  });

  // The Bottom Flap layer
  const backAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 }, 
        { rotateX: `${180 - flipRotation.value}deg` }
      ],
      zIndex: flipRotation.value >= 90 ? 20 : 0,
      opacity: flipRotation.value >= 90 ? 1 : 0,
    };
  });

  return (
    <View style={[styles.cardContainer, { width: cardWidth, height: cardHeight, borderRadius }]}>
      
      {/* 1. Static Bottom (shows current value) */}
      <CardHalf value={currentValue} isTop={false} cardWidth={cardWidth} cardHeight={cardHeight} borderRadius={borderRadius} fontSize={fontSize} />
      
      {/* 2. Static Top (shows next value) */}
      <CardHalf value={nextValue} isTop={true} cardWidth={cardWidth} cardHeight={cardHeight} borderRadius={borderRadius} fontSize={fontSize} />
      
      {/* 3. Animated Top Flap (flips down from 0 to -180, shows current value) */}
      <Animated.View style={[styles.animatedFlap, frontAnimatedStyle]}>
        <CardHalf value={currentValue} isTop={true} cardWidth={cardWidth} cardHeight={cardHeight} borderRadius={borderRadius} fontSize={fontSize} />
      </Animated.View>

      {/* 4. Animated Bottom Flap (flips down from 180 to 0, shows next value) */}
      <Animated.View style={[styles.animatedFlap, backAnimatedStyle]}>
        <CardHalf value={nextValue} isTop={false} cardWidth={cardWidth} cardHeight={cardHeight} borderRadius={borderRadius} fontSize={fontSize} />
      </Animated.View>
      
      {/* Shadow layer for depth inside the flap - optional, adds realism */}
      <View style={styles.splitLineContainer}>
        <View style={styles.splitLine} />
      </View>
      
      {label && (
        <Text style={[styles.label, { fontSize: labelFontSize, top: cardHeight * 0.08, left: cardHeight * 0.08 }]}>{label}</Text>
      )}
    </View>
  );
};

export default function Index() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  
  const isPM = hours >= 12;
  const displayHours = hours % 12 || 12; // 12 hour format

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) > 600;
  
  const isRow = isLandscape || (isTablet && width > 600);

  let cardWidth, cardHeight, gap;
  const optimalRatio = 1.05; // Set to a slightly squarish ratio to increase height
  
  if (isRow) {
    gap = width * 0.03;
    cardHeight = Math.min(height * 0.6, 600);
    cardWidth = cardHeight * optimalRatio;
    
    // Scale down if too wide for 3 cards
    if (cardWidth * 3 + gap * 2 > width * 0.9) {
       cardWidth = (width * 0.9 - gap * 2) / 3;
       cardHeight = cardWidth / optimalRatio;
    }
  } else {
    gap = height * 0.03;
    cardWidth = Math.min(width * 0.85, 500); 
    cardHeight = cardWidth / optimalRatio;
    
    // Scale down if too tall for 3 cards
    if (cardHeight * 3 + gap * 2 > height * 0.85) {
       cardHeight = (height * 0.85 - gap * 2) / 3;
       cardWidth = cardHeight * optimalRatio;
    }
  }

  // Ensure card sizes don't get negative or too small during resize
  cardWidth = Math.max(100, cardWidth);
  cardHeight = Math.max(80, cardHeight);

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden={Platform.OS === 'ios' || Platform.OS === 'android'} />
      <View style={[styles.clockContainer, { flexDirection: isRow ? 'row' : 'column', gap }]}>
        <AnimatedFlipCard 
          value={displayHours} 
          label={isPM ? "PM" : "AM"} 
          pad={false}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
        />
        <AnimatedFlipCard 
          value={minutes} 
          pad={true}
          cardWidth={cardWidth}
          cardHeight={cardHeight} 
        />
        <AnimatedFlipCard 
          value={seconds} 
          pad={true}
          cardWidth={cardWidth}
          cardHeight={cardHeight} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  clockContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: "#161616",
    // Base layer styles
    borderWidth: 1,
    borderColor: '#282828',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  halfContainer: {
    position: 'absolute',
    left: 0,
    backgroundColor: "#161616",
    overflow: 'hidden', // hides the other half of the text
  },
  textWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedFlap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // The flap container is full size, but its inner CardHalf only fills half.
    // This makes rotateX pivot at the exact center (split line) of the card!
    backfaceVisibility: 'hidden', // to prevent rendering when flipped depending on OS
  },
  text: {
    color: "#E5E5E5",
    fontWeight: "900",
    fontVariant: ['tabular-nums'],
    letterSpacing: -3,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  splitLineContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: Platform.OS === 'web' ? 4 : 6, 
    marginTop: Platform.OS === 'web' ? -2 : -3, 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30, // higher than flaps
    backgroundColor: '#000000', 
  },
  splitLine: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  label: {
    position: 'absolute',
    color: '#888888',
    fontWeight: '800',
    letterSpacing: 1,
    zIndex: 40,
  }
});
