import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  User,
  FinancialProfile,
  Portfolio,
  FinancialGoal,
  RiskAssessment,
  Investment,
  InvestmentRecommendation,
  FinancialProfileForm,
  GoalForm,
  EmploymentType,
  IncomeStability,
  RiskTolerance,
  InvestmentType,
  RiskLevel,
} from "@/types";
import { API_CONFIG, getApiUrl } from "@/constants/config";
import { useAuthStore } from "./authStore";

interface UserState {
  user: User | null;
  financialProfile: FinancialProfile | null;
  portfolio: Portfolio | null;
  goals: FinancialGoal[];
  riskAssessment: RiskAssessment | null;
  recommendations: InvestmentRecommendation[];
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  updateFinancialProfile: (
    profile: FinancialProfileForm,
    isCreate: boolean
  ) => Promise<void>;
  updatePortfolio: (portfolio: Portfolio) => void;
  // addGoal: (goal: GoalForm) => Promise<void>;
  // updateGoal: (goalId: string, updates: Partial<FinancialGoal>) => void;
  // deleteGoal: (goalId: string) => void;
  setRiskAssessment: (assessment: RiskAssessment, isCreate: boolean) => void;
  addInvestment: (investment: any) => Promise<void>;
  updateInvestment: (investmentId: string, updates: Partial<any>) => void;
  setRecommendations: (recommendations: InvestmentRecommendation[]) => void;
  clearError: () => void;
  resetUserData: () => void;
  refreshUserData: () => Promise<void>;
  get investments(): Investment[];
}

type UserStore = UserState & UserActions;

const initialState: UserState = {
  user: null,
  financialProfile: null,
  portfolio: null,
  goals: [],
  riskAssessment: null,
  recommendations: [],
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user: User) => {
        set({ user });
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          // If profilePicture is being updated, save it securely
          if (
            updates.profilePicture &&
            updates.profilePicture !== user.profilePicture
          ) {
            // The ImageService.saveProfilePicture is called in the component
            // Here we just update the store
          }

          set({
            user: {
              ...user,
              ...updates,
              updatedAt: new Date(),
            },
          });
        }
      },

      updateFinancialProfile: async (
        profileData: FinancialProfileForm,
        isCreate: boolean
      ) => {
        if (isCreate) {
          set({ isLoading: true, error: null });

          try {
            const response = await fetch(
              getApiUrl(API_CONFIG.ENDPOINTS.FINANCIAL_PROFILE.UPDATE),
              {
                method: "PUT",
                body: JSON.stringify(profileData),
                headers: {
                  Authorization: `${useAuthStore.getState().token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            const { data } = await response.json();
            if (!data) {
              set({
                isLoading: false,
                error: "Failed to update financial profile",
              });
              return;
            }
            const { user } = get();
            if (!user) throw new Error("User not found");

            const updatedProfile: FinancialProfile = {
              ...data,
            };

            set({
              financialProfile: updatedProfile,
              isLoading: false,
            });

            // Update user's monthly income and savings
            get().updateUser({
              monthlyIncome: profileData.monthlyIncome,
              monthlySavings:
                profileData.monthlyIncome - profileData.monthlyExpenses,
              financialProfile: updatedProfile,
            });
          } catch (error) {
            set({
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to update profile",
            });
            throw error;
          }
        } else {
          set({ financialProfile: profileData });
        }
      },

      updatePortfolio: (portfolio: Portfolio) => {
        set({ portfolio });
      },

      // addGoal: async (goalData: GoalForm) => {
      //   set({ isLoading: true, error: null });

      //   try {
      //     // Simulate API call
      //     await new Promise((resolve) => setTimeout(resolve, 800));

      //     const { user, goals } = get();
      //     if (!user) throw new Error("User not found");

      //     const newGoal: FinancialGoal = {
      //       ...goalData,
      //       currentAmount: 0,
      //       progress: 0,
      //       isActive: true,
      //     };

      //     set({
      //       goals: [...goals, newGoal],
      //       isLoading: false,
      //     });
      //   } catch (error) {
      //     set({
      //       isLoading: false,
      //       error:
      //         error instanceof Error ? error.message : "Failed to add goal",
      //     });
      //     throw error;
      //   }
      // },

      // updateGoal: (goalId: string, updates: Partial<FinancialGoal>) => {
      //   const { goals } = get();
      //   const updatedGoals = goals.map((goal) =>
      //     goal.id === goalId ? { ...goal, ...updates } : goal
      //   );
      //   set({ goals: updatedGoals });
      // },

      // deleteGoal: (goalId: string) => {
      //   const { goals } = get();
      //   const filteredGoals = goals.filter((goal) => goal.id !== goalId);
      //   set({ goals: filteredGoals });
      // },

      setRiskAssessment: async (
        assessment: RiskAssessment,
        isCreate: boolean
      ) => {
        if (isCreate) {
          try {
            const response = await fetch(
              getApiUrl(API_CONFIG.ENDPOINTS.RISK_ASSESSMENT.CREATE),
              {
                method: "POST",
                body: JSON.stringify(assessment),
                headers: {
                  Authorization: `${useAuthStore.getState().token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            const { data } = await response.json();
            if (!data) {
              set({
                isLoading: false,
                error: "Failed to create risk assessment",
              });
              return;
            }
            set({ riskAssessment: data });
            // Update user's risk tolerance
            get().updateUser({
              riskTolerance: assessment.riskTolerance,
              riskAssessment: assessment,
            });
          } catch (error) {
            set({
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to create risk assessment",
            });
            throw error;
          }
        } else {
          set({ riskAssessment: assessment });
        }
      },

      addInvestment: async (investment: any) => {
        const { portfolio } = get();
        set({ isLoading: true, error: null });
        if (portfolio) {
          if (typeof investment.investAmount === "string") {
            investment.investAmount = parseInt(investment.investAmount);
          }
          if (typeof investment.total === "string") {
            investment.total = parseInt(investment.total);
          }
          if (typeof investment.expectedReturn === "string") {
            investment.expectedReturn = parseInt(investment.expectedReturn);
          }
          if (typeof investment.expectedMonthlyReturn === "string") {
            investment.expectedMonthlyReturn = parseInt(
              investment.expectedMonthlyReturn
            );
          }
          if (typeof investment.minimumReturn === "string") {
            investment.minimumReturn = parseInt(investment.minimumReturn);
          }
          if (typeof investment.averageReturn === "string") {
            investment.averageReturn = parseInt(investment.averageReturn);
          }
          if (typeof investment.maxReturn === "string") {
            investment.maxReturn = parseInt(investment.maxReturn);
          }
          if (typeof investment.expire === "string") {
            investment.expire = parseInt(investment.expire);
          }
          console.log("investment", investment);
          const response = await fetch(
            getApiUrl(API_CONFIG.ENDPOINTS.INVESTMENT.CREATE),
            {
              method: "POST",
              body: JSON.stringify(investment),
              headers: {
                Authorization: `${useAuthStore.getState().token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const { data } = await response.json();

          if (!data) {
            set({
              error: "Failed to add investment",
            });
            return;
          }
          const updatedInvestments = [...portfolio.investments, investment];
          const updatedPortfolio: Portfolio = {
            ...portfolio,
            investments: updatedInvestments,
            totalInvestment: updatedInvestments.reduce(
              (sum, inv) => sum + inv.investAmount,
              0
            ),
            totalValue: updatedInvestments.reduce(
              (sum, inv) => sum + inv.total,
              0
            ),
          };
          set({ portfolio: updatedPortfolio });
        }
      },

      updateInvestment: (investmentId: string, updates: Partial<any>) => {
        const { portfolio } = get();
        if (portfolio) {
          const updatedInvestments = portfolio.investments.map(
            (investment: any) =>
              investment.id === investmentId
                ? { ...investment, ...updates }
                : investment
          );
          const updatedPortfolio: Portfolio = {
            ...portfolio,
            investments: updatedInvestments,
            totalInvestment: updatedInvestments.reduce(
              (sum: number, inv: any) => sum + inv.investAmount,
              0
            ),
            totalValue: updatedInvestments.reduce(
              (sum: number, inv: any) => sum + inv.total,
              0
            ),
          };
          set({ portfolio: updatedPortfolio });
        }
      },

      setRecommendations: (recommendations: InvestmentRecommendation[]) => {
        set({ recommendations });
      },

      clearError: () => {
        set({ error: null });
      },

      resetUserData: () => {
        set(initialState);
      },

      refreshUserData: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            getApiUrl(API_CONFIG.ENDPOINTS.USER.PROFILE),
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `${useAuthStore.getState().token}`,
              },
            }
          );
          const { data } = await response.json();
          set({
            user: data,
          });
          // Don't overwrite existing data on refresh, just update loading state
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to refresh user data",
          });
          throw error;
        }
      },

      get investments(): Investment[] {
        return get().portfolio?.investments || [];
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        financialProfile: state.financialProfile,
        portfolio: state.portfolio,
        goals: state.goals,
        riskAssessment: state.riskAssessment,
        recommendations: state.recommendations,
      }),
      onRehydrateStorage: () => (state) => {
        console.log("User store rehydrated:", state);
      },
    }
  )
);
