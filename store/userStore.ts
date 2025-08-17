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
            userId: user.id,
            ...profileData,
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
          riskTolerance: assessment.tolerance,
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
          // In a real app, you would fetch user, financialProfile, portfolio, goals, riskAssessment, recommendations
          // For now, we'll just simulate it by updating state with dummy data
          const user: User = {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            age: 30,
            isEmailVerified: true,
            isPhoneVerified: false,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            preferences: {
              language: "en",
              currency: "BDT",
              notifications: {
                email: true,
                push: true,
              },
              theme: "light",
            },
          };
          const financialProfile: FinancialProfile = {
            userId: user.id,
            monthlyIncome: 50000,
            monthlyExpenses: 30000,
            currentSavings: 100000,
            dependents: 2,
            employmentType: EmploymentType.Private,
            incomeStability: IncomeStability.Stable,
            hasInsurance: true,
            hasEmergencyFund: true,
            financialGoals: ["retirement", "house"],
            existingInvestments: [],
            updatedAt: new Date(),
          };
          const portfolio: Portfolio = {
            userId: user.id,
            investments: [],
            totalInvestment: 0,
            totalValue: 0,
            lastUpdated: new Date(),
          };
          const goals: FinancialGoal[] = [
            {
              id: "1",
              userId: user.id,
              name: "Emergency Fund",
              targetAmount: 100000,
              currentAmount: 50000,
              targetDate: new Date(2025, 11, 31),
              priority: "high",
              category: "emergency",
              progress: 50,
              isActive: true,
              createdAt: new Date(),
            },
            {
              id: "2",
              userId: user.id,
              name: "Retirement",
              targetAmount: 10000000,
              currentAmount: 500000,
              targetDate: new Date(2050, 11, 31),
              priority: "medium",
              category: "retirement",
              progress: 5,
              isActive: true,
              createdAt: new Date(),
            },
          ];
          const riskAssessment: RiskAssessment = {
            riskTolerance: RiskTolerance.Moderate,
            tolerance: RiskTolerance.Moderate,
            investmentExperience: "beginner",
            investmentHorizon: "long",
            liquidityNeeds: "medium",
            assessmentScore: 65,
            completedAt: new Date(),
          };
          const recommendations: InvestmentRecommendation[] = [
            {
              id: "1",
              userId: user.id,
              investmentType: InvestmentType.MutualFund,
              name: "S&P 500 Index Fund",
              recommendedAmount: 50000,
              expectedReturn: 12,
              suitabilityScore: 85,
              riskLevel: RiskLevel.Medium,
              reasoning: "Good for long-term growth",
              pros: ["Diversified", "Low fees"],
              cons: ["Market volatility"],
              minimumAmount: 10000,
              maximumAmount: 1000000,
              tenure: {
                minimum: 5,
                maximum: 30,
                unit: "years",
              },
              features: ["Diversification", "Professional management"],
              createdAt: new Date(),
            },
            {
              id: "2",
              userId: user.id,
              investmentType: InvestmentType.FixedDeposit,
              name: "US Treasury Bonds",
              recommendedAmount: 30000,
              expectedReturn: 3,
              suitabilityScore: 70,
              riskLevel: RiskLevel.Low,
              reasoning: "Stable returns for conservative investors",
              pros: ["Low risk", "Stable returns"],
              cons: ["Lower returns"],
              minimumAmount: 5000,
              maximumAmount: 500000,
              tenure: {
                minimum: 1,
                maximum: 10,
                unit: "years",
              },
              features: ["Government backed", "Fixed returns"],
              createdAt: new Date(),
            },
          ];

          set({
            user,
            financialProfile,
            portfolio,
            goals,
            riskAssessment,
            recommendations,
            isLoading: false,
          });
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
      }),
    }
  )
);
