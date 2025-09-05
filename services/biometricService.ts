import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform, Alert } from 'react-native';

export interface BiometricAuthResult {
    success: boolean;
    error?: string;
    biometryType?: LocalAuthentication.AuthenticationType[];
}

export interface BiometricCapability {
    isAvailable: boolean;
    supportedTypes: LocalAuthentication.AuthenticationType[];
    isEnrolled: boolean;
}

export class BiometricService {
    private static readonly BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
    private static readonly USER_CREDENTIALS_KEY = 'user_credentials';

    /**
     * Check if biometric authentication is available and enrolled
     */
    static async checkBiometricCapability(): Promise<BiometricCapability> {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            return {
                isAvailable: hasHardware && isEnrolled,
                supportedTypes,
                isEnrolled,
            };
        } catch (error) {
            console.error('Error checking biometric capability:', error);
            return {
                isAvailable: false,
                supportedTypes: [],
                isEnrolled: false,
            };
        }
    }

    /**
     * Get biometric type display name in Bengali
     */
    static getBiometricDisplayName(types: LocalAuthentication.AuthenticationType[]): string {
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            return 'ফেস আইডি';
        }
        if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            return 'ফিঙ্গারপ্রিন্ট';
        }
        if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            return 'আইরিস স্ক্যান';
        }
        return 'বায়োমেট্রিক';
    }

    /**
     * Authenticate user with biometrics
     */
    static async authenticateWithBiometrics(
        promptMessage: string = 'আপনার পরিচয় যাচাই করুন'
    ): Promise<BiometricAuthResult> {
        try {
            const capability = await this.checkBiometricCapability();

            if (!capability.isAvailable) {
                return {
                    success: false,
                    error: 'বায়োমেট্রিক প্রমাণীকরণ উপলব্ধ নেই',
                };
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage,
                cancelLabel: 'বাতিল',
                fallbackLabel: 'পাসওয়ার্ড ব্যবহার করুন',
                disableDeviceFallback: false,
            });

            if (result.success) {
                return {
                    success: true,
                    biometryType: capability.supportedTypes,
                };
            } else {
                let errorMessage = 'বায়োমেট্রিক প্রমাণীকরণ ব্যর্থ';

                const errorKey = result.error ? String(result.error) : '';

                if (errorKey === 'UserCancel') {
                    errorMessage = 'ব্যবহারকারী বাতিল করেছেন';
                } else if (errorKey === 'UserFallback') {
                    errorMessage = 'বিকল্প পদ্ধতি ব্যবহার করুন';
                } else if (errorKey === 'BiometryNotAvailable') {
                    errorMessage = 'বায়োমেট্রিক প্রমাণীকরণ উপলব্ধ নেই';
                } else if (errorKey === 'BiometryNotEnrolled') {
                    errorMessage = 'বায়োমেট্রিক তথ্য নিবন্ধিত নেই';
                } else if (errorKey === 'BiometryLockout') {
                    errorMessage = 'অনেকবার ভুল চেষ্টা। কিছুক্ষণ পর আবার চেষ্টা করুন';
                }

                return {
                    success: false,
                    error: errorMessage,
                };
            }
        } catch (error) {
            console.error('Biometric authentication error:', error);
            return {
                success: false,
                error: 'বায়োমেট্রিক প্রমাণীকরণে সমস্যা হয়েছে',
            };
        }
    }

    /**
     * Enable biometric authentication for the user
     */
    static async enableBiometricAuth(email: string, password: string): Promise<BiometricAuthResult> {
        try {
            const capability = await this.checkBiometricCapability();
            if (!capability.isAvailable) {
                return {
                    success: false,
                    error: 'বায়োমেট্রিক প্রমাণীকরণ উপলব্ধ নেই',
                };
            }

            // Test biometric authentication first
            const authResult = await this.authenticateWithBiometrics(
                'বায়োমেট্রিক লগইন সক্রিয় করতে আপনার পরিচয় যাচাই করুন'
            );

            if (!authResult.success) {
                return authResult;
            }

            // Store user credentials securely
            const credentials = JSON.stringify({ email, password });
            await SecureStore.setItemAsync(this.USER_CREDENTIALS_KEY, credentials);

            // Set biometric preference
            await SecureStore.setItemAsync(this.BIOMETRIC_ENABLED_KEY, 'true');

            return { success: true };
        } catch (error) {
            console.error('Error enabling biometric auth:', error);
            return {
                success: false,
                error: 'বায়োমেট্রিক প্রমাণীকরণ সক্রিয় করতে সমস্যা হয়েছে',
            };
        }
    }

    /**
     * Disable biometric authentication
     */
    static async disableBiometricAuth(): Promise<BiometricAuthResult> {
        try {
            // Clear stored credentials
            await SecureStore.deleteItemAsync(this.USER_CREDENTIALS_KEY);

            // Set biometric preference to false
            await SecureStore.setItemAsync(this.BIOMETRIC_ENABLED_KEY, 'false');

            return { success: true };
        } catch (error) {
            console.error('Error disabling biometric auth:', error);
            return {
                success: false,
                error: 'বায়োমেট্রিক প্রমাণীকরণ বন্ধ করতে সমস্যা হয়েছে',
            };
        }
    }

    /**
     * Check if biometric authentication is enabled
     */
    static async isBiometricEnabled(): Promise<boolean> {
        try {
            const enabled = await SecureStore.getItemAsync(this.BIOMETRIC_ENABLED_KEY);
            return enabled === 'true';
        } catch (error) {
            console.error('Error checking biometric status:', error);
            return false;
        }
    }

    /**
     * Login with biometric authentication
     */
    static async loginWithBiometrics(): Promise<{
        success: boolean;
        credentials?: { email: string; password: string };
        error?: string;
    }> {
        try {
            // Check if biometric is enabled
            const isEnabled = await this.isBiometricEnabled();
            if (!isEnabled) {
                return {
                    success: false,
                    error: 'বায়োমেট্রিক লগইন সক্রিয় নেই',
                };
            }

            // Authenticate with biometrics
            const authResult = await this.authenticateWithBiometrics(
                'SmartFin BD তে লগইন করতে আপনার পরিচয় যাচাই করুন'
            );

            if (!authResult.success) {
                return {
                    success: false,
                    error: authResult.error,
                };
            }

            // Get stored credentials
            const credentialsString = await SecureStore.getItemAsync(this.USER_CREDENTIALS_KEY);
            if (!credentialsString) {
                return {
                    success: false,
                    error: 'সংরক্ষিত লগইন তথ্য পাওয়া যায়নি',
                };
            }

            const credentials = JSON.parse(credentialsString);
            return {
                success: true,
                credentials,
            };
        } catch (error) {
            console.error('Biometric login error:', error);
            return {
                success: false,
                error: 'বায়োমেট্রিক লগইনে সমস্যা হয়েছে',
            };
        }
    }

    /**
     * Show biometric setup prompt
     */
    static showBiometricSetupPrompt(
        onEnable: () => void,
        onSkip: () => void
    ): void {
        Alert.alert(
            'বায়োমেট্রিক লগইন',
            'আপনি কি ফিঙ্গারপ্রিন্ট বা ফেস আইডি দিয়ে দ্রুত লগইন করতে চান?',
            [
                {
                    text: 'এখন নয়',
                    style: 'cancel',
                    onPress: onSkip,
                },
                {
                    text: 'সক্রিয় করুন',
                    onPress: onEnable,
                },
            ]
        );
    }

    /**
     * Get available biometric types as display text
     */
    static async getAvailableBiometricTypes(): Promise<string[]> {
        try {
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
            return types.map(type => {
                switch (type) {
                    case LocalAuthentication.AuthenticationType.FINGERPRINT:
                        return 'ফিঙ্গারপ্রিন্ট';
                    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
                        return 'ফেস আইডি';
                    case LocalAuthentication.AuthenticationType.IRIS:
                        return 'আইরিস স্ক্যান';
                    default:
                        return 'বায়োমেট্রিক';
                }
            });
        } catch (error) {
            console.error('Error getting biometric types:', error);
            return [];
        }
    }
}