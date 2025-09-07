import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import type { LoginForm, RegisterForm } from "@/types";
import { BiometricService } from "@/services/biometricService";
import { navigate } from "expo-router/build/global-state/routing";
import { getApiUrl, API_CONFIG } from "@/constants/config";
import { useUserStore } from "./userStore";

interface AuthState {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  biometricEnabled: boolean;
  biometricAvailable: boolean;
}

interface AuthActions {
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setOnboardingCompleted: () => void;
  refreshAuthToken: () => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
  enableBiometricAuth: (email: string, password: string) => Promise<void>;
  disableBiometricAuth: () => Promise<void>;
  checkBiometricStatus: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      biometricEnabled: false,
      biometricAvailable: false,

      // Actions
      login: async (credentials: LoginForm) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(
            getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN),
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(credentials),
            }
          );
          const { data } = await response.json();

          if (data) {
            set({
              isAuthenticated: true,
              token: data.accessToken,
              refreshToken: data.accessToken,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              error: "Login failed",
            });
            throw new Error("Login failed");
          }
          // Mock successful login

          // const capability = await BiometricService.checkBiometricCapability()
          // if (capability.isAvailable && !get().biometricEnabled) {
          //     setTimeout(() => {
          //         BiometricService.showBiometricSetupPrompt(
          //             () => get().enableBiometricAuth(credentials.email, credentials.password),
          //             () => console.log("Biometric setup skipped"),
          //         )
          //     }, 1000)
          // }
        } catch (error) {
          console.error("Login error:", error);
          let errorMessage = "Login failed";

          if (error instanceof Error) {
            if (error.message.includes("Network request failed")) {
              errorMessage =
                "Cannot connect to server. Please check your internet connection and ensure the backend server is running.";
            } else if (error.message.includes("fetch")) {
              errorMessage = "Network error. Please try again.";
            } else {
              errorMessage = error.message;
            }
          }

          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      register: async (userData: RegisterForm) => {
        set({ isLoading: true, error: null });

        try {
          // Validate passwords match
          if (userData.password !== userData.confirmPassword) {
            throw new Error("Passwords do not match");
          }
          console.log("userData", userData);
          const response = await fetch(
            getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER),
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                age: userData.age,
                phone: userData.phone,
              }),
            }
          );
          const { data } = await response.json();

          if (data) {
            const capability =
              await BiometricService.checkBiometricCapability();
            if (capability.isAvailable) {
              setTimeout(() => {
                BiometricService.showBiometricSetupPrompt(
                  () =>
                    get().enableBiometricAuth(
                      userData.email,
                      userData.password
                    ),
                  () => console.log("Biometric setup skipped")
                );
              }, 1000);
            }
            set({ isLoading: false });
          } else {
            set({ isLoading: false });
            throw new Error("Registration failed");
          }
        } catch (error) {
          console.error("Registration error:", error);
          let errorMessage = "Registration failed";

          if (error instanceof Error) {
            if (error.message.includes("Network request failed")) {
              errorMessage =
                "Cannot connect to server. Please check your internet connection and ensure the backend server is running.";
            } else if (error.message.includes("fetch")) {
              errorMessage = "Network error. Please try again.";
            } else {
              errorMessage = error.message;
            }
          }

          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      loginWithBiometrics: async () => {
        set({ isLoading: true, error: null });

        try {
          const result = await BiometricService.loginWithBiometrics();

          if (result.success && result.credentials) {
            // Use stored credentials to login
            await get().login({
              email: result.credentials.email,
              password: result.credentials.password,
            });
          } else {
            throw new Error(result.error || "Biometric login failed");
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Biometric login failed",
          });
          throw error;
        }
      },

      enableBiometricAuth: async (email: string, password: string) => {
        try {
          const result = await BiometricService.enableBiometricAuth(
            email,
            password
          );

          if (result.success) {
            set({ biometricEnabled: true });
            Alert.alert(
              "বায়োমেট্রিক লগইন সক্রিয়",
              "আপনি এখন ফিঙ্গারপ্রিন্ট বা ফেস আইডি দিয়ে লগইন করতে পারবেন।",
              [{ text: "ঠিক আছে" }]
            );
          } else {
            throw new Error(result.error || "Failed to enable biometric auth");
          }
        } catch (error) {
          Alert.alert(
            "বায়োমেট্রিক সেটআপ ব্যর্থ",
            error instanceof Error
              ? error.message
              : "বায়োমেট্রিক প্রমাণীকরণ সক্রিয় করতে সমস্যা হয়েছে",
            [{ text: "ঠিক আছে" }]
          );
        }
      },

      disableBiometricAuth: async () => {
        try {
          const result = await BiometricService.disableBiometricAuth();

          if (result.success) {
            set({ biometricEnabled: false });
            Alert.alert(
              "বায়োমেট্রিক লগইন বন্ধ",
              "বায়োমেট্রিক লগইন সফলভাবে বন্ধ করা হয়েছে।",
              [{ text: "ঠিক আছে" }]
            );
          } else {
            throw new Error(result.error || "Failed to disable biometric auth");
          }
        } catch (error) {
          Alert.alert(
            "ত্রুটি",
            error instanceof Error
              ? error.message
              : "বায়োমেট্রিক প্রমাণীকরণ বন্ধ করতে সমস্যা হয়েছে",
            [{ text: "ঠিক আছে" }]
          );
        }
      },

      checkBiometricStatus: async () => {
        try {
          const capability = await BiometricService.checkBiometricCapability();
          const isEnabled = await BiometricService.isBiometricEnabled();

          set({
            biometricAvailable: capability.isAvailable,
            biometricEnabled: isEnabled && capability.isAvailable,
          });
        } catch (error) {
          console.error("Error checking biometric status:", error);
          set({
            biometricAvailable: false,
            biometricEnabled: false,
          });
        }
      },
      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          refreshToken: null,
          error: null,
        });
        useUserStore.getState().resetUserData();
      },

      clearError: () => {
        set({ error: null });
      },

      setOnboardingCompleted: () => {
        set({ hasCompletedOnboarding: true });
      },

      refreshAuthToken: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        try {
          // Simulate API call to refresh token
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const newToken = "refreshed_token_" + Date.now();

          set({
            token: newToken,
            error: null,
          });
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        token: state.token,
        refreshToken: state.refreshToken,
        biometricEnabled: state.biometricEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        console.log("Auth store rehydrated:", state);
        // Check biometric status after rehydration
        if (state) {
          state.checkBiometricStatus();
        }
      },
    }
  )
);
