import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from './authStore';
import { useUserStore } from './userStore';
import { useChatStore } from './chatStore';
import { MessageType, RiskTolerance } from '../types';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { createMockUser, createMockPortfolio } from '../utils/mockData';

interface StoreContextType {
    initializeApp: () => Promise<void>;
    isAppReady: boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const useStoreContext = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStoreContext must be used within a StoreProvider');
    }
    return context;
};

interface StoreProviderProps {
    children: React.ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps): React.ReactElement => {
    const [isAppReady, setIsAppReady] = useState(false);
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const chatStore = useChatStore();

    const addWelcomeMessage = () => {
        if (chatStore.messages.length === 0) {
            chatStore.addMessage({
                userId: 'ai_assistant',
                text: 'স্বাগতম SmartFin BD তে! আমি আপনার ব্যক্তিগত আর্থিক পরামর্শদাতা। আপনার বিনিয়োগ, সঞ্চয় এবং আর্থিক পরিকল্পনা নিয়ে যেকোনো প্রশ্ন করতে পারেন। 🏦💰',
                type: MessageType.Text,
            });
        }
    };

    const initializeUserData = async () => {
        // Only initialize if no user data exists
        if (!userStore.user) {
            const mockUser = createMockUser();
            userStore.setUser(mockUser);

            const mockPortfolio = createMockPortfolio(mockUser.id);
            userStore.updatePortfolio(mockPortfolio);
        } else {
            console.log('User data already exists, skipping initialization');
        }
        addWelcomeMessage();
    };

    const initializeApp = async () => {
        try {
            if (authStore.isAuthenticated && authStore.token) {
                await initializeUserData();
            }
        } catch (error) {
            console.error('Failed to initialize app:', error);
        } finally {
            setIsAppReady(true);
        }
    };

    useEffect(() => {
        initializeApp();
    }, [authStore.isAuthenticated, authStore.token]);

    const contextValue: StoreContextType = {
        initializeApp,
        isAppReady,
    };

    if (!isAppReady) {
        return <LoadingScreen />;
    }

    return (
        <StoreContext.Provider value={contextValue}>
            {children}
        </StoreContext.Provider>
    );
};