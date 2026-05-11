import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeColors = {
  bg: string;
  surface: string;
  card: string;
  border: string;
  borderHi: string;
  text: string;
  text2: string;
  text3: string;
  yellow: string;
  blue: string;
  purple: string;
  green: string;
  liveGreen: string;
};

export const darkColors: ThemeColors = {
  bg:        '#050810',
  surface:   '#080c18',
  card:      '#0c1222',
  border:    '#14213a',
  borderHi:  '#1e3357',
  text:      '#dce8f8',
  text2:     '#a8bdd8',
  text3:     '#5a7799',
  yellow:    '#eab308',
  blue:      '#60a5fa',
  purple:    '#c084fc',
  green:     '#4ade80',
  liveGreen: '#22c55e',
};

export const lightColors: ThemeColors = {
  bg:        '#faf6ec',
  surface:   '#f0eadc',
  card:      '#ebe4d2',
  border:    '#d8cfb5',
  borderHi:  '#c5b896',
  text:      '#0c1222',
  text2:     '#5a513f',
  text3:     '#8a7f5f',
  yellow:    '#b8860b',
  blue:      '#1e6fce',
  purple:    '#7c3aed',
  green:     '#16a34a',
  liveGreen: '#15803d',
};

/**
 * Hook returning the current theme's color palette based on the
 * device's system color scheme preference.
 */
export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'light' ? lightColors : darkColors;
}

/**
 * One-liner hook for the common case: takes a `makeStyles(colors)`
 * function and returns its memoised result for the current theme.
 *
 *     const s = useStyles(makeStyles);
 *
 * Used together with a module-level `makeStyles(colors)` factory.
 */
export function useStyles<T>(maker: (colors: ThemeColors) => T): T {
  const colors = useThemeColors();
  return useMemo(() => maker(colors), [colors, maker]);
}

/**
 * Backward-compatible alias for module-level imports that can't use
 * hooks. Defaults to dark. New code should call `useThemeColors()`.
 */
export const colors = darkColors;
