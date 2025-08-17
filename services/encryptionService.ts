import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { logger } from "@/utils/logger";
import CryptoJS from "crypto-js";

const ALGORITHM = Crypto.CryptoDigestAlgorithm.SHA256;
const ENCODING = Crypto.CryptoEncoding.HEX;
const IV_LENGTH = 16; // For AES-256-CBC

export class EncryptionService {
  private static async getKey(): Promise<string> {
    let key = await SecureStore.getItemAsync("encryption_key");
    if (!key) {
      key = Buffer.from(Crypto.getRandomBytes(32)).toString(ENCODING); // 32 bytes for AES-256
      await SecureStore.setItemAsync("encryption_key", key);
    }
    return key;
  }
  static async encrypt(data: string): Promise<string> {
    try {
      const key = await this.getKey();
      const iv = CryptoJS.lib.WordArray.random(IV_LENGTH);
      const encrypted = CryptoJS.AES.encrypt(
        data,
        CryptoJS.enc.Hex.parse(key),
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );
      return `${iv.toString(CryptoJS.enc.Hex)}:${encrypted.ciphertext.toString(
        CryptoJS.enc.Hex
      )}`;
    } catch (error) {
      logger.error("Encryption failed:", error);
      throw new Error("Failed to encrypt data");
    }
  }
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      const [ivHex, cipherTextHex] = encryptedData.split(":");
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      const key = await this.getKey();
      const encrypted = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(cipherTextHex),
      });
      const decrypted = CryptoJS.AES.decrypt(
        encrypted,
        CryptoJS.enc.Hex.parse(key),
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      logger.error("Decryption failed:", error);
      throw new Error("Failed to decrypt data");
    }
  }
}
