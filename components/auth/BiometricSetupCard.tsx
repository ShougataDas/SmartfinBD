import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Button, Text, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { theme, spacing } from '@/constants/theme';
import { BiometricService } from '@/services/biometricService';
import { useAuthStore } from '@/store/authStore';

interface BiometricSetupCardProps {
    userEmail: string;
    userPassword: string;
    onSetupComplete?: () => void;
    onSkip?: () => void;
}

export const BiometricSetupCard: React.FC<BiometricSetupCardProps> = ({
    userEmail,
    userPassword,
    onSetupComplete,
    onSkip,
}) => {
    const { enableBiometricAuth, biometricAvailable, biometricEnabled } = useAuthStore();
    const [biometricTypes, setBiometricTypes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        BiometricService.getAvailableBiometricTypes().then(setBiometricTypes);
    }, []);

    const handleEnableBiometric = async () => {
        setIsLoading(true);
        try {
            await enableBiometricAuth(userEmail, userPassword);
            onSetupComplete?.();
        } catch (error) {
            console.error('Biometric setup error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        onSkip?.();
    };

    // Don't show if biometric is not available or already enabled
    if (!biometricAvailable || biometricEnabled) {
        return null;
    }

    return (
        <Card style={styles.container}>
            <Card.Content>
                <View style={styles.header}>
                    <Surface style={styles.iconContainer}>
                        <Icon name="fingerprint" size={48} color={theme.colors.primary} />
                    </Surface>

                    <Text variant="headlineSmall" style={styles.title}>
                        দ্রুত লগইন সক্রিয় করুন
                    </Text>
                    <Text variant="bodyLarge" style={styles.subtitle}>
                        {biometricTypes.join(' বা ')} দিয়ে নিরাপদ ও দ্রুত লগইন করুন
                    </Text>
                </View>

                <View style={styles.benefits}>
                    <View style={styles.benefitItem}>
                        <Icon name="lightning-bolt" size={20} color={theme.colors.primary} />
                        <Text variant="bodyMedium" style={styles.benefitText}>
                            দ্রুত লগইন (১ সেকেন্ডে)
                        </Text>
                    </View>

                    <View style={styles.benefitItem}>
                        <Icon name="shield-check" size={20} color={theme.colors.primary} />
                        <Text variant="bodyMedium" style={styles.benefitText}>
                            উন্নত নিরাপত্তা
                        </Text>
                    </View>

                    <View style={styles.benefitItem}>
                        <Icon name="key-variant" size={20} color={theme.colors.primary} />
                        <Text variant="bodyMedium" style={styles.benefitText}>
                            পাসওয়ার্ড মনে রাখার প্রয়োজন নেই
                        </Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <Button
                        mode="outlined"
                        onPress={handleSkip}
                        style={styles.skipButton}
                        disabled={isLoading}
                    >
                        এখন নয়
                    </Button>

                    <Button
                        mode="contained"
                        onPress={handleEnableBiometric}
                        style={styles.enableButton}
                        loading={isLoading}
                        disabled={isLoading}
                        icon="fingerprint"
                    >
                        সক্রিয় করুন
                    </Button>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: spacing.md,
        backgroundColor: theme.colors.primaryContainer,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        elevation: 4,
    },
    title: {
        fontWeight: 'bold',
        color: theme.colors.onPrimaryContainer,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        color: theme.colors.onPrimaryContainer,
        textAlign: 'center',
        opacity: 0.9,
    },
    benefits: {
        marginBottom: spacing.lg,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    benefitText: {
        marginLeft: spacing.sm,
        color: theme.colors.onPrimaryContainer,
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    skipButton: {
        flex: 1,
        borderColor: theme.colors.onPrimaryContainer,
    },
    enableButton: {
        flex: 1,
        backgroundColor: theme.colors.primary,
    },
});