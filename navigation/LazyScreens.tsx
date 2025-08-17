import { theme } from '@/constants/theme';
import React, { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Lazy load heavy screens
const DashboardScreen = lazy(() => import('../screens/DashboardScreen'));
const InvestmentScreen = lazy(() => import('../screens/InvestmentScreen'));
const ChatScreen = lazy(() => import('../screens/ChatScreen'));
const ProfileScreen = lazy(() => import('../screens/ProfileScreen'));

const LoadingFallback = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
);

export const LazyDashboardScreen = () => (
    <Suspense fallback={<LoadingFallback />}>
        <DashboardScreen />
    </Suspense>
);

export const LazyInvestmentScreen = () => (
    <Suspense fallback={<LoadingFallback />}>
        <InvestmentScreen />
    </Suspense>
);

export const LazyChatScreen = () => (
    <Suspense fallback={<LoadingFallback />}>
        <ChatScreen />
    </Suspense>
);

export const LazyProfileScreen = () => (
    <Suspense fallback={<LoadingFallback />}>
        <ProfileScreen />
    </Suspense>
);
