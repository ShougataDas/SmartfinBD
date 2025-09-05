"use client"

import type React from "react"
import { useState } from "react"
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from "react-native"
import { Card, Text, Button, Chip, FAB } from "react-native-paper"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { useNavigation } from "@react-navigation/native"

import { spacing, theme } from "@/constants/theme"
import { useUserStore } from "@/store/userStore"
import { InvestmentRecommendationService } from "@/services/investmentRecommendation"
import { formatCurrency } from "@/utils/formatters"

const RecommendationsScreen: React.FC = () => {
  const navigation = useNavigation()
  const { recommendations, refreshUserData } = useUserStore()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshUserData()
    } catch (error) {
      Alert.alert("রিফ্রেশ ব্যর্থ", "ডেটা আপডেট করতে সমস্যা হয়েছে।")
    } finally {
      setRefreshing(false)
    }
  }

  const handleInvestmentAction = (recommendationId: string) => {
    // Navigate to investment form or details
    Alert.alert("বিনিয়োগ", "এই বিনিয়োগে আগ্রহী?")
  }

  const renderRecommendationCard = (recommendation: any) => (
    <Card key={recommendation.id} style={styles.recommendationCard}>
      <Card.Content>
        <View style={styles.recommendationHeader}>
          <View style={styles.recommendationInfo}>
            <Text variant="titleMedium" style={styles.recommendationTitle}>
              {InvestmentRecommendationService.getInvestmentDetails(recommendation.investmentType)?.name}
            </Text>
            <Chip mode="outlined" style={styles.suitabilityChip} textStyle={styles.chipText}>
              {recommendation.suitabilityScore}% উপযুক্ত
            </Chip>
          </View>
          <Icon name="lightbulb" size={24} color={theme.colors.secondary} />
        </View>

        <View style={styles.recommendationDetails}>
          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={styles.detailLabel}>
              সুপারিশকৃত পরিমাণ:
            </Text>
            <Text variant="bodyMedium" style={styles.detailValue}>
              {formatCurrency(recommendation.recommendedAmount)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={styles.detailLabel}>
              প্রত্যাশিত রিটার্ন:
            </Text>
            <Text variant="bodyMedium" style={styles.detailValue}>
              {recommendation.expectedReturn}%
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={styles.detailLabel}>
              ঝুঁকির মাত্রা:
            </Text>
            <Text variant="bodyMedium" style={styles.detailValue}>
              {recommendation.riskLevel}
            </Text>
          </View>
        </View>

        {recommendation.reasoning && (
          <View style={styles.reasoningSection}>
            <Text variant="bodySmall" style={styles.reasoningText}>
              {recommendation.reasoning}
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <Button mode="outlined" onPress={() => handleInvestmentAction(recommendation.id)} style={styles.actionButton}>
            বিস্তারিত দেখুন
          </Button>
          <Button
            mode="contained"
            onPress={() => handleInvestmentAction(recommendation.id)}
            style={styles.actionButton}
          >
            বিনিয়োগ করুন
          </Button>
        </View>
      </Card.Content>
    </Card>
  )

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            আপনার জন্য সুপারিশ
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            AI-চালিত ব্যক্তিগতকৃত বিনিয়োগ পরামর্শ
          </Text>
        </View>

        {recommendations && recommendations.length > 0 ? (
          recommendations.map(renderRecommendationCard)
        ) : (
          <Card style={styles.emptyStateCard}>
            <Card.Content style={styles.emptyStateContent}>
              <Icon name="lightbulb-outline" size={64} color={theme.colors.outline} />
              <Text variant="headlineSmall" style={styles.emptyStateTitle}>
                কোনো সুপারিশ নেই
              </Text>
              <Text variant="bodyMedium" style={styles.emptyStateText}>
                আপনার আর্থিক প্রোফাইল এবং ঝুঁকি মূল্যায়ন সম্পূর্ণ করুন সুপারিশ পেতে
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate("FinancialProfile" as never)}
                style={styles.emptyStateButton}
              >
                প্রোফাইল সম্পূর্ণ করুন
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB icon="refresh" style={styles.fab} onPress={onRefresh} label="রিফ্রেশ" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: theme.colors.primaryContainer,
  },
  headerTitle: {
    fontWeight: "bold",
    color: theme.colors.onPrimaryContainer,
  },
  headerSubtitle: {
    color: theme.colors.onPrimaryContainer,
    marginTop: spacing.xs,
    opacity: 0.8,
  },
  recommendationCard: {
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationTitle: {
    fontWeight: "bold",
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
  },
  suitabilityChip: {
    alignSelf: "flex-start",
  },
  chipText: {
    fontSize: 12,
  },
  recommendationDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  detailLabel: {
    color: theme.colors.onSurfaceVariant,
  },
  detailValue: {
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  reasoningSection: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: theme.roundness,
    marginBottom: spacing.md,
  },
  reasoningText: {
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyStateCard: {
    margin: spacing.md,
    marginTop: spacing.xl,
  },
  emptyStateContent: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyStateTitle: {
    fontWeight: "bold",
    color: theme.colors.onSurface,
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    color: theme.colors.onSurfaceVariant,
    textAlign: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  emptyStateButton: {
    paddingHorizontal: spacing.lg,
  },
  fab: {
    position: "absolute",
    margin: spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.secondary,
  },
})

export default RecommendationsScreen
