"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { View, ScrollView, StyleSheet, Alert } from "react-native"
import { Button, Text, Card, Surface, Chip, TextInput, Divider, List } from "react-native-paper"
import { useRoute, useNavigation, type RouteProp } from "@react-navigation/native"
import { CartesianChart, Line, Area, useChartPressState } from "victory-native"
import { useFont } from "@shopify/react-native-skia"

import { theme, spacing } from "@/constants/theme"
import { useUserStore } from "@/store/userStore"
import { InvestmentRecommendationService } from "@/services/investmentRecommendation"
import { formatCurrency } from "@/utils/formatters"
import { InvestmentType, RiskLevel, InvestmentStatus } from "@/types"

type RouteParams = {
  InvestmentDetails: {
    investmentId: string
    investmentType?: InvestmentType
  }
}

export const InvestmentDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, "InvestmentDetails">>()
  const navigation = useNavigation()
  const { user, financialProfile, riskAssessment, addInvestment } = useUserStore()

  const [investmentAmount, setInvestmentAmount] = useState("")
  const [investmentPeriod, setInvestmentPeriod] = useState("5")
  const [monthlyContribution, setMonthlyContribution] = useState("")
  const [projection, setProjection] = useState<any>(null)
  const [taxInfo, setTaxInfo] = useState<any>(null)

  const font = useFont(require("@/assets/fonts/SpaceMono-Regular.ttf"), 12)
  const { state: chartPressState } = useChartPressState<{ x: number; y: { y: number; y0: number } }>({
    x: 0,
    y: { y: 0, y0: 0 },
  })

  const investmentId = route.params?.investmentId
  const investmentDetails = investmentId
    ? InvestmentRecommendationService.getInvestmentById(investmentId)
    : InvestmentRecommendationService.getInvestmentDetails(route.params?.investmentType || InvestmentType.SANCHAYAPATRA_PORIBAR)

  const calculateProjection = useCallback(() => {
    if (!investmentDetails) return

    const amount = Number.parseFloat(investmentAmount) || 0
    const monthly = Number.parseFloat(monthlyContribution) || 0
    const years = Number.parseInt(investmentPeriod) || 5

    const isMonthlyInvestment = investmentDetails.specificDetails?.paymentStructure === "monthly"

    if (!isMonthlyInvestment && amount < investmentDetails.minInvestment) {
      Alert.alert("অপর্যাপ্ত পরিমাণ", `ন্যূনতম বিনিয়োগ ${formatCurrency(investmentDetails.minInvestment)} হতে হবে।`, [
        { text: "ঠিক আছে" },
      ])
      return
    }

    if (isMonthlyInvestment && monthly <= 0) {
      Alert.alert("মাসিক বিনিয়োগ প্রয়োজন", "DPS এর জন্য মাসিক বিনিয়োগের পরিমাণ নির্ধারণ করুন।", [{ text: "ঠিক আছে" }])
      return
    }

    const calculatedProjection = InvestmentRecommendationService.calculateProjection(
      isMonthlyInvestment ? 0 : amount,
      investmentDetails.expectedReturn.average,
      years,
      isMonthlyInvestment ? monthly : 0,
    )

    const taxImplications = InvestmentRecommendationService.calculateTaxImplications(investmentDetails, amount)

    setProjection(calculatedProjection)
    setTaxInfo(taxImplications)
  }, [investmentAmount, monthlyContribution, investmentPeriod, investmentDetails])

  const chartData = useMemo(() => {
    const data =
      projection?.yearlyBreakdown.map((item: any) => ({
        x: item.year,
        y: item.value,
        y0: item.investment,
      })) || []
    return data
  }, [projection])

  useEffect(() => {
    if (investmentDetails && user && financialProfile) {
      const availableAmount = financialProfile.monthlyIncome - financialProfile.monthlyExpenses
      const suggestedAmount = Math.max(Math.min(availableAmount * 0.2, 50000), investmentDetails.minInvestment)
      setInvestmentAmount(suggestedAmount.toString())
      setMonthlyContribution((availableAmount * 0.1).toString())
    }
  }, [investmentDetails, user, financialProfile])

  if (!investmentDetails) {
    return (
      <View style={styles.container}>
        <Text>বিনিয়োগের তথ্য পাওয়া যায়নি</Text>
      </View>
    )
  }

  const getRiskColor = (risk: RiskLevel): string => {
    switch (risk) {
      case RiskLevel.Low:
        return "#4CAF50"
      case RiskLevel.Medium:
        return "#FF9800"
      case RiskLevel.High:
        return "#F44336"
      default:
        return theme.colors.primary
    }
  }

  const getRiskLabel = (risk: RiskLevel): string => {
    switch (risk) {
      case RiskLevel.Low:
        return "কম ঝুঁকি"
      case RiskLevel.Medium:
        return "মাঝারি ঝুঁকি"
      case RiskLevel.High:
        return "উচ্চ ঝুঁকি"
      default:
        return "অজানা"
    }
  }

  const handleInvest = () => {
    const amount = Number.parseFloat(investmentAmount) || 0

    if (amount < investmentDetails.minInvestment) {
      Alert.alert("অপর্যাপ্ত পরিমাণ", `ন্যূনতম বিনিয়োগ ${formatCurrency(investmentDetails.minInvestment)} হতে হবে।`, [
        { text: "ঠিক আছে" },
      ])
      return
    }

    Alert.alert(
      "বিনিয়োগ নিশ্চিত করুন",
      `আপনি কি ${formatCurrency(amount)} টাকা ${investmentDetails.name} এ বিনিয়োগ করতে চান?`,
      [
        { text: "বাতিল", style: "cancel" },
        {
          text: "নিশ্চিত করুন",
          onPress: () => {
            const newInvestment = {
              id: Date.now().toString(),
              userId: user?.id || "",
              name: investmentDetails.name,
              type: investmentDetails.type,
              amount,
              currentValue: amount,
              expectedReturn: investmentDetails.expectedReturn.average,
              startDate: new Date(),
              riskLevel: investmentDetails.riskLevel,
              status: InvestmentStatus.Active,
              description: investmentDetails.description,
              features: investmentDetails.benefits || [],
              details: {
                institution: "সরকারি প্রতিষ্ঠান",
                interestRate: investmentDetails.expectedReturn.average,
              },
              performance: {
                monthlyReturns: [],
                lastUpdated: new Date(),
              },
              notifications: {
                maturityReminder: true,
                performanceAlerts: true,
                newsUpdates: false,
              },
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            }

            addInvestment(newInvestment)

            Alert.alert("বিনিয়োগ সফল", "আপনার বিনিয়োগ সফলভাবে সম্পন্ন হয়েছে।", [
              {
                text: "ঠিক আছে",
                onPress: () => navigation.goBack(),
              },
            ])
          },
        },
      ],
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <View style={styles.titleSection}>
              <Text variant="headlineMedium" style={styles.title}>
                {investmentDetails.name}
              </Text>
              <Text variant="bodyLarge" style={styles.description}>
                {investmentDetails.description}
              </Text>
            </View>

            <View style={styles.metricsSection}>
              <Surface style={styles.metricCard}>
                <Text variant="headlineSmall" style={styles.metricValue}>
                  {investmentDetails.expectedReturn.min === investmentDetails.expectedReturn.max
                    ? `${investmentDetails.expectedReturn.average}%`
                    : `${investmentDetails.expectedReturn.min}-${investmentDetails.expectedReturn.max}%`}
                </Text>
                <Text variant="bodySmall" style={styles.metricLabel}>
                  প্রত্যাশিত রিটার্ন
                </Text>
              </Surface>

              <Surface style={styles.metricCard}>
                <Chip
                  style={[styles.riskChip, { backgroundColor: getRiskColor(investmentDetails.riskLevel) }]}
                  textStyle={{ color: "white", fontSize: 12 }}
                >
                  {getRiskLabel(investmentDetails.riskLevel)}
                </Chip>
              </Surface>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.structureCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            বিনিয়োগ কাঠামো
          </Text>

          <List.Item
            title="বিনিয়োগের ধরন"
            description={
              investmentDetails.specificDetails?.paymentStructure === "monthly" ? "মাসিক বিনিয়োগ" : "একবারে বিনিয়োগ"
            }
            left={(props) => <List.Icon {...props} icon="cash-multiple" />}
          />

          <List.Item
            title="রিটার্নের ধরন"
            description={
              investmentDetails.specificDetails?.returnPattern === "monthly"
                ? "মাসিক রিটার্ন"
                : investmentDetails.specificDetails?.returnPattern === "quarterly"
                  ? "ত্রৈমাসিক রিটার্ন"
                  : "মেয়াদ শেষে রিটার্ন"
            }
            left={(props) => <List.Icon {...props} icon="calendar-check" />}
          />

          {investmentDetails.specificDetails?.paymentStructure === "monthly" && (
            <List.Item
              title="প্রাথমিক বিনিয়োগ"
              description="প্রয়োজন নেই"
              left={(props) => <List.Icon {...props} icon="check-circle" />}
            />
          )}
        </Card.Content>
      </Card>

      {/* Investment Calculator */}
      <Card style={styles.calculatorCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            বিনিয়োগ ক্যালকুলেটর
          </Text>

          {investmentDetails.specificDetails?.paymentStructure !== "monthly" && (
            <>
              <TextInput
                label="প্রাথমিক বিনিয়োগ (টাকা)"
                value={investmentAmount}
                onChangeText={setInvestmentAmount}
                keyboardType="numeric"
                left={<TextInput.Icon icon="currency-bdt" />}
                style={styles.input}
              />
              <Text variant="bodySmall" style={styles.helperText}>
                ন্যূনতম: {formatCurrency(investmentDetails.minInvestment)}
              </Text>
            </>
          )}

          {investmentDetails.specificDetails?.paymentStructure === "monthly" ? (
            <>
              <TextInput
                label="মাসিক বিনিয়োগ (টাকা)"
                value={monthlyContribution}
                onChangeText={setMonthlyContribution}
                keyboardType="numeric"
                left={<TextInput.Icon icon="calendar-month" />}
                style={styles.input}
              />
              <Text variant="bodySmall" style={styles.helperText}>
                DPS এর জন্য মাসিক বিনিয়োগের পরিমাণ নির্ধারণ করুন
              </Text>
            </>
          ) : (
            <>
              <TextInput
                label="মাসিক অতিরিক্ত বিনিয়োগ (টাকা)"
                value={monthlyContribution}
                onChangeText={setMonthlyContribution}
                keyboardType="numeric"
                left={<TextInput.Icon icon="calendar-month" />}
                style={styles.input}
              />
              <Text variant="bodySmall" style={styles.helperText}>
                ঐচ্ছিক - নিয়মিত মাসিক বিনিয়োগ
              </Text>
            </>
          )}

          <TextInput
            label="বিনিয়োগের মেয়াদ (বছর)"
            value={investmentPeriod}
            onChangeText={setInvestmentPeriod}
            keyboardType="numeric"
            left={<TextInput.Icon icon="calendar-clock" />}
            style={styles.input}
          />

          <Button mode="contained" onPress={calculateProjection} style={styles.calculateButton} icon="calculator">
            প্রজেকশন দেখুন
          </Button>
        </Card.Content>
      </Card>

      {/* Projection Results */}
      {projection && (
        <Card style={styles.projectionCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              বিনিয়োগ প্রজেকশন
            </Text>

            <View style={styles.projectionSummary}>
              <View style={styles.projectionItem}>
                <Text variant="headlineSmall" style={styles.projectionValue}>
                  {formatCurrency(projection.futureValue)}
                </Text>
                <Text variant="bodySmall" style={styles.projectionLabel}>
                  ভবিষ্যত মূল্য
                </Text>
              </View>

              <View style={styles.projectionItem}>
                <Text variant="headlineSmall" style={styles.projectionValue}>
                  {formatCurrency(projection.totalReturn)}
                </Text>
                <Text variant="bodySmall" style={styles.projectionLabel}>
                  মোট লাভ
                </Text>
              </View>

              <View style={styles.projectionItem}>
                <Text variant="headlineSmall" style={styles.projectionValue}>
                  {formatCurrency(projection.totalInvestment)}
                </Text>
                <Text variant="bodySmall" style={styles.projectionLabel}>
                  মোট বিনিয়োগ
                </Text>
              </View>
            </View>

            {taxInfo && (
              <View style={styles.taxInfoContainer}>
                <Text variant="titleMedium" style={styles.taxTitle}>
                  কর তথ্য
                </Text>
                <Text variant="bodyMedium" style={styles.taxDescription}>
                  {taxInfo.description}
                </Text>
                <Text variant="bodySmall" style={styles.taxAmount}>
                  বার্ষিক কর: {formatCurrency(taxInfo.annualTax)}
                </Text>
              </View>
            )}

            <View style={styles.chartContainer}>
              <Text variant="titleMedium" style={styles.chartTitle}>
                বৃদ্ধির চার্ট
              </Text>
              <CartesianChart
                data={chartData}
                xKey="x"
                yKeys={["y", "y0"]}
                axisOptions={{
                  font: font,
                  formatYLabel: (value: unknown) => `${(Number(value) / 1000).toFixed(0)}K`,
                  formatXLabel: (value: unknown) => `${value}Y`,
                }}
                chartPressState={chartPressState as any}
              >
                {({ points }: any) => (
                  <>
                    <Area points={points.y} y0={0} color={theme.colors.primaryContainer} opacity={0.6} />
                    <Line points={points.y0} color={theme.colors.primary} strokeWidth={2} />
                  </>
                )}
              </CartesianChart>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Required Documents */}
      <Card style={styles.documentsCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            প্রয়োজনীয় কাগজপত্র
          </Text>

          {investmentDetails.requiredDocuments.map((doc, index) => (
            <List.Item
              key={index}
              title={doc.name}
              description={doc.description}
              left={(props) => (
                <List.Icon {...props} icon={doc.mandatory ? "file-document" : "file-document-outline"} />
              )}
            />
          ))}
        </Card.Content>
      </Card>

      {/* Eligibility */}
      <Card style={styles.eligibilityCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            যোগ্যতার শর্ত
          </Text>

          {investmentDetails.eligibility.minAge && (
            <List.Item
              title={`ন্যূনতম বয়স: ${investmentDetails.eligibility.minAge} বছর`}
              left={(props) => <List.Icon {...props} icon="account-clock" />}
            />
          )}

          {investmentDetails.eligibility.maxAge && (
            <List.Item
              title={`সর্বোচ্চ বয়স: ${investmentDetails.eligibility.maxAge} বছর`}
              left={(props) => <List.Icon {...props} icon="account-clock-outline" />}
            />
          )}

          {investmentDetails.eligibility.citizenshipRequired && (
            <List.Item title="বাংলাদেশী নাগরিকত্ব প্রয়োজন" left={(props) => <List.Icon {...props} icon="flag" />} />
          )}

          {investmentDetails.eligibility.specialConditions?.map((condition, index) => (
            <List.Item key={index} title={condition} left={(props) => <List.Icon {...props} icon="check-circle" />} />
          ))}
        </Card.Content>
      </Card>

      {/* Features & Benefits */}
      <Card style={styles.featuresCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            বৈশিষ্ট্য ও সুবিধা
          </Text>

          <View style={styles.featuresGrid}>
            {investmentDetails.benefits?.map((benefit, index) => (
              <Chip key={index} mode="outlined" style={styles.featureChip}>
                {benefit}
              </Chip>
            ))}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.prosConsContainer}>
            <View style={styles.prosSection}>
              <Text variant="titleMedium" style={styles.prosTitle}>
                ✅ সুবিধাসমূহ
              </Text>
              {investmentDetails.benefits?.map((benefit, index) => (
                <Text key={index} variant="bodyMedium" style={styles.proItem}>
                  • {benefit}
                </Text>
              ))}
            </View>

            <View style={styles.consSection}>
              <Text variant="titleMedium" style={styles.consTitle}>
                ⚠️ ঝুঁকিসমূহ
              </Text>
              {investmentDetails.risks?.map((risk, index) => (
                <Text key={index} variant="bodyMedium" style={styles.conItem}>
                  • {risk}
                </Text>
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Investment Details */}
      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            বিস্তারিত তথ্য
          </Text>

          {investmentDetails.specificDetails?.paymentStructure !== "monthly" && (
            <List.Item
              title="ন্যূনতম বিনিয়োগ"
              description={formatCurrency(investmentDetails.minInvestment)}
              left={(props) => <List.Icon {...props} icon="currency-bdt" />}
            />
          )}

          {investmentDetails.specificDetails?.monthlyAmount && (
            <List.Item
              title="প্রস্তাবিত মাসিক বিনিয়োগ"
              description={formatCurrency(investmentDetails.specificDetails.monthlyAmount)}
              left={(props) => <List.Icon {...props} icon="calendar-month" />}
            />
          )}

          <List.Item
            title="তরলতা"
            description={investmentDetails.liquidity || "তথ্য নেই"}
            left={(props) => <List.Icon {...props} icon="clock-outline" />}
          />

          <List.Item
            title="কর সুবিধা"
            description={investmentDetails.taxImplications ? "হ্যাঁ" : "না"}
            left={(props) => <List.Icon {...props} icon="receipt" />}
          />

          <List.Item
            title="প্রদানকারী"
            description="সরকারি প্রতিষ্ঠান"
            left={(props) => <List.Icon {...props} icon="bank" />}
          />

          <List.Item
            title="মেয়াদ"
            description={`${investmentDetails.tenure.min} ${investmentDetails.tenure.unit === "years" ? "বছর" : "মাস"}`}
            left={(props) => <List.Icon {...props} icon="calendar-range" />}
          />
        </Card.Content>
      </Card>

      {/* Investment Button */}
      <Card style={[styles.actionCard, styles.lastCard]}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleInvest}
            style={styles.investButton}
            icon="plus-circle"
            contentStyle={styles.investButtonContent}
          >
            এখনই বিনিয়োগ করুন
          </Button>

          <Text variant="bodySmall" style={styles.disclaimer}>
            * এটি একটি ডেমো অ্যাপ। প্রকৃত বিনিয়োগের জন্য সংশ্লিষ্ট প্রতিষ্ঠানের সাথে যোগাযোগ করুন। বিনিয়োগের আগে সকল নিয়ম-কানুন ও ঝুঁকি
            সম্পর্কে জেনে নিন।
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerCard: {
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  headerContent: {
    gap: spacing.md,
  },
  titleSection: {
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    color: theme.colors.onSurface,
    textAlign: "center",
  },
  subtitle: {
    color: theme.colors.onSurfaceVariant,
    fontStyle: "italic",
    marginTop: spacing.xs,
  },
  description: {
    color: theme.colors.onSurfaceVariant,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  metricsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  metricCard: {
    padding: spacing.md,
    borderRadius: theme.roundness,
    alignItems: "center",
    backgroundColor: theme.colors.surfaceVariant,
  },
  metricValue: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  metricLabel: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  riskChip: {
    minWidth: 80,
  },
  calculatorCard: {
    margin: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontWeight: "bold",
    color: theme.colors.onSurface,
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  calculateButton: {
    marginTop: spacing.sm,
  },
  projectionCard: {
    margin: spacing.md,
    marginTop: spacing.sm,
  },
  projectionSummary: {
    flexDirection: "column",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  projectionItem: {
    alignItems: "center",
  },
  projectionValue: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  projectionLabel: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  chartContainer: {
    alignItems: "center",
    height: 300,
  },
  chartTitle: {
    fontWeight: "bold",
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
  },
  featuresCard: {
    margin: spacing.md,
    marginTop: spacing.sm,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  featureChip: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  divider: {
    marginVertical: spacing.md,
  },
  prosConsContainer: {
    gap: spacing.md,
  },
  prosSection: {},
  prosTitle: {
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: spacing.sm,
  },
  proItem: {
    color: theme.colors.onSurface,
    marginBottom: spacing.xs,
  },
  consSection: {},
  consTitle: {
    fontWeight: "bold",
    color: "#FF9800",
    marginBottom: spacing.sm,
  },
  conItem: {
    color: theme.colors.onSurface,
    marginBottom: spacing.xs,
  },
  detailsCard: {
    margin: spacing.md,
    marginTop: spacing.sm,
  },
  actionCard: {
    margin: spacing.md,
    marginTop: spacing.sm,
  },
  lastCard: {
    marginBottom: spacing.xl,
  },
  investButton: {
    paddingVertical: spacing.sm,
  },
  investButtonContent: {
    paddingVertical: spacing.xs,
  },
  disclaimer: {
    textAlign: "center",
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.md,
    fontStyle: "italic",
  },
  helperText: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  taxInfoContainer: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: theme.roundness,
    marginTop: spacing.md,
  },
  taxTitle: {
    fontWeight: "bold",
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
  },
  taxDescription: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  taxAmount: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  documentsCard: {
    margin: spacing.md,
    marginTop: spacing.sm,
  },
  eligibilityCard: {
    margin: spacing.md,
    marginTop: spacing.sm,
  },
  structureCard: {
    margin: spacing.md,
    marginTop: spacing.sm,
  },
})
