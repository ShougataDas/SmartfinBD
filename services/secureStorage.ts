import EncryptedStorage from "react-native-encrypted-storage";
import Keychain from "react-native-keychain";

/**
 * Secure Storage Service
 * Handles encrypted storage of sensitive data like tokens, passwords, etc.
 */

export class SecureStorageService {
  // Keys for different types of data
  private static readonly KEYS = {
    AUTH_TOKEN: "auth_token",
    REFRESH_TOKEN: "refresh_token",
    USER_CREDENTIALS: "user_credentials",
    BIOMETRIC_ENABLED: "biometric_enabled",
    PIN_CODE: "pin_code",
    FINANCIAL_DATA: "financial_data",
  };

  /**
   * Store authentication tokens securely
   */
  static async storeAuthTokens(
    token: string,
    refreshToken: string
  ): Promise<void> {
    try {
      await Promise.all([
        EncryptedStorage.setItem(this.KEYS.AUTH_TOKEN, token),
        EncryptedStorage.setItem(this.KEYS.REFRESH_TOKEN, refreshToken),
      ]);
    } catch (error) {
      console.error("Failed to store auth tokens:", error);
      throw new Error("Failed to store authentication tokens");
    }
  }

  /**
   * Retrieve authentication tokens
   */
  static async getAuthTokens(): Promise<{
    token: string | null;
    refreshToken: string | null;
  }> {
    try {
      const [token, refreshToken] = await Promise.all([
        EncryptedStorage.getItem(this.KEYS.AUTH_TOKEN),
        EncryptedStorage.getItem(this.KEYS.REFRESH_TOKEN),
      ]);
      return { token, refreshToken };
    } catch (error) {
      console.error("Failed to retrieve auth tokens:", error);
      return { token: null, refreshToken: null };
    }
  }

  /**
   * Clear authentication tokens
   */
  static async clearAuthTokens(): Promise<void> {
    try {
      await Promise.all([
        EncryptedStorage.removeItem(this.KEYS.AUTH_TOKEN),
        EncryptedStorage.removeItem(this.KEYS.REFRESH_TOKEN),
      ]);
    } catch (error) {
      console.error("Failed to clear auth tokens:", error);
    }
  }

  /**
   * Store user credentials for biometric login
   */
  static async storeUserCredentials(
    username: string,
    password: string
  ): Promise<void> {
    try {
      await Keychain.setInternetCredentials("SmartFinBD", username, password, {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      });
    } catch (error) {
      console.error("Failed to store user credentials:", error);
      throw new Error("Failed to store credentials for biometric login");
    }
  }

  /**
   * Retrieve user credentials with biometric authentication
   */
  static async getUserCredentials(): Promise<{
    username: string;
    password: string;
  } | null> {
    try {
      const credentials = await Keychain.getInternetCredentials("SmartFinBD");
      if (credentials && credentials.username && credentials.password) {
        return {
          username: credentials.username,
          password: credentials.password,
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to retrieve user credentials:", error);
      return null;
    }
  }

  /**
   * Clear user credentials
   */
  static async clearUserCredentials(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials({
        server: "SmartFinBD",
      });
    } catch (error) {
      console.error("Failed to clear user credentials:", error);
    }
  }

  /**
   * Check if biometric authentication is available
   */
  static async isBiometricAvailable(): Promise<boolean> {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      return biometryType !== null;
    } catch (error) {
      console.error("Failed to check biometric availability:", error);
      return false;
    }
  }

  /**
   * Get supported biometry type
   */
  static async getBiometryType(): Promise<string | null> {
    try {
      return await Keychain.getSupportedBiometryType();
    } catch (error) {
      console.error("Failed to get biometry type:", error);
      return null;
    }
  }

  /**
   * Store biometric preference
   */
  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await EncryptedStorage.setItem(
        this.KEYS.BIOMETRIC_ENABLED,
        enabled.toString()
      );
    } catch (error) {
      console.error("Failed to store biometric preference:", error);
    }
  }

  /**
   * Get biometric preference
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await EncryptedStorage.getItem(
        this.KEYS.BIOMETRIC_ENABLED
      );
      return enabled === "true";
    } catch (error) {
      console.error("Failed to get biometric preference:", error);
      return false;
    }
  }

  /**
   * Store PIN code securely
   */
  static async storePinCode(pin: string): Promise<void> {
    try {
      await EncryptedStorage.setItem(this.KEYS.PIN_CODE, pin);
    } catch (error) {
      console.error("Failed to store PIN code:", error);
      throw new Error("Failed to store PIN code");
    }
  }

  /**
   * Verify PIN code
   */
  static async verifyPinCode(pin: string): Promise<boolean> {
    try {
      const storedPin = await EncryptedStorage.getItem(this.KEYS.PIN_CODE);
      return storedPin === pin;
    } catch (error) {
      console.error("Failed to verify PIN code:", error);
      return false;
    }
  }

  /**
   * Clear PIN code
   */
  static async clearPinCode(): Promise<void> {
    try {
      await EncryptedStorage.removeItem(this.KEYS.PIN_CODE);
    } catch (error) {
      console.error("Failed to clear PIN code:", error);
    }
  }

  /**
   * Store sensitive financial data
   */
  static async storeFinancialData(data: any): Promise<void> {
    try {
      await EncryptedStorage.setItem(
        this.KEYS.FINANCIAL_DATA,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error("Failed to store financial data:", error);
      throw new Error("Failed to store financial data");
    }
  }

  /**
   * Retrieve financial data
   */
  static async getFinancialData(): Promise<any | null> {
    try {
      const data = await EncryptedStorage.getItem(this.KEYS.FINANCIAL_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to retrieve financial data:", error);
      return null;
    }
  }

  /**
   * Clear all stored data
   */
  static async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        EncryptedStorage.clear(),
        this.clearUserCredentials(),
      ]);
    } catch (error) {
      console.error("Failed to clear all data:", error);
    }
  }

  /**
   * Store generic encrypted data
   */
  static async storeData(key: string, value: string): Promise<void> {
    try {
      await EncryptedStorage.setItem(key, value);
    } catch (error) {
      console.error(`Failed to store data for key ${key}:`, error);
      throw new Error(`Failed to store data for key ${key}`);
    }
  }

  /**
   * Retrieve generic encrypted data
   */
  static async getData(key: string): Promise<string | null> {
    try {
      return await EncryptedStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to retrieve data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove specific data
   */
  static async removeData(key: string): Promise<void> {
    try {
      await EncryptedStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove data for key ${key}:`, error);
    }
  }
}
