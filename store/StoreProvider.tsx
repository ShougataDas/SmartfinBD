import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "./authStore";
import { useUserStore } from "./userStore";
import { useChatStore } from "./chatStore";
import { MessageType, RiskTolerance, User } from "../types";
import { LoadingScreen } from "../components/common/LoadingScreen";

import { API_CONFIG, getApiUrl } from "@/constants/config";

interface StoreContextType {
  initializeApp: () => Promise<void>;
  isAppReady: boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStoreContext must be used within a StoreProvider");
  }
  return context;
};

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider = ({
  children,
}: StoreProviderProps): React.ReactElement => {
  const [isAppReady, setIsAppReady] = useState(false);
  const authStore = useAuthStore();
  const userStore = useUserStore();
  const chatStore = useChatStore();

  const addWelcomeMessage = () => {
    if (chatStore.messages.length === 0) {
      chatStore.addMessage({
        userId: "ai_assistant",
        text: "স্বাগতম SmartFin BD তে! আমি আপনার ব্যক্তিগত আর্থিক পরামর্শদাতা। আপনার বিনিয়োগ, সঞ্চয় এবং আর্থিক পরিকল্পনা নিয়ে যেকোনো প্রশ্ন করতে পারেন। 🏦💰",
        type: MessageType.Text,
      });
    }
  };

  const initializeUserData = async () => {
    // Only initialize if no user data exists

    if (!userStore.user) {
      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.USER.PROFILE),
        {
          method: "GET",
          headers: {
            Authorization: `${useAuthStore.getState().token}`,
          },
        }
      );
      const { data: userData } = await response.json();
      userStore.setUser(userData);
    }
    if (!userStore.financialProfile) {
      const financialProfile = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.FINANCIAL_PROFILE.GET),
        {
          method: "GET",
          headers: {
            Authorization: `${useAuthStore.getState().token}`,
          },
        }
      );
      const { data: financialProfileData } = await financialProfile.json();
      if (financialProfileData) {
        userStore.updateFinancialProfile(financialProfileData, false);
      }
    }
    if (!userStore.riskAssessment) {
      const riskAssessment = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.RISK_ASSESSMENT.GET),
        {
          method: "GET",
          headers: {
            Authorization: `${useAuthStore.getState().token}`,
          },
        }
      );
      const { data: riskAssessmentData } = await riskAssessment.json();
      console.log(
        "Risk assessment data from store provider",
        riskAssessmentData
      );
      if (riskAssessmentData) {
        userStore.setRiskAssessment(riskAssessmentData, false);
      }
    }
    if (!userStore.portfolio) {
      const investments = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.INVESTMENT.GET),
        {
          method: "GET",
          headers: {
            Authorization: `${useAuthStore.getState().token}`,
          },
        }
      );
      const { data: investmentsData } = await investments.json();
      if (investmentsData) {
        userStore.updatePortfolio({
          userId: investmentsData.userId || "",
          investments: investmentsData,
          totalInvestment: investmentsData.reduce(
            (acc: number, curr: any) => acc + curr.investAmount,
            0
          ),
          totalValue: investmentsData.reduce(
            (acc: number, curr: any) => acc + curr.total,
            0
          ),
        });
      }
    }
    addWelcomeMessage();
  };

  const initializeApp = async () => {
    try {
      if (authStore.isAuthenticated && authStore.token) {
        await initializeUserData();
      }
    } catch (error) {
      console.error("Failed to initialize app:", error);
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
