import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Button, Text, Card, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
} from 'react-native-reanimated';

import { theme, spacing } from '@/constants/theme';
import { BiometricService } from '@/services/biometricService';

interface BiometricPromptProps {
    visible: boolean;
    onSuccess: () => void;
    onCancel: () => void;
    onError: (error: string) => void;
    title?: string;
    subtitle?: string;
}

export const BiometricPrompt: React.FC<BiometricPromptProps> = ({
    visible,
    onSuccess,
    onCancel,
    onError,
    title = 'বায়োমেট্রিক প্রমাণীকরণ',
    subtitle = 'আপনার পরিচয় যাচাই করুন',
}) => {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [biometricTypes, setBiometricTypes] = useState<string[]>([]);
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        if (visible) {
            BiometricService.getAvailableBiometricTypes().then(setBiometricTypes);
            startPulseAnimation();
            handleBiometricAuth();
        }
    }, [visible]);

    const startPulseAnimation = () => {
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            false
        );
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulseScale.value }],
        };
    });

    const handleBiometricAuth = async () => {
        setIsAuthenticating(true);

        try {
            const result = await BiometricService.authenticateWithBiometrics(subtitle);

            if (result.success) {
                onSuccess();
            } else {
                onError(result.error || 'প্রমাণীকরণ ব্যর্থ');
            }
        } catch (error) {
            onError(error instanceof Error ? error.message : 'প্রমাণীকরণে সমস্যা হয়েছে');
        } finally {
            setIsAuthenticating(false);
        }
    };

    const getIconName = (): string => {
        if (biometricTypes.includes('ফেস আইডি')) {
            return 'face-recognition';
        }
        if (biometricTypes.includes('ফিঙ্গারপ্রিন্ট')) {
            return 'fingerprint';
        }
        return 'shield-account';
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.modalContainer}>
                <Surface style={styles.promptContainer}>
                    <Card.Content style={styles.content}>
                        <View style={styles.header}>
                            <Animated.View style={[styles.iconContainer, animatedStyle]}>
                                <Icon
                                    name={getIconName()}
                                    size={64}
                                    color={theme.colors.primary}
                                />
                            </Animated.View>

                            <Text variant="headlineSmall" style={styles.title}>
                                {title}
                            </Text>
                            <Text variant="bodyLarge" style={styles.subtitle}>
                                {subtitle}
                            </Text>

                            {biometricTypes.length > 0 && (
                                <Text variant="bodyMedium" style={styles.biometricType}>
                                    {biometricTypes.join(' বা ')} ব্যবহার করুন
                                </Text>
                            )}
                        </View>

                        {isAuthenticating && (
                            <View style={styles.statusContainer}>
                                <Text variant="bodyMedium" style={styles.statusText}>
                                    প্রমাণীকরণ চলছে...
                                </Text>
                            </View>
                        )}

                        <View style={styles.actions}>
                            <Button
                                mode="outlined"
                                onPress={onCancel}
                                style={styles.cancelButton}
                                disabled={isAuthenticating}
                            >
                                বাতিল
                            </Button>

                            <Button
                                mode="contained"
                                onPress={handleBiometricAuth}
                                style={styles.retryButton}
                                disabled={isAuthenticating}
                                loading={isAuthenticating}
                            >
                                আবার চেষ্টা করুন
                            </Button>
                        </View>
                    </Card.Content>
                </Surface>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    promptContainer: {
        width: '85%',
        maxWidth: 400,
        borderRadius: theme.roundness * 2,
        backgroundColor: theme.colors.surface,
    },
    content: {
        padding: spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    biometricType: {
        color: theme.colors.primary,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    statusContainer: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    statusText: {
        color: theme.colors.onSurfaceVariant,
        fontStyle: 'italic',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    cancelButton: {
        flex: 1,
    },
    retryButton: {
        flex: 1,
    },
});