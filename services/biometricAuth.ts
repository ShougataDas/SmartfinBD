import ReactNativeBiometrics from 'react-native-biometrics';
import { Alert } from 'react-native';
import { SecureStorageService } from './secureStorage';

/**
 * Biometric Authentication Service
 * Handles fingerprint, face ID, and other biometric authentication methods
 */

export interface BiometricAuthResult {
    success: boolean;
    error?: string;
    biometryType?: string;
}

export class BiometricAuthService {
    private static rnBiometrics = new ReactNativeBiometrics({
        allowDeviceCredentials: true,
    });

    /**
     * Check if biometric authentication is available on the device
     */
    static async isBiometricAvailable(): Promise<BiometricAuthResult> {
        try {
            const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();

            return {
                success: available,
                biometryType: biometryType || undefined,
            };
        } catch (error) {
            console.error('Error checking biometric availability:', error);
            return {
                success: false,
                error: 'Failed to check biometric availability',
            };
        }
    }

    /**
     * Get the type of biometric authentication available
     */
    static async getBiometryType(): Promise<string | null> {
        try {
            const { biometryType } = await this.rnBiometrics.isSensorAvailable();
            return biometryType || null;
        } catch (error) {
            console.error('Error getting biometry type:', error);
            return null;
        }
    }

    /**
     * Create biometric keys for secure authentication
     */
    static async createBiometricKeys(): Promise<BiometricAuthResult> {
        try {
            const { available } = await this.rnBiometrics.isSensorAvailable();

            if (!available) {
                return {
                    success: false,
                    error: 'Biometric authentication not available',
                };
            }

            const { keysExist } = await this.rnBiometrics.biometricKeysExist();

            if (!keysExist) {
                const { publicKey } = await this.rnBiometrics.createKeys();
                console.log('Biometric keys created:', publicKey);
            }

            return { success: true };
        } catch (error) {
            console.error('Error creating biometric keys:', error);
            return {
                success: false,
                error: 'Failed to create biometric keys',
            };
        }
    }

    /**
     * Delete biometric keys
     */
    static async deleteBiometricKeys(): Promise<BiometricAuthResult> {
        try {
            const { keysDeleted } = await this.rnBiometrics.deleteKeys();

            return {
                success: keysDeleted,
                error: keysDeleted ? undefined : 'Failed to delete biometric keys',
            };
        } catch (error) {
            console.error('Error deleting biometric keys:', error);
            return {
                success: false,
                error: 'Failed to delete biometric keys',
            };
        }
    }

    /**
     * Authenticate user with biometrics
     */
    static async authenticateWithBiometrics(
        promptMessage: string = 'আপনার পরিচয় যাচাই করুন'
    ): Promise<BiometricAuthResult> {
        try {
            const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();

            if (!available) {
                return {
                    success: false,
                    error: 'বায়োমেট্রিক প্রমাণীকরণ উপলব্ধ নেই',
                };
            }

            const { keysExist } = await this.rnBiometrics.biometricKeysExist();

            if (!keysExist) {
                // Create keys if they don't exist
                await this.createBiometricKeys();
            }

            const { success, signature } = await this.rnBiometrics.createSignature({
                promptMessage,
                payload: Date.now().toString(),
            });

            if (success && signature) {
                return {
                    success: true,
                    biometryType: biometryType || undefined,
                };
            } else {
                return {
                    success: false,
                    error: 'বায়োমেট্রিক প্রমাণীকরণ ব্যর্থ',
                };
            }
        } catch (error: any) {
            console.error('Biometric authentication error:', error);

            let errorMessage = 'বায়োমেট্রিক প্রমাণীকরণে সমস্যা হয়েছে';

            if (error.message?.includes('UserCancel')) {
                errorMessage = 'ব্যবহারকারী বাতিল করেছেন';
            } else if (error.message?.includes('UserFallback')) {
                errorMessage = 'বিকল্প পদ্ধতি ব্যবহার করুন';
            } else if (error.message?.includes('BiometryNotAvailable')) {
                errorMessage = 'বায়োমেট্রিক প্রমাণীকরণ উপলব্ধ নেই';
            } else if (error.message?.includes('BiometryNotEnrolled')) {
                errorMessage = 'বায়োমেট্রিক তথ্য নিবন্ধিত নেই';
            }

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Enable biometric authentication for the user
     */
    static async enableBiometricAuth(
        username: string,
        password: string
    ): Promise<BiometricAuthResult> {
        try {
            // First check if biometric is available
            const availabilityResult = await this.isBiometricAvailable();
            if (!availabilityResult.success) {
                return availabilityResult;
            }

            // Create biometric keys
            const keysResult = await this.createBiometricKeys();
            if (!keysResult.success) {
                return keysResult;
            }

            // Store user credentials securely
            await SecureStorageService.storeUserCredentials(username, password);

            // Set biometric preference
            await SecureStorageService.setBiometricEnabled(true);

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
            // Delete biometric keys
            await this.deleteBiometricKeys();

            // Clear stored credentials
            await SecureStorageService.clearUserCredentials();

            // Set biometric preference to false
            await SecureStorageService.setBiometricEnabled(false);

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
     * Login with biometric authentication
     */
    static async loginWithBiometrics(): Promise<{
        success: boolean;
        credentials?: { username: string; password: string };
        error?: string;
    }> {
        try {
            // Check if biometric is enabled
            const isEnabled = await SecureStorageService.isBiometricEnabled();
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
            const credentials = await SecureStorageService.getUserCredentials();
            if (!credentials) {
                return {
                    success: false,
                    error: 'সংরক্ষিত লগইন তথ্য পাওয়া যায়নি',
                };
            }

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
     * Get biometric type display name in Bengali
     */
    static getBiometricDisplayName(biometryType: string | null): string {
        switch (biometryType) {
            case 'TouchID':
                return 'টাচ আইডি';
            case 'FaceID':
                return 'ফেস আইডি';
            case 'Biometrics':
                return 'ফিঙ্গারপ্রিন্ট';
            default:
                return 'বায়োমেট্রিক';
        }
    }
}

