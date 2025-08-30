"use client"

import type React from "react"
import { useState } from "react"
import { ScrollView, View, StyleSheet } from "react-native"
import { Card, Title, Paragraph, Button, Chip, Text, Searchbar, FAB } from "react-native-paper"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { useNavigation } from "@react-navigation/native"

import { theme, spacing } from "@/constants/theme"
import { formatCurrency } from "@/utils/formatters"
import { investmentOptions } from "@/data/investmentData"
import { InvestmentType as InvestmentTypeEnum } from "@/types"

const InvestmentScreen: React.FC = () => {
  const navigation = useNavigation()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = [
    { key: "all", label: "সব", icon: "view-grid" },
    { key: "government", label: "সরকারি", icon: "bank" },
    { key: "bank", label: "ব্যাংক", icon: "office-building" },
    { key: "mutual_fund", label: "মিউচুয়াল ফান্ড", icon: "chart-line" },
    { key: "stock", label: "শেয়ার", icon: "trending-up" },
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "#4CAF50"
      case "medium":
        return "#FF9800"
      case "high":
        return "#F44336"
      default:
        return theme.colors.primary
    }
  }

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "low":
        return "কম ঝুঁকি"
      case "medium":
        return "মাঝারি ঝুঁকি"
      case "high":
        return "উচ্চ ঝুঁকি"
      default:
        return "অজানা"
    }
  }

  const getLiquidityLabel = (liquidity: any) => {
    if (typeof liquidity === "string") {
      switch (liquidity) {
        case "low":
          return "কম তরলতা"
        case "medium":
          return "মাঝারি তরলতা"
        case "high":
          return "উচ্চ তরলতা"
        default:
          return liquidity
      }
    }
    return liquidity?.description ?? "অজানা"
  }

  const getCategoryFromType = (type: InvestmentTypeEnum): string => {
    const EnumAny = InvestmentTypeEnum as any
    switch (type) {
      case EnumAny.SANCHAYAPATRA_PORIBAR:
      case EnumAny.SANCHAYAPATRA_PENSIONER:
        return "government"
      case EnumAny.FixedDeposit:
      case EnumAny.DPS:
        return "bank"
      case EnumAny.Stock:
      case EnumAny.MutualFund:
        return "mutual_fund"
      default:
        return "government"
    }
  }

  const navigateToInvestmentScreen = (investmentType: InvestmentTypeEnum, investmentId: string) => {
    const EnumAny = InvestmentTypeEnum as any
    switch (investmentType) {
      case EnumAny.SANCHAYAPATRA_PORIBAR:
      case EnumAny.SANCHAYAPATRA_PENSIONER:
        ; (navigation.navigate as any)("SanchayapatraScreen", { investmentId })
        break
      case EnumAny.DPS:
        ; (navigation.navigate as any)("DPSScreen", { investmentId })
        break
      case EnumAny.FixedDeposit:
        ; (navigation.navigate as any)("FixedDepositScreen", { investmentId })
        break
      case EnumAny.Stock:
        ; (navigation.navigate as any)("StockMarketScreen", { investmentId })
        break
      case EnumAny.MutualFund:
        ; (navigation.navigate as any)("MutualFundScreen", { investmentId })
        break
      default:
        ; (navigation.navigate as any)("InvestmentDetails", {
          investmentId,
          investmentType,
        })
    }
  }

  const filteredInvestments = investmentOptions.filter((investment) => {
    const matchesSearch = investment.name.toLowerCase().includes(searchQuery.toLowerCase())
    const investmentCategory = getCategoryFromType(investment.type)
    const matchesCategory = selectedCategory === "all" || investmentCategory === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="বিনিয়োগ অপশন খুঁজুন..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {categories.map((category) => (
            <Chip
              key={category.key}
              selected={selectedCategory === category.key}
              onPress={() => setSelectedCategory(category.key)}
              style={styles.categoryChip}
              icon={category.icon}
            >
              {category.label}
            </Chip>
          ))}
        </ScrollView>

        {/* Investment Options */}
        <View style={styles.investmentList}>
          {filteredInvestments.map((investment) => (
            <Card key={investment.id} style={styles.investmentCard}>
              <Card.Content>
                <View style={styles.investmentHeader}>
                  <View style={styles.investmentTitle}>
                    <Title style={styles.investmentName}>{investment.name}</Title>
                  </View>
                  <Chip
                    style={[styles.riskChip, { backgroundColor: getRiskColor(investment.riskLevel) }]}
                    textStyle={{ color: "white", fontSize: 10 }}
                  >
                    {getRiskLabel(investment.riskLevel)}
                  </Chip>
                </View>

                <Paragraph style={styles.description}>{investment.description}</Paragraph>

                <View style={styles.investmentStats}>
                  <View style={styles.statItem}>
                    <Icon name="trending-up" size={16} color={theme.colors.primary} />
                    <Text variant="bodySmall" style={styles.statText}>
                      প্রত্যাশিত রিটার্ন: {investment.expectedReturn.average}%
                    </Text>
                  </View>

                  {investment.specificDetails?.paymentStructure === "monthly" ? (
                    <View style={styles.statItem}>
                      <Icon name="calendar-month" size={16} color={theme.colors.primary} />
                      <Text variant="bodySmall" style={styles.statText}>
                        মাসিক বিনিয়োগ: {formatCurrency(investment.specificDetails.monthlyAmount || 0)}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.statItem}>
                      <Icon name="currency-bdt" size={16} color={theme.colors.primary} />
                      <Text variant="bodySmall" style={styles.statText}>
                        ন্যূনতম: {formatCurrency(investment.minInvestment)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.statItem}>
                    <Icon name="cash-multiple" size={16} color={theme.colors.primary} />
                    <Text variant="bodySmall" style={styles.statText}>
                      রিটার্ন:{" "}
                      {investment.specificDetails?.returnPattern === "monthly"
                        ? "মাসিক"
                        : investment.specificDetails?.returnPattern === "quarterly"
                          ? "ত্রৈমাসিক"
                          : "মেয়াদ শেষে"}
                    </Text>
                  </View>

                  <View style={styles.statItem}>
                    <Icon name="clock-outline" size={16} color={theme.colors.primary} />
                    <Text variant="bodySmall" style={styles.statText}>
                      তরলতা:{" "}
                      {getLiquidityLabel(investment.liquidity)}
                    </Text>
                  </View>
                </View>

                <View style={styles.features}>
                  {investment.benefits.map((benefit, index) => (
                    <Chip key={index} mode="outlined" style={styles.featureChip} textStyle={styles.featureText}>
                      {benefit}
                    </Chip>
                  ))}
                </View>

                <View style={styles.cardActions}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      navigateToInvestmentScreen(investment.type, investment.id)
                    }}
                    style={styles.detailsButton}
                  >
                    বিস্তারিত
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      navigateToInvestmentScreen(investment.type, investment.id)
                    }}
                    style={styles.investButton}
                  >
                    বিনিয়োগ করুন
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={() => { }} label="কাস্টম প্ল্যান" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    padding: spacing.md,
  },
  searchBar: {
    backgroundColor: theme.colors.surface,
  },
  categoryContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  categoryChip: {
    marginRight: spacing.sm,
  },
  investmentList: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  investmentCard: {
    marginBottom: spacing.md,
  },
  investmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  investmentTitle: {
    flex: 1,
  },
  investmentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  riskChip: {
    marginLeft: spacing.sm,
  },
  description: {
    marginBottom: spacing.md,
    color: theme.colors.onSurfaceVariant,
  },
  investmentStats: {
    marginBottom: spacing.md,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  statText: {
    marginLeft: spacing.xs,
    color: theme.colors.onSurfaceVariant,
  },
  features: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.md,
  },
  featureChip: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  featureText: {
    fontSize: 10,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailsButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  investButton: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    margin: spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
})

export default InvestmentScreen
