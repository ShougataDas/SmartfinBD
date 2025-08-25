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
  updateFinancialProfile: (profile: FinancialProfileForm) => Promise<void>;
  updatePortfolio: (portfolio: Portfolio) => void;
  addGoal: (goal: GoalForm) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<FinancialGoal>) => void;
  deleteGoal: (goalId: string) => void;
  setRiskAssessment: (assessment: RiskAssessment) => void;
  addInvestment: (investment: Investment) => void;
  updateInvestment: (
    investmentId: string,
    updates: Partial<Investment>
  ) => void;
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
          set({
            user: {
              ...user,
              ...updates,
              updatedAt: new Date(),
            },
          });
        }
      },

      updateFinancialProfile: async (profileData: FinancialProfileForm) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const { user } = get();
          if (!user) throw new Error("User not found");

          const updatedProfile: FinancialProfile = {
            ...profileData,
            userId: user.id,
            existingInvestments: get().portfolio?.investments || [],
            updatedAt: new Date(),
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
      },

      updatePortfolio: (portfolio: Portfolio) => {
        set({ portfolio });
      },

      addGoal: async (goalData: GoalForm) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 800));

          const { user, goals } = get();
          if (!user) throw new Error("User not found");

          const newGoal: FinancialGoal = {
            id: Date.now().toString(),
            userId: user.id,
            ...goalData,
            currentAmount: 0,
            progress: 0,
            isActive: true,
            createdAt: new Date(),
          };

          set({
            goals: [...goals, newGoal],
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to add goal",
          });
          throw error;
        }
      },

      updateGoal: (goalId: string, updates: Partial<FinancialGoal>) => {
        const { goals } = get();
        const updatedGoals = goals.map((goal) =>
          goal.id === goalId ? { ...goal, ...updates } : goal
        );
        set({ goals: updatedGoals });
      },

      deleteGoal: (goalId: string) => {
        const { goals } = get();
        const filteredGoals = goals.filter((goal) => goal.id !== goalId);
        set({ goals: filteredGoals });
      },

      setRiskAssessment: (assessment: RiskAssessment) => {
        set({ riskAssessment: assessment });

        // Update user's risk tolerance
        get().updateUser({
          riskTolerance: assessment.riskTolerance,
          riskAssessment: assessment,
        });
      },

      addInvestment: (investment: Investment) => {
        const { portfolio } = get();
        if (portfolio) {
          const updatedInvestments = [...portfolio.investments, investment];
          const updatedPortfolio: Portfolio = {
            ...portfolio,
            investments: updatedInvestments,
            totalInvestment: updatedInvestments.reduce(
              (sum, inv) => sum + inv.amount,
              0
            ),
            totalValue: updatedInvestments.reduce(
              (sum, inv) => sum + inv.currentValue,
              0
            ),
            lastUpdated: new Date(),
          };
          set({ portfolio: updatedPortfolio });
        }
      },

      updateInvestment: (
        investmentId: string,
        updates: Partial<Investment>
      ) => {
        const { portfolio } = get();
        if (portfolio) {
          const updatedInvestments = portfolio.investments.map(
            (investment: Investment) =>
              investment.id === investmentId
                ? { ...investment, ...updates }
                : investment
          );
          const updatedPortfolio: Portfolio = {
            ...portfolio,
            investments: updatedInvestments,
            totalInvestment: updatedInvestments.reduce(
              (sum: number, inv: Investment) => sum + inv.amount,
              0
            ),
            totalValue: updatedInvestments.reduce(
              (sum: number, inv: Investment) => sum + inv.currentValue,
              0
            ),
            lastUpdated: new Date(),
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
          // Simulate fetching user data from API
          await new Promise((resolve) => setTimeout(resolve, 1500));
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
        console.log('User store rehydrated:', state);
      },
    }
  )
);
