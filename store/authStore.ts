import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginForm, RegisterForm } from '@/types';

interface AuthState {
    isAuthenticated: boolean;
    hasCompletedOnboarding: boolean;
    token: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;
}

interface AuthActions {
    login: (credentials: LoginForm) => Promise<void>;
    register: (userData: RegisterForm) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    setOnboardingCompleted: () => void;
    refreshAuthToken: () => Promise<void>;
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

            // Actions
            login: async (credentials: LoginForm) => {
                set({ isLoading: true, error: null });

                try {
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    // Mock successful login
                    if (credentials.email && credentials.password) {
                        const mockToken = 'mock_jwt_token_' + Date.now();
                        const mockRefreshToken = 'mock_refresh_token_' + Date.now();

                        set({
                            isAuthenticated: true,
                            token: mockToken,
                            refreshToken: mockRefreshToken,
                            isLoading: false,
                            error: null,
                        });
                    } else {
                        throw new Error('Invalid credentials');
                    }
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Login failed',
                    });
                    throw error;
                }
            },

            register: async (userData: RegisterForm) => {
                set({ isLoading: true, error: null });

                try {
                    // Validate passwords match
                    if (userData.password !== userData.confirmPassword) {
                        throw new Error('Passwords do not match');
                    }

                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // Mock successful registration
                    const mockToken = 'mock_jwt_token_' + Date.now();
                    const mockRefreshToken = 'mock_refresh_token_' + Date.now();

                    set({
                        isAuthenticated: true,
                        token: mockToken,
                        refreshToken: mockRefreshToken,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Registration failed',
                    });
                    throw error;
                }
            },

            logout: () => {
                set({
                    isAuthenticated: false,
                    token: null,
                    refreshToken: null,
                    error: null,
                });
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
                    throw new Error('No refresh token available');
                }

                try {
                    // Simulate API call to refresh token
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const newToken = 'refreshed_token_' + Date.now();

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
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                hasCompletedOnboarding: state.hasCompletedOnboarding,
                token: state.token,
                refreshToken: state.refreshToken,
            }),
        }
    )
);

