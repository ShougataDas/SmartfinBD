import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { theme } from '@/constants/theme';
import { BiometricService } from '@/services/biometricService';
import { useAuthStore } from '@/store/authStore';

interface BiometricLoginButtonProps {
    onPress?: () => void;
    style?: any;
    disabled?: boolean;
}

export const BiometricLoginButton: React.FC<BiometricLoginButtonProps> = ({
    onPress,
    style,
    disabled = false,
}) => {
    const { loginWithBiometrics, biometricEnabled, biometricAvailable, isLoading } = useAuthStore();
    const [biometricTypes, setBiometricTypes] = useState<string[]>([]);

    useEffect(() => {
        BiometricService.getAvailableBiometricTypes().then(setBiometricTypes);
    }, []);

    const handlePress = async () => {
        try {
            if (onPress) {
                onPress();
            } else {
                await loginWithBiometrics();
            }
        } catch (error) {
            console.error('Biometric login button error:', error);
        }
    };

    // Don't render if biometric is not available or not enabled
    if (!biometricAvailable || !biometricEnabled) {
        return null;
    }

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
        <Button
            mode="outlined"
            onPress={handlePress}
            style={[styles.button, style]}
            icon={getIconName()}
            loading={isLoading}
            disabled={disabled || isLoading}
        >
            {biometricTypes.join('/')} দিয়ে লগইন
        </Button>
    );
};

const styles = StyleSheet.create({
    button: {
        borderColor: theme.colors.primary,
    },
});