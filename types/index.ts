// src/types/index.ts

// ============================================================================
// Enums
// ============================================================================

export enum MessageType {
  Text = "text",
  Image = "image",
  Suggestion = "suggestion",
  System = "system",
}

export interface Message {
  userId: string;
  text: string;
  type: MessageType;
  timestamp: Date;
}

export enum RiskTolerance {
  Conservative = "conservative",
  Moderate = "moderate",
  Aggressive = "aggressive",
}

export enum RiskLevel {
  Low = "low",
  Medium = "medium",
  High = "high",
}

export enum InvestmentType {
  Sanchayapatra = "sanchayapatra",
  DPS = "dps",
  MutualFund = "mutual_fund",
  Stock = "stock",
  FixedDeposit = "fixed_deposit",
  Bond = "bond",
  Other = "other",
}

export enum InvestmentStatus {
  Active = "active",
  Matured = "matured",
  Closed = "closed",
  Pending = "pending",
}

export enum EmploymentType {
  Government = "government",
  Private = "private",
  Business = "business",
  Freelance = "freelance",
  Student = "student",
  Retired = "retired",
  Other = "other",
}

export enum IncomeStability {
  Stable = "stable",
  Variable = "variable",
  Irregular = "irregular",
}

export enum InvestmentExperience {
  Beginner = "beginner",
  Intermediate = "intermediate",
  Advanced = "advanced",
}

// ============================================================================
// Interfaces - Core Models
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age: number;
  gender?: "male" | "female" | null;
  occupation?: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  monthlyIncome?: number;
  monthlySavings?: number;
  riskTolerance?: RiskTolerance;
  totalInvestment?: number;
  goalProgress?: number;
  financialProfile?: FinancialProfile;
  riskAssessment?: RiskAssessment;
  preferences: UserPreferences;
}

export interface FinancialProfile {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  dependents: number;
  employmentType: EmploymentType;
  incomeStability: IncomeStability;
  hasInsurance: boolean;
  hasEmergencyFund: boolean;
  debtAmount?: number;
  financialGoals: string[]; // e.g., ['retirement', 'house', 'education']
  existingInvestments?: Investment[];
  userId?: string;
  updatedAt?: Date;
}

export interface RiskAssessment {
  riskTolerance: RiskTolerance;
  tolerance: RiskTolerance; // Alias for riskTolerance for backward compatibility
  investmentExperience: "beginner" | "intermediate" | "advanced";
  investmentHorizon: "short" | "medium" | "long";
  liquidityNeeds: "low" | "medium" | "high";
  assessmentScore: number; // A calculated score based on answers
  completedAt?: Date;
}

export interface UserPreferences {
  language: "en" | "bn";
  currency: "BDT" | "USD";
  notifications: {
    email: boolean;
    push: boolean;
    sms?: boolean;
  };
  theme: "light" | "dark";
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  type: InvestmentType;
  amount: number; // Initial invested amount
  currentValue: number; // Current market value or calculated value
  expectedReturn: number; // Annual expected return percentage
  actualReturn?: number; // Actual annual return percentage
  startDate: Date;
  maturityDate?: Date;
  status: InvestmentStatus;
  details: InvestmentDetails; // Specific details based on investment type
  performance: PerformanceData;
  riskMetrics?: RiskMetrics;
  notifications: NotificationSettings;
  notes?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestmentDetails {
  // Common fields
  institution?: string;
  accountNumber?: string;
  interestRate?: number; // Annual interest rate

  // Sanchayapatra specific
  certificateNumber?: string;

  // DPS specific
  monthlyInstallment?: number;
  totalInstallments?: number;
  installmentsPaid?: number;

  // Mutual Fund specific
  fundName?: string;
  nav?: number; // Net Asset Value
  units?: number;

  // Stock specific
  symbol?: string;
  exchange?: string;
  shares?: number;
  purchasePrice?: number;
}

export interface PerformanceData {
  monthlyReturns: { month: Date; value: number; return: number }[];
  lastUpdated: Date;
}

export interface RiskMetrics {
  volatility?: number;
  sharpeRatio?: number;
  beta?: number;
  maxDrawdown?: number;
}

export interface NotificationSettings {
  maturityReminder: boolean;
  performanceAlerts: boolean;
  newsUpdates?: boolean;
}

export interface InvestmentRecommendation {
  id: string;
  userId: string;
  investmentType: InvestmentType;
  name: string;
  recommendedAmount: number;
  expectedReturn: number;
  suitabilityScore: number; // 0-100
  riskLevel: RiskLevel;
  reasoning: string;
  pros: string[];
  cons: string[];
  minimumAmount: number;
  maximumAmount: number;
  tenure: {
    minimum: number;
    maximum: number;
    unit: "months" | "years";
  };
  features: string[];
  createdAt: Date;
}

export interface Portfolio {
  userId: string;
  investments: Investment[];
  totalInvestment: number;
  totalValue: number;
  lastUpdated: Date;
}

export interface FinancialGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  priority: "low" | "medium" | "high";
  category:
    | "retirement"
    | "house"
    | "education"
    | "emergency"
    | "vacation"
    | "other";
  progress: number; // 0-100
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface FinancialProfileForm {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  dependents: number;
  employmentType: EmploymentType;
  incomeStability: IncomeStability;
  hasInsurance: boolean;
  hasEmergencyFund: boolean;
  debtAmount?: number;
  financialGoals: string[];
}

export interface GoalForm {
  name: string;
  targetAmount: number;
  targetDate: Date;
  priority: "low" | "medium" | "high";
  category:
    | "retirement"
    | "house"
    | "education"
    | "emergency"
    | "vacation"
    | "other";
}

export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  name: string;
  email: string;
  phone?: string;
  age: number;
  gender?: "male" | "female" | "other";
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface ChatMessage {
  id?: string; // Optional, as it might be generated by backend
  userId: string; // 'ai_assistant' or user's ID
  text: string;
  content?: string; // Alias for text for backward compatibility
  type: MessageType;
  isUser?: boolean; // Whether this message is from the user
  timestamp?: Date; // Optional, will be set by backend/frontend
  suggestions?: ChatSuggestion[];
  relatedTopics?: string[];
  language?: "en" | "bn";
}

export interface ChatSuggestion {
  text: string;
  action: string; // e.g., 'learn_more', 'open_calculator', 'view_recommendations'
  data?: any; // Additional data for the action
}

export interface ChatResponse {
  success: boolean;
  message: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// API Response Structures
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  code?: string;
}

export interface AuthResponseData {
  token: string;
  user: User;
}

export interface LoginResponse extends ApiResponse<AuthResponseData> {}
export interface RegisterResponse extends ApiResponse<AuthResponseData> {}

export interface UserProfileResponse extends ApiResponse<User> {}
export interface FinancialProfileUpdateResponse
  extends ApiResponse<FinancialProfile> {}
export interface RiskAssessmentUpdateResponse
  extends ApiResponse<RiskAssessment> {}

export interface InvestmentsResponseData {
  investments: Investment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary: {
    totalValue: number;
    totalInvested: number;
    totalReturn: number;
    returnPercentage: number;
  };
}
export interface InvestmentsResponse
  extends ApiResponse<InvestmentsResponseData> {}
export interface InvestmentCreateUpdateResponse
  extends ApiResponse<Investment> {}

export interface RecommendationsResponseData {
  recommendations: InvestmentRecommendation[];
  summary: {
    totalRecommendations: number;
    averageSuitabilityScore: number;
    recommendedPortfolio: {
      conservative: number;
      moderate: number;
      aggressive: number;
    };
  };
  generatedAt: Date;
  validUntil: Date;
}
export interface RecommendationsResponse
  extends ApiResponse<RecommendationsResponseData> {}

export interface ChatMessageResponseData {
  id: string;
  message: string;
  suggestions?: ChatSuggestion[];
  relatedTopics?: string[];
  timestamp: Date;
  language: "en" | "bn";
}
export interface ChatMessageResponse
  extends ApiResponse<ChatMessageResponseData> {}

export interface ChatHistoryResponseData {
  messages: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
export interface ChatHistoryResponse
  extends ApiResponse<ChatHistoryResponseData> {}

export interface PortfolioAnalyticsResponseData {
  summary: {
    totalValue: number;
    totalInvested: number;
    totalReturn: number;
    returnPercentage: number;
    monthlyGrowth: number;
    yearlyProjection: number;
  };
  allocation: {
    byType: { type: InvestmentType; value: number; percentage: number }[];
    byRisk: { level: RiskTolerance; value: number; percentage: number }[];
  };
  performance: {
    monthly: {
      month: string;
      value: number;
      return: number;
      benchmark: number;
    }[];
    yearly: {
      year: string;
      value: number;
      return: number;
      benchmark: number;
    }[];
  };
  riskMetrics: {
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    beta: number;
  };
}
export interface PortfolioAnalyticsResponse
  extends ApiResponse<PortfolioAnalyticsResponseData> {}

// ============================================================================
// Other Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
