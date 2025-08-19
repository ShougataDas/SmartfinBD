import {
  User,
  FinancialProfile,
  RiskAssessment,
  InvestmentRecommendation,
  InvestmentType,
  RiskLevel,
  RiskTolerance,
} from "@/types";
import {
  calculateCompoundInterest,
  calculateSIPFutureValue,
  calculateSIPAmount,
} from "@/utils/formatters";

/**
 * Investment Recommendation Service
 * Provides personalized investment recommendations based on user profile and risk assessment
 */

interface BangladeshInvestmentOption {
  type: InvestmentType;
  name: string;
  nameEn: string;
  description: string;
  expectedReturn: number;
  minInvestment: number;
  maxInvestment?: number;
  riskLevel: RiskLevel;
  liquidityDays: number;
  taxBenefit: boolean;
  features: string[];
  pros: string[];
  cons: string[];
  eligibility: string[];
  provider: string;
  category:
    | "government"
    | "bank"
    | "stock"
    | "mutual_fund"
    | "bond"
    | "sanchayapatra";
}

const bangladeshInvestments: BangladeshInvestmentOption[] = [
  {
    type: InvestmentType.Sanchayapatra,
    name: "সঞ্চয়পত্র",
    nameEn: "Sanchayapatra",
    description: "সরকারি সঞ্চয়পত্র - সবচেয়ে নিরাপদ বিনিয়োগ মাধ্যম",
    expectedReturn: 8.5,
    minInvestment: 1000,
    maxInvestment: 3000000,
    riskLevel: RiskLevel.Low,
    liquidityDays: 365,
    taxBenefit: true,
    features: ["সরকারি গ্যারান্টি", "নিয়মিত সুদ", "কর সুবিধা"],
    pros: [
      "সরকারি গ্যারান্টি",
      "নিশ্চিত রিটার্ন",
      "কর সুবিধা (সীমিত)",
      "মুদ্রাস্ফীতির চেয়ে ভালো রিটার্ন",
    ],
    cons: ["তুলনামূলক কম রিটার্ন", "তরলতা সীমিত", "বিনিয়োগ সীমা আছে"],
    eligibility: ["বাংলাদেশি নাগরিক", "ন্যূনতম বয়স ১৮ বছর"],
    provider: "বাংলাদেশ সরকার",
    category: "government",
  },
  {
    type: InvestmentType.DPS,
    name: "DPS",
    nameEn: "Deposit Pension Scheme",
    description: "ব্যাংক ডিপোজিট পেনশন স্কিম - নিয়মিত সঞ্চয়ের জন্য আদর্শ",
    expectedReturn: 7.2,
    minInvestment: 500,
    riskLevel: RiskLevel.Low,
    liquidityDays: 30,
    taxBenefit: false,
    features: ["মাসিক জমা", "পেনশন সুবিধা", "নমনীয় মেয়াদ"],
    pros: [
      "নিয়মিত সঞ্চয়ের অভ্যাস",
      "নিরাপদ বিনিয়োগ",
      "পেনশন পরিকল্পনা",
      "কম পরিমাণ থেকে শুরু",
    ],
    cons: [
      "মুদ্রাস্ফীতির তুলনায় কম রিটার্ন",
      "সময়ের আগে তোলায় জরিমানা",
      "ব্যাংক ঝুঁকি",
    ],
    eligibility: ["যেকোনো বয়স", "ব্যাংক অ্যাকাউন্ট প্রয়োজন"],
    provider: "বাণিজ্যিক ব্যাংক",
    category: "bank",
  },
  {
    type: InvestmentType.FixedDeposit,
    name: "ফিক্সড ডিপোজিট",
    nameEn: "Fixed Deposit",
    description: "ব্যাংক ফিক্সড ডিপোজিট - স্বল্পমেয়াদী নিরাপদ বিনিয়োগ",
    expectedReturn: 6.5,
    minInvestment: 1000,
    riskLevel: RiskLevel.Low,
    liquidityDays: 7,
    taxBenefit: false,
    features: ["নিশ্চিত রিটার্ন", "বিভিন্ন মেয়াদ", "সহজ প্রক্রিয়া"],
    pros: [
      "সম্পূর্ণ নিরাপদ",
      "নিশ্চিত রিটার্ন",
      "সহজ প্রক্রিয়া",
      "বিভিন্ন মেয়াদ",
    ],
    cons: ["কম রিটার্ন", "মুদ্রাস্ফীতির ঝুঁকি", "তরলতা সীমিত"],
    eligibility: ["ব্যাংক অ্যাকাউন্ট প্রয়োজন"],
    provider: "বাণিজ্যিক ব্যাংক",
    category: "bank",
  },
  {
    type: InvestmentType.MutualFund,
    name: "মিউচুয়াল ফান্ড",
    nameEn: "Mutual Fund",
    description: "পেশাদার ব্যবস্থাপনায় বিভিন্ন কোম্পানির শেয়ারে বিনিয়োগ",
    expectedReturn: 12.3,
    minInvestment: 5000,
    riskLevel: RiskLevel.Medium,
    liquidityDays: 3,
    taxBenefit: false,
    features: ["পেশাদার ব্যবস্থাপনা", "বৈচিত্র্যময় পোর্টফোলিও", "তরলতা"],
    pros: ["পেশাদার ব্যবস্থাপনা", "ঝুঁকি বিভাজন", "ভালো তরলতা", "স্বচ্ছতা"],
    cons: ["বাজার ঝুঁকি", "ব্যবস্থাপনা ফি", "রিটার্ন অনিশ্চিত"],
    eligibility: ["ন্যূনতম বয়স ১৮ বছর", "KYC সম্পন্ন"],
    provider: "অ্যাসেট ম্যানেজমেন্ট কোম্পানি",
    category: "mutual_fund",
  },
  {
    type: InvestmentType.Stock,
    name: "স্টক মার্কেট",
    nameEn: "Stock Market",
    description: "ঢাকা স্টক এক্সচেঞ্জে তালিকাভুক্ত কোম্পানির শেয়ার",
    expectedReturn: 15.8,
    minInvestment: 10000,
    riskLevel: RiskLevel.High,
    liquidityDays: 1,
    taxBenefit: false,
    features: ["উচ্চ রিটার্ন সম্ভাবনা", "তাৎক্ষণিক ট্রেডিং", "লভ্যাংশ আয়"],
    pros: [
      "উচ্চ রিটার্ন সম্ভাবনা",
      "তাৎক্ষণিক তরলতা",
      "লভ্যাংশ আয়",
      "মালিকানা অধিকার",
    ],
    cons: ["উচ্চ ঝুঁকি", "বাজার অস্থিরতা", "গবেষণা প্রয়োজন", "আবেগের প্রভাব"],
    eligibility: ["ন্যূনতম বয়স ১৮ বছর", "BO অ্যাকাউন্ট প্রয়োজন"],
    provider: "ঢাকা স্টক এক্সচেঞ্জ",
    category: "stock",
  },
  {
    type: InvestmentType.Bond,
    name: "সরকারি বন্ড",
    nameEn: "Government Bond",
    description: "সরকারি ট্রেজারি বন্ড ও বিল",
    expectedReturn: 7.8,
    minInvestment: 100000,
    riskLevel: RiskLevel.Low,
    liquidityDays: 30,
    taxBenefit: true,
    features: ["সরকারি গ্যারান্টি", "নিয়মিত সুদ", "দ্বিতীয়ক বাজার"],
    pros: [
      "সরকারি গ্যারান্টি",
      "নিয়মিত সুদ প্রদান",
      "দ্বিতীয়ক বাজারে বিক্রয়",
      "কর সুবিধা",
    ],
    cons: [
      "উচ্চ ন্যূনতম বিনিয়োগ",
      "সুদের হার পরিবর্তনের ঝুঁকি",
      "তরলতা সীমিত",
    ],
    eligibility: ["প্রাতিষ্ঠানিক বিনিয়োগকারী", "উচ্চ নেট ওর্থ ব্যক্তি"],
    provider: "বাংলাদেশ ব্যাংক",
    category: "government",
  },
];

export class InvestmentRecommendationService {
  /**
   * Generate personalized investment recommendations
   */
  static generateRecommendations(
    user: User,
    financialProfile: FinancialProfile,
    riskAssessment: RiskAssessment
  ): InvestmentRecommendation[] {
    const recommendations: InvestmentRecommendation[] = [];
    const availableAmount =
      financialProfile.monthlyIncome - financialProfile.monthlyExpenses;

    // Filter investments based on risk tolerance
    const suitableInvestments = this.filterByRiskTolerance(
      bangladeshInvestments,
      riskAssessment.tolerance
    );

    // Calculate allocation based on age and risk tolerance
    const allocation = this.calculateAssetAllocation(
      user.age,
      riskAssessment.tolerance
    );

    // Generate recommendations for each suitable investment
    suitableInvestments.forEach((investment) => {
      const suitabilityScore = this.calculateSuitabilityScore(
        investment,
        user,
        financialProfile,
        riskAssessment
      );

      if (suitabilityScore >= 60) {
        const recommendedAmount = this.calculateRecommendedAmount(
          investment,
          availableAmount,
          allocation
        );

        if (recommendedAmount >= investment.minInvestment) {
          recommendations.push({
            id: `rec_${investment.type}_${Date.now()}`,
            userId: user.id,
            investmentType: investment.type,
            name: investment.name,
            recommendedAmount,
            expectedReturn: investment.expectedReturn,
            riskLevel: investment.riskLevel,
            reasoning: this.generateReasoning(
              investment,
              user,
              suitabilityScore
            ),
            pros: investment.pros,
            cons: investment.cons,
            minimumAmount: investment.minInvestment,
            maximumAmount: investment.maxInvestment || 1000000,
            tenure: {
              minimum: 1,
              maximum: 10,
              unit: "years",
            },
            features: investment.features,
            suitabilityScore,
            createdAt: new Date(),
          });
        }
      }
    });

    // Sort by suitability score
    return recommendations.sort(
      (a, b) => b.suitabilityScore - a.suitabilityScore
    );
  }

  /**
   * Filter investments by risk tolerance
   */
  private static filterByRiskTolerance(
    investments: BangladeshInvestmentOption[],
    riskTolerance: RiskTolerance
  ): BangladeshInvestmentOption[] {
    switch (riskTolerance) {
      case RiskTolerance.Conservative:
        return investments.filter((inv) => inv.riskLevel === RiskLevel.Low);
      case RiskTolerance.Moderate:
        return investments.filter(
          (inv) =>
            inv.riskLevel === RiskLevel.Low ||
            inv.riskLevel === RiskLevel.Medium
        );
      case RiskTolerance.Aggressive:
        return investments; // All investments
      default:
        return investments.filter((inv) => inv.riskLevel === RiskLevel.Low);
    }
  }

  /**
   * Calculate asset allocation based on age and risk tolerance
   */
  private static calculateAssetAllocation(
    age: number,
    riskTolerance: RiskTolerance
  ): { [key: string]: number } {
    let stockAllocation = 100 - age; // Basic rule: 100 - age = stock %

    // Adjust based on risk tolerance
    switch (riskTolerance) {
      case RiskTolerance.Conservative:
        stockAllocation = Math.max(stockAllocation - 20, 10);
        break;
      case RiskTolerance.Aggressive:
        stockAllocation = Math.min(stockAllocation + 20, 80);
        break;
    }

    const bondAllocation = 100 - stockAllocation;

    return {
      stocks: stockAllocation,
      bonds: bondAllocation,
      government: Math.min(bondAllocation * 0.6, 40),
      bank: Math.min(bondAllocation * 0.4, 30),
    };
  }

  /**
   * Calculate suitability score for an investment
   */
  private static calculateSuitabilityScore(
    investment: BangladeshInvestmentOption,
    user: User,
    financialProfile: FinancialProfile,
    riskAssessment: RiskAssessment
  ): number {
    let score = 0;

    // Age factor (25 points)
    if (user.age < 30) {
      score +=
        investment.riskLevel === RiskLevel.High
          ? 25
          : investment.riskLevel === RiskLevel.Medium
          ? 20
          : 15;
    } else if (user.age < 50) {
      score +=
        investment.riskLevel === RiskLevel.Medium
          ? 25
          : investment.riskLevel === RiskLevel.Low
          ? 20
          : 15;
    } else {
      score +=
        investment.riskLevel === RiskLevel.Low
          ? 25
          : investment.riskLevel === RiskLevel.Medium
          ? 15
          : 10;
    }

    // Risk tolerance factor (25 points)
    if (riskAssessment.tolerance === RiskTolerance.Conservative) {
      score += investment.riskLevel === RiskLevel.Low ? 25 : 0;
    } else if (riskAssessment.tolerance === RiskTolerance.Moderate) {
      score +=
        investment.riskLevel === RiskLevel.Medium
          ? 25
          : investment.riskLevel === RiskLevel.Low
          ? 20
          : 10;
    } else {
      score +=
        investment.riskLevel === RiskLevel.High
          ? 25
          : investment.riskLevel === RiskLevel.Medium
          ? 20
          : 15;
    }

    // Income factor (20 points)
    const monthlyIncome = financialProfile.monthlyIncome;
    if (monthlyIncome >= 100000) {
      score += 20;
    } else if (monthlyIncome >= 50000) {
      score += 15;
    } else if (monthlyIncome >= 25000) {
      score += 10;
    } else {
      score += 5;
    }

    // Savings capacity factor (15 points)
    const savingsRate =
      (monthlyIncome - financialProfile.monthlyExpenses) / monthlyIncome;
    if (savingsRate >= 0.3) {
      score += 15;
    } else if (savingsRate >= 0.2) {
      score += 12;
    } else if (savingsRate >= 0.1) {
      score += 8;
    } else {
      score += 3;
    }

    // Dependents factor (10 points)
    if (financialProfile.dependents === 0) {
      score += 10;
    } else if (financialProfile.dependents <= 2) {
      score += 7;
    } else {
      score += 3;
    }

    // Emergency fund factor (5 points)
    const emergencyFundMonths =
      financialProfile.currentSavings / financialProfile.monthlyExpenses;
    if (emergencyFundMonths >= 6) {
      score += 5;
    } else if (emergencyFundMonths >= 3) {
      score += 3;
    } else {
      score += 1;
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate recommended investment amount
   */
  private static calculateRecommendedAmount(
    investment: BangladeshInvestmentOption,
    availableAmount: number,
    allocation: { [key: string]: number }
  ): number {
    let percentage = 0;

    switch (investment.category) {
      case "government":
        percentage = allocation.government || 20;
        break;
      case "bank":
        percentage = allocation.bank || 20;
        break;
      case "stock":
      case "mutual_fund":
        percentage = allocation.stocks || 30;
        break;
      default:
        percentage = 10;
    }

    const recommendedAmount = (availableAmount * percentage) / 100;

    // Ensure it meets minimum investment
    return Math.max(recommendedAmount, investment.minInvestment);
  }

  /**
   * Generate reasoning for recommendation
   */
  private static generateReasoning(
    investment: BangladeshInvestmentOption,
    user: User,
    suitabilityScore: number
  ): string {
    const ageGroup =
      user.age < 30 ? "তরুণ" : user.age < 50 ? "মধ্যবয়সী" : "প্রবীণ";

    let reasoning = `আপনার ${ageGroup} বয়স এবং আর্থিক প্রোফাইলের জন্য ${investment.name} একটি `;

    if (suitabilityScore >= 80) {
      reasoning += "অত্যন্ত উপযুক্ত বিনিয়োগ। ";
    } else if (suitabilityScore >= 70) {
      reasoning += "ভালো বিনিয়োগ বিকল্প। ";
    } else {
      reasoning += "মাঝারি উপযুক্ত বিনিয়োগ। ";
    }

    reasoning += `এই বিনিয়োগে ${investment.expectedReturn}% বার্ষিক রিটার্ন প্রত্যাশিত এবং `;
    reasoning += `ঝুঁকির মাত্রা ${
      investment.riskLevel === RiskLevel.Low
        ? "কম"
        : investment.riskLevel === RiskLevel.Medium
        ? "মাঝারি"
        : "উচ্চ"
    }।`;

    return reasoning;
  }

  /**
   * Calculate future value projection
   */
  static calculateProjection(
    amount: number,
    annualReturn: number,
    years: number,
    monthlyContribution: number = 0
  ): {
    futureValue: number;
    totalInvestment: number;
    totalReturn: number;
    yearlyBreakdown: Array<{
      year: number;
      investment: number;
      value: number;
      return: number;
    }>;
  } {
    let totalInvestment = amount;
    let currentValue = amount;
    const yearlyBreakdown = [];

    for (let year = 1; year <= years; year++) {
      // Add monthly contributions
      const yearlyContribution = monthlyContribution * 12;
      totalInvestment += yearlyContribution;

      // Calculate compound growth
      currentValue =
        (currentValue + yearlyContribution) * (1 + (annualReturn / 100));

      yearlyBreakdown.push({
        year,
        investment: totalInvestment,
        value: Math.round(currentValue),
        return: Math.round(currentValue - totalInvestment),
      });
    }

    return {
      futureValue: Math.round(currentValue),
      totalInvestment,
      totalReturn: Math.round(currentValue - totalInvestment),
      yearlyBreakdown,
    };
  }

  /**
   * Get investment details by type
   */
  static getInvestmentDetails(
    type: InvestmentType
  ): BangladeshInvestmentOption | null {
    return bangladeshInvestments.find((inv) => inv.type === type) || null;
  }

  /**
   * Get all available investments
   */
  static getAllInvestments(): BangladeshInvestmentOption[] {
    return bangladeshInvestments;
  }

  /**
   * Calculate optimal portfolio allocation
   */
  static calculateOptimalPortfolio(
    user: User,
    financialProfile: FinancialProfile,
    riskAssessment: RiskAssessment,
    targetAmount: number
  ): {
    allocation: { [key: string]: number };
    recommendations: InvestmentRecommendation[];
    projectedReturn: number;
  } {
    const recommendations = this.generateRecommendations(
      user,
      financialProfile,
      riskAssessment
    );
    const allocation = this.calculateAssetAllocation(
      user.age,
      riskAssessment.tolerance
    );

    // Calculate weighted average return
    let totalWeight = 0;
    let weightedReturn = 0;

    recommendations.forEach((rec) => {
      const weight = rec.recommendedAmount / targetAmount;
      totalWeight += weight;
      weightedReturn += rec.expectedReturn * weight;
    });

    const projectedReturn = totalWeight > 0 ? weightedReturn / totalWeight : 0;

    return {
      allocation,
      recommendations,
      projectedReturn,
    };
  }
}
