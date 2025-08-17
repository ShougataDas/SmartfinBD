// src/utils/mockData.ts

import {
  User,
  FinancialProfile,
  Investment,
  InvestmentType,
  Message,
  InvestmentStatus,
  RiskAssessment,
  MessageType,
  EmploymentType,
  IncomeStability,
  RiskTolerance,
  Portfolio,
} from "../types";

export const createMockUser = (): User => {
  return {
    id: "mock_user_123",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+8801712345678",
    age: 30,
    gender: "male",
    occupation: "Software Engineer",
    profilePicture: "https://example.com/avatar.jpg",
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true,
    createdAt: new Date("2023-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-15T14:30:00Z"),
    financialProfile: {
      monthlyIncome: 50000,
      monthlyExpenses: 30000,
      currentSavings: 100000,
      dependents: 1,
      employmentType: EmploymentType.Private,
      incomeStability: IncomeStability.Stable,
      hasInsurance: true,
      hasEmergencyFund: true,
      financialGoals: ["retirement", "house", "education"],
    },
    riskAssessment: {
      riskTolerance: RiskTolerance.Moderate,
      tolerance: RiskTolerance.Moderate,
      investmentExperience: "intermediate",
      investmentHorizon: "medium",
      liquidityNeeds: "low",
      assessmentScore: 65,
      completedAt: new Date("2024-01-10T11:00:00Z"),
    },
    preferences: {
      language: "en" as const,
      currency: "BDT" as const,
      notifications: {
        email: true,
        push: true,
      },
      theme: "light" as const,
    },
  };
};

export const createMockPortfolio = (userId: string): Portfolio => {
  const investments: Investment[] = [
    {
      id: "inv_sanchayapatra_001",
      userId: userId,
      name: "5-Year Sanchayapatra",
      type: InvestmentType.Sanchayapatra,
      amount: 100000,
      currentValue: 108500,
      expectedReturn: 8.5,
      actualReturn: 8.5,
      startDate: new Date("2023-01-01T00:00:00Z"),
      maturityDate: new Date("2028-01-01T00:00:00Z"),
      status: InvestmentStatus.Active,
      details: {
        institution: "Bangladesh Bank",
        certificateNumber: "SB123456789",
        interestRate: 8.5,
      },
      performance: {
        monthlyReturns: [
          {
            month: new Date("2023-01-01T00:00:00Z"),
            value: 100708,
            return: 0.708,
          },
          {
            month: new Date("2023-02-01T00:00:00Z"),
            value: 101416,
            return: 0.708,
          },
        ],
        lastUpdated: new Date("2024-01-15T10:30:00Z"),
      },
      notifications: { maturityReminder: true, performanceAlerts: true },
      isActive: true,
      createdAt: new Date("2023-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-15T10:30:00Z"),
    },
    {
      id: "inv_dps_001",
      userId: userId,
      name: "Monthly DPS",
      type: InvestmentType.DPS,
      amount: 60000,
      currentValue: 65000,
      expectedReturn: 7.2,
      startDate: new Date("2023-03-01T00:00:00Z"),
      maturityDate: new Date("2028-03-01T00:00:00Z"),
      status: InvestmentStatus.Active,
      details: {
        institution: "Sonali Bank",
        accountNumber: "DPS123456789",
        monthlyInstallment: 5000,
        totalInstallments: 60,
        installmentsPaid: 10,
        interestRate: 7.2,
      },
      performance: {
        monthlyReturns: [
          { month: new Date("2023-03-01T00:00:00Z"), value: 5000, return: 0 },
          {
            month: new Date("2023-04-01T00:00:00Z"),
            value: 10030,
            return: 0.6,
          },
        ],
        lastUpdated: new Date("2024-01-15T10:30:00Z"),
      },
      notifications: { maturityReminder: true, performanceAlerts: true },
      isActive: true,
      createdAt: new Date("2023-03-01T00:00:00Z"),
      updatedAt: new Date("2024-01-15T10:30:00Z"),
    },
  ];

  const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalValue = investments.reduce(
    (sum, inv) => sum + inv.currentValue,
    0
  );

  return {
    userId,
    investments,
    totalInvestment,
    totalValue,
    lastUpdated: new Date(),
  };
};

export const createMockChatMessages = (userId: string): Message[] => {
  return [
    {
      userId: userId,
      text: "Hi SmartFin BD, I want to know about investment options in Bangladesh.",
      type: MessageType.Text,
      timestamp: new Date("2024-01-15T09:00:00Z"),
    },
    {
      userId: "ai_assistant",
      text: "Hello! I can help you with that. What kind of investments are you interested in, or what are your financial goals?",
      type: MessageType.Text,
      timestamp: new Date("2024-01-15T09:01:00Z"),
    },
  ];
};
