# AstiClock (React Native Flip Clock)

A full-screen, minimalist, 3D animated flip clock UI built with React Native and Expo.

## Features
- **Authentic Flip Mechanics**: Uses `react-native-reanimated` for smooth 60fps 3D flip card animations mimicking a physical mechanical clock.
- **Responsive Layout**: Adjusts styling for row (landscape/tablet) and column (portrait) orientations seamlessly without skewing proportions.
- **Adaptive Precision**: Displays hours, minutes, and seconds, updating crisply on the exact 1000ms boundary.

## Stack
- React Native (version 0.81.5)
- Expo Router (version 6.x)
- React Native Reanimated (for flip animations)

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```

2. Start the development server
   ```bash
   npx expo start
   ```

   You can then press `w` to open it in a web browser instantly, or scan the QR code using the Expo Go app on iOS or Android.

## Architecture

The flip cards are composed using a layering technique:
- A static background half (`currentValue` bottom, `nextValue` top)
- Two absolute positioned `Animated.View` flaps that rotate around their center (the seam of the card) spanning respectively `[0 -> -90deg]` and `[90 -> 0deg]` over a 400ms duration.
