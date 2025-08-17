// src/services/platformService.ts

import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export class PlatformService {
    static getOS(): 'ios' | 'android' | 'web' | 'windows' | 'macos' | 'unknown' {
        return Platform.OS;
    }

    static getOSVersion(): string {
        return Platform.Version.toString();
    }

    static isIOS(): boolean {
        return Platform.OS === 'ios';
    }

    static isAndroid(): boolean {
        return Platform.OS === 'android';
    }

    static async supportsBiometrics(): Promise<boolean> {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return hasHardware && isEnrolled;
    }

    static async authenticateWithBiometrics(): Promise<LocalAuthentication.LocalAuthenticationResult> {
        return LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate to access SmartFin BD',
            cancelLabel: 'Cancel',
            disableDeviceFallback: true,
        });
    }

    static async supportsKeychain(): Promise<boolean> {
        return SecureStore.isAvailableAsync();
    }

    static async supportsFingerprint(): Promise<boolean> {
        if (Platform.OS === 'android') {
            const result = await LocalAuthentication.supportedAuthenticationTypesAsync();
            return result.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
        }
        return false;
    }

    static async supportsFaceID(): Promise<boolean> {
        if (Platform.OS === 'ios') {
            const result = await LocalAuthentication.supportedAuthenticationTypesAsync();
            return result.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
        }
        return false;
    }

    static async supportsKeystore(): Promise<boolean> {
        // Android Keystore is implicitly used by SecureStore on Android
        return SecureStore.isAvailableAsync();
    }
}
