import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Chip, FAB, Surface, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// import { PortfolioChart } from '@/components/charts/PortfolioChart';
import { FinancialMetrics } from "@/components/dashboard/FinancialMetrics";
import { spacing, theme } from "@/constants/theme";
import { InvestmentRecommendationService } from "@/services/investmentRecommendation";
import { useUserStore } from "@/store/userStore";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { Investment } from "@/types";

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    user,
    financialProfile,
    riskAssessment,
    recommendations,
    isLoading,
    refreshUserData,
  } = useUserStore();

  const investments = useUserStore((state) => state.investments);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState<
    "pie" | "performance" | "growth"
  >("pie");

  useFocusEffect(
    React.useCallback(() => {
      refreshUserData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserData();
    } catch (error) {
      Alert.alert("রিফ্রেশ ব্যর্থ", "ডেটা আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "add_investment":
        navigation.navigate("Investment" as never);
        break;
      case "view_recommendations":
        navigation.navigate("Recommendations" as never);
        break;
      case "financial_profile":
        navigation.navigate("FinancialProfile" as never);
        break;
      case "risk_assessment":
        navigation.navigate("RiskAssessment" as never);
        break;
      default:
        break;
    }
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "সুপ্রভাত";
    if (hour < 17) return "শুভ দুপুর";
    if (hour < 21) return "শুভ সন্ধ্যা";
    return "শুভ রাত্রি";
  };

  const renderWelcomeCard = () => (
    <Card style={styles.welcomeCard}>
      <Card.Content>
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeText}>
            <Text variant="headlineSmall" style={styles.greeting}>
              {getGreeting()}, {user?.name || "ব্যবহারকারী"}!
            </Text>
            <Text variant="bodyMedium" style={styles.welcomeSubtext}>
              আপনার আর্থিক যাত্রায় স্বাগতম
            </Text>
          </View>
          <Icon name="hand-wave" size={40} color={theme.colors.primary} />
        </View>

        {(!financialProfile || !riskAssessment) && (
          <View style={styles.setupPrompt}>
            <Text variant="bodyMedium" style={styles.setupText}>
              সম্পূর্ণ অভিজ্ঞতার জন্য আপনার প্রোফাইল সম্পূর্ণ করুন
            </Text>
            <View style={styles.setupActions}>
              {!financialProfile && (
                <Button
                  mode="outlined"
                  onPress={() => handleQuickAction("financial_profile")}
                  style={styles.setupButton}
                >
                  আর্থিক প্রোফাইল
                </Button>
              )}
              {!riskAssessment && (
                <Button
                  mode="outlined"
                  onPress={() => handleQuickAction("risk_assessment")}
                  style={styles.setupButton}
                >
                  ঝুঁকি মূল্যায়ন
                </Button>
              )}
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.quickActionsCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          দ্রুত কার্যক্রম
        </Text>

        <View style={styles.quickActionsGrid}>
          <Surface
            style={styles.quickActionItem}
            onTouchEnd={() => handleQuickAction("add_investment")}
          >
            <Icon name="plus-circle" size={32} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={styles.quickActionText}>
              নতুন বিনিয়োগ
            </Text>
          </Surface>

          <Surface
            style={styles.quickActionItem}
            onTouchEnd={() => handleQuickAction("view_recommendations")}
          >
            <Icon name="lightbulb" size={32} color={theme.colors.secondary} />
            <Text variant="bodyMedium" style={styles.quickActionText}>
              সুপারিশ দেখুন
            </Text>
          </Surface>

          <Surface
            style={styles.quickActionItem}
            onTouchEnd={() => navigation.navigate("Chat" as never)}
          >
            <Icon name="robot" size={32} color={theme.colors.tertiary} />
            <Text variant="bodyMedium" style={styles.quickActionText}>
              AI সহায়তা
            </Text>
          </Surface>

          <Surface
            style={styles.quickActionItem}
            onTouchEnd={() => navigation.navigate("Profile" as never)}
          >
            <Icon name="account-cog" size={32} color={theme.colors.outline} />
            <Text variant="bodyMedium" style={styles.quickActionText}>
              সেটিংস
            </Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );

  const renderRecommendations = () => {
    if (!recommendations || recommendations.length === 0) {
      return null;
    }

    const topRecommendations = recommendations.slice(0, 3);

    return (
      <Card style={styles.recommendationsCard}>
        <Card.Content>
          <View style={styles.recommendationsHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              আপনার জন্য সুপারিশ
            </Text>
            <Button
              mode="text"
              onPress={() => handleQuickAction("view_recommendations")}
            >
              সব দেখুন
            </Button>
          </View>

          {topRecommendations.map((rec, index) => (
            <View key={rec.id} style={styles.recommendationItem}>
              <View style={styles.recommendationContent}>
                <Text variant="titleSmall" style={styles.recommendationTitle}>
                  {
                    InvestmentRecommendationService.getInvestmentDetails(
                      rec.investmentType
                    )?.name
                  }
                </Text>
                <Text variant="bodySmall" style={styles.recommendationAmount}>
                  সুপারিশকৃত: {formatCurrency(rec.recommendedAmount)}
                </Text>
                <Text variant="bodySmall" style={styles.recommendationReturn}>
                  প্রত্যাশিত রিটার্ন: {rec.expectedReturn}%
                </Text>
              </View>
              <Chip
                mode="outlined"
                style={styles.suitabilityChip}
                textStyle={{ fontSize: 10 }}
              >
                {rec.suitabilityScore}% উপযুক্ত
              </Chip>
            </View>
          ))}
        </Card.Content>
      </Card>
    );
  };

  const renderChartSelector = () => (
    <View style={styles.chartSelector}>
      <Chip
        selected={selectedChartType === "pie"}
        onPress={() => setSelectedChartType("pie")}
        style={styles.chartChip}
      >
        বিতরণ
      </Chip>
      <Chip
        selected={selectedChartType === "performance"}
        onPress={() => setSelectedChartType("performance")}
        style={styles.chartChip}
      >
        পারফরম্যান্স
      </Chip>
      <Chip
        selected={selectedChartType === "growth"}
        onPress={() => setSelectedChartType("growth")}
        style={styles.chartChip}
      >
        বৃদ্ধি
      </Chip>
    </View>
  );

  const getChartTitle = (): string => {
    switch (selectedChartType) {
      case "pie":
        return "পোর্টফোলিও বিতরণ";
      case "performance":
        return "বিনিয়োগ পারফরম্যান্স";
      case "growth":
        return "বৃদ্ধির প্রজেকশন";
      default:
        return "পোর্টফোলিও চার্ট";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Card */}
        {renderWelcomeCard()}

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Financial Metrics */}
        {financialProfile && (
          <FinancialMetrics
            investments={investments}
            financialProfile={financialProfile}
          />
        )}

        {/* Portfolio Chart */}
        {investments.length > 0 && (
          <>
            {renderChartSelector()}
            {/* <PortfolioChart
                            investments={investments}
                            type={selectedChartType}
                            title={getChartTitle()}
                        /> */}
          </>
        )}

        {/* Recommendations */}
        {renderRecommendations()}

        {/* Recent Investments */}
        {investments.length > 0 && (
          <Card style={styles.recentInvestmentsCard}>
            <Card.Content>
              <View style={styles.recentInvestmentsHeader}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  সাম্প্রতিক বিনিয়োগ
                </Text>
                <Button
                  mode="text"
                  onPress={() => navigation.navigate("Investment" as never)}
                >
                  সব দেখুন
                </Button>
              </View>

              {investments.slice(0, 3).map((investment: Investment) => (
                <View key={investment.id} style={styles.investmentItem}>
                  <View style={styles.investmentContent}>
                    <Text variant="titleSmall" style={styles.investmentName}>
                      {investment.name}
                    </Text>
                    <Text variant="bodySmall" style={styles.investmentAmount}>
                      {formatCurrency(investment.currentValue)}
                    </Text>
                  </View>
                  <View style={styles.investmentReturn}>
                    <Text
                      variant="bodySmall"
                      style={[
                        styles.returnText,
                        {
                          color:
                            investment.currentValue >= investment.amount
                              ? "#4CAF50"
                              : "#F44336",
                        },
                      ]}
                    >
                      {formatPercentage(
                        (investment.currentValue - investment.amount) /
                          investment.amount
                      )}
                    </Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Empty State */}
        {investments.length === 0 && financialProfile && (
          <Card style={styles.emptyStateCard}>
            <Card.Content style={styles.emptyStateContent}>
              <Icon name="chart-line" size={64} color={theme.colors.outline} />
              <Text variant="headlineSmall" style={styles.emptyStateTitle}>
                আপনার বিনিয়োগ যাত্রা শুরু করুন
              </Text>
              <Text variant="bodyMedium" style={styles.emptyStateText}>
                আমাদের AI-চালিত সুপারিশের সাহায্যে স্মার্ট বিনিয়োগ করুন
              </Text>
              <Button
                mode="contained"
                onPress={() => handleQuickAction("view_recommendations")}
                style={styles.emptyStateButton}
                icon="lightbulb"
              >
                সুপারিশ দেখুন
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => handleQuickAction("add_investment")}
        label="বিনিয়োগ"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  welcomeCard: {
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  welcomeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    flex: 1,
  },
  greeting: {
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  welcomeSubtext: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  setupPrompt: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.roundness,
  },
  setupText: {
    color: theme.colors.onPrimaryContainer,
    marginBottom: spacing.sm,
  },
  setupActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  setupButton: {
    flex: 1,
  },
  quickActionsCard: {
    margin: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontWeight: "bold",
    color: theme.colors.onSurface,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionItem: {
    width: "48%",
    padding: spacing.md,
    alignItems: "center",
    borderRadius: theme.roundness,
    marginBottom: spacing.sm,
    backgroundColor: theme.colors.surfaceVariant,
  },
  quickActionText: {
    marginTop: spacing.sm,
    textAlign: "center",
    color: theme.colors.onSurface,
  },
  chartSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  chartChip: {
    minWidth: 80,
  },
  recommendationsCard: {
    margin: spacing.md,
    marginTop: spacing.sm,
  },
  recommendationsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  recommendationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  recommendationAmount: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  recommendationReturn: {
    color: theme.colors.primary,
    marginTop: spacing.xs,
  },
  suitabilityChip: {
    marginLeft: spacing.sm,
  },
  recentInvestmentsCard: {
    margin: spacing.md,
    marginTop: spacing.sm,
  },
  recentInvestmentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  investmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  investmentContent: {
    flex: 1,
  },
  investmentName: {
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  investmentAmount: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  investmentReturn: {
    alignItems: "flex-end",
  },
  returnText: {
    fontWeight: "bold",
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
    backgroundColor: theme.colors.primary,
  },
});

export default DashboardScreen;
