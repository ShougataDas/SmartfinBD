import { type InvestmentOption, InvestmentType } from "@/types"
import { investmentOptions } from "@/data/investmentData"

export class InvestmentRecommendationService {
  static getInvestmentDetails(type: InvestmentType): InvestmentOption | null {
    return investmentOptions.find((option) => option.type === type) || null
  }

  static calculateProjection(initialAmount: number, expectedReturn: number, years: number, monthlyContribution = 0) {
    const monthlyRate = expectedReturn / 100 / 12
    const totalMonths = years * 12

    // Calculate future value of initial investment
    const futureValueInitial = initialAmount * Math.pow(1 + expectedReturn / 100, years)

    // Calculate future value of monthly contributions (annuity)
    let futureValueMonthly = 0
    if (monthlyContribution > 0) {
      futureValueMonthly = monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
    }

    const futureValue = futureValueInitial + futureValueMonthly
    const totalInvestment = initialAmount + monthlyContribution * totalMonths
    const totalReturn = futureValue - totalInvestment

    // Generate yearly breakdown
    const yearlyBreakdown = []
    for (let year = 1; year <= years; year++) {
      const yearlyInitial = initialAmount * Math.pow(1 + expectedReturn / 100, year)
      const monthsElapsed = year * 12
      let yearlyMonthly = 0

      if (monthlyContribution > 0) {
        yearlyMonthly = monthlyContribution * ((Math.pow(1 + monthlyRate, monthsElapsed) - 1) / monthlyRate)
      }

      yearlyBreakdown.push({
        year,
        investment: initialAmount + monthlyContribution * monthsElapsed,
        value: yearlyInitial + yearlyMonthly,
      })
    }

    return {
      futureValue: Math.round(futureValue),
      totalInvestment: Math.round(totalInvestment),
      totalReturn: Math.round(totalReturn),
      yearlyBreakdown,
    }
  }

  static getInvestmentById(id: string): InvestmentOption | null {
    return investmentOptions.find((option) => option.id === id) || null
  }

  static calculateTaxImplications(investment: InvestmentOption, amount: number) {
    const specificDetails: any = (investment as any).specificDetails

    // ensure expectedReturn is a number for arithmetic
    const expectedReturn = Number((investment as any).expectedReturn) || 0

    if (investment.type === InvestmentType.Sanchayapatra) {
      const sanchayapatraDetails = specificDetails as any
      const taxRate = amount <= 500000 ? 5 : 10
      return {
        taxRate,
        annualTax: (amount * expectedReturn / 100) * (Number(taxRate) / 100),
        description: `${amount <= 500000 ? "৫ লক্ষ টাকা পর্যন্ত ৫%" : "৫ লক্ষ টাকার বেশি ১০%"} কর কর্তন`,
      }
    }

    if (investment.type === InvestmentType.FixedDeposit) {
      const fdrDetails = specificDetails as any
      const rate = Number(fdrDetails.taxRate) || 0
      return {
        taxRate: rate,
        annualTax: (amount * expectedReturn / 100) * (rate / 100),
        description: "টিন থাকলে ১০%, না থাকলে ১৫% কর কর্তন",
      }
    }

    if (investment.type === InvestmentType.Stock) {
      return {
        taxRate: 0,
        annualTax: 0,
        description: "ব্যক্তিগত বিনিয়োগকারীদের জন্য ক্যাপিটাল গেইন কর মুক্ত",
      }
    }

    return {
      taxRate: 0,
      annualTax: 0,
      description: "কর তথ্য উপলব্ধ নেই",
    }
  }
}
