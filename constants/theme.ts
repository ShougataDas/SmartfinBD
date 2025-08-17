import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Bangladesh-inspired color palette
export const colors = {
    primary: '#006A4E', // Bangladesh green
    primaryContainer: '#4CAF50',
    secondary: '#DC143C', // Bangladesh red
    secondaryContainer: '#FFCDD2',
    tertiary: '#FF9800',
    tertiaryContainer: '#FFE0B2',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    background: '#FAFAFA',
    error: '#B00020',
    errorContainer: '#FFCDD2',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#000000',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#000000',
    onSurface: '#000000',
    onSurfaceVariant: '#49454F',
    onError: '#FFFFFF',
    onErrorContainer: '#000000',
    onBackground: '#1C1B1F',
    outline: '#79747E',
    outlineVariant: '#CAC4D0',
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#4CAF50',
    shadow: '#000000',
    scrim: '#000000',
    surfaceDisabled: 'rgba(28, 27, 31, 0.12)',
    onSurfaceDisabled: 'rgba(28, 27, 31, 0.38)',
    backdrop: 'rgba(73, 69, 79, 0.4)',
};

export const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        ...colors,
    },
    roundness: 12,
};

export const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#4CAF50',
        secondary: '#FF5252',
        background: '#121212',
        surface: '#1E1E1E',
    },
    roundness: 12,
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const typography = {
    fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
    },
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },
};

