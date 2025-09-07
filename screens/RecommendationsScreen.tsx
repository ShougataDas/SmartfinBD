"use client";

import type React from "react";
import { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import {
  Card,
  Text,
  Button,
  Chip,
  ActivityIndicator,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import MarkdownDisplay from "react-native-markdown-display";

import { spacing, theme } from "@/constants/theme";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/utils/formatters";
import { API_CONFIG, getApiUrl } from "@/constants/config";

const RecommendationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    recommendations,
    refreshUserData,
    setRecommendations,
    financialProfile,
    riskAssessment,
  } = useUserStore();
  const { token } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserData();
    } catch {
      Alert.alert("রিফ্রেশ ব্যর্থ", "ডেটা আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoadingRecommendations(true);
    setAiThinking(true);

    try {
      // Add a small delay to show the AI thinking animation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.FINANCIAL_PROFILE.PREDICT),
        {
          method: "GET",
          headers: {
            Authorization: token || "",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { data } = await response.json();
      if (data) {
        // Convert single recommendation to array format for consistency
        const recommendation = {
          id: `rec_${Date.now()}`,
          userId: "current_user",
          investmentType: data.recommendInvestmentType,
          name: "AI সুপারিশকৃত বিনিয়োগ",
          recommendedAmount: data.recommendInvestmentAmount,
          expectedReturn: 12, // Default value, could be enhanced
          suitabilityScore: data.suitabilityScore,
          riskLevel: data.riskLevel,
          reason: data.reason,
          reasoning: data.reason, // For compatibility with InvestmentRecommendation interface
          pros: [
            "পেশাদার ব্যবস্থাপনা",
            "বৈচিত্র্যকরণ",
            "আপনার লক্ষ্যের সাথে সামঞ্জস্যপূর্ণ",
          ],
          cons: ["বাজারের ঝুঁকি", "ব্যবস্থাপনা ফি"],
          minimumAmount: 10000,
          maximumAmount: 1000000,
          tenure: {
            minimum: 12,
            maximum: 60,
            unit: "months" as const,
          },
          features: [
            "এককালীন বিনিয়োগ",
            "ইক্যুইটি ফোকাস",
            "আক্রমণাত্মক বৃদ্ধি",
          ],
          createdAt: new Date(),
        };
        setRecommendations([recommendation]);
        Alert.alert("সফল", "নতুন সুপারিশ পাওয়া গেছে!");
      } else {
        Alert.alert("সতর্কতা", "কোনো সুপারিশ পাওয়া যায়নি।");
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      Alert.alert("ত্রুটি", "সুপারিশ লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoadingRecommendations(false);
      setAiThinking(false);
    }
  };

  const handleInvestmentAction = (recommendationId: string) => {
    // Navigate to investment form or details
    Alert.alert("বিনিয়োগ", "এই বিনিয়োগে আগ্রহী?");
  };

  const AIThinkingLoader = () => (
    <Card style={styles.aiThinkingCard}>
      <Card.Content style={styles.aiThinkingContent}>
        <View style={styles.aiAvatar}>
          <Icon name="robot" size={40} color={theme.colors.primary} />
        </View>
        <View style={styles.aiThinkingText}>
          <Text variant="titleMedium" style={styles.aiThinkingTitle}>
            AI বিশ্লেষণ করছে...
          </Text>
          <Text variant="bodySmall" style={styles.aiThinkingSubtitle}>
            আপনার আর্থিক তথ্য বিশ্লেষণ করে সেরা সুপারিশ তৈরি করছি
          </Text>
          <View style={styles.dotsContainer}>
            <View style={styles.typingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        </View>
        <ActivityIndicator
          animating={true}
          size="small"
          color={theme.colors.primary}
          style={styles.aiLoader}
        />
      </Card.Content>
    </Card>
  );

  const renderRecommendationCard = (recommendation: any) => (
    <Card key={recommendation.id} style={styles.recommendationCard}>
      <Card.Content>
        <View style={styles.recommendationHeader}>
          <View style={styles.recommendationInfo}>
            <View style={styles.aiTag}>
              <Icon name="robot" size={16} color={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.aiTagText}>
                AI সুপারিশ
              </Text>
            </View>
            <Text variant="titleMedium" style={styles.recommendationTitle}>
              {recommendation.name}
            </Text>
            <Chip
              mode="outlined"
              style={styles.suitabilityChip}
              textStyle={styles.chipText}
            >
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
            <Chip
              mode="flat"
              style={[
                styles.riskLevelChip,
                {
                  backgroundColor:
                    recommendation.riskLevel === "conservative"
                      ? "#E8F5E8"
                      : recommendation.riskLevel === "moderate"
                      ? "#FFF3E0"
                      : "#FFEBEE",
                },
              ]}
              textStyle={[
                styles.riskLevelText,
                {
                  color:
                    recommendation.riskLevel === "conservative"
                      ? "#2E7D32"
                      : recommendation.riskLevel === "moderate"
                      ? "#F57C00"
                      : "#C62828",
                },
              ]}
            >
              {recommendation.riskLevel === "conservative"
                ? "রক্ষণশীল"
                : recommendation.riskLevel === "moderate"
                ? "মধ্যম"
                : "আক্রমণাত্মক"}
            </Chip>
          </View>
        </View>

        {recommendation.reason && (
          <View style={styles.reasoningSection}>
            <MarkdownDisplay
              style={{
                body: {
                  fontSize: 14,
                  color: theme.colors.onSurfaceVariant,
                  lineHeight: 20,
                },
                heading1: {
                  fontSize: 16,
                  fontWeight: "bold",
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 6,
                },
                heading2: {
                  fontSize: 15,
                  fontWeight: "bold",
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 4,
                },
                heading3: {
                  fontSize: 14,
                  fontWeight: "bold",
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 3,
                },
                strong: {
                  fontWeight: "bold",
                  color: theme.colors.onSurfaceVariant,
                },
                em: {
                  fontStyle: "italic",
                  color: theme.colors.onSurfaceVariant,
                },
                bullet_list: {
                  marginBottom: 6,
                },
                ordered_list: {
                  marginBottom: 6,
                },
                list_item: {
                  marginBottom: 3,
                },
                paragraph: {
                  marginBottom: 6,
                },
                code_inline: {
                  backgroundColor: theme.colors.surfaceVariant,
                  paddingHorizontal: 3,
                  paddingVertical: 1,
                  borderRadius: 3,
                  fontFamily: "monospace",
                  fontSize: 12,
                },
                code_block: {
                  backgroundColor: theme.colors.surfaceVariant,
                  padding: 8,
                  borderRadius: 6,
                  marginBottom: 6,
                  fontFamily: "monospace",
                  fontSize: 12,
                },
              }}
            >
              {recommendation.reason}
            </MarkdownDisplay>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text variant="headlineSmall" style={styles.headerTitle}>
                আপনার জন্য সুপারিশ
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtitle}>
                AI-চালিত ব্যক্তিগতকৃত বিনিয়োগ পরামর্শ
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={fetchRecommendations}
              loading={loadingRecommendations}
              disabled={loadingRecommendations || recommendations.length > 0}
              style={styles.getRecommendationsButton}
              icon="robot"
            >
              AI সুপারিশ পান
            </Button>
          </View>
        </View>

        {aiThinking && <AIThinkingLoader />}

        {recommendations && recommendations.length > 0
          ? recommendations.map(renderRecommendationCard)
          : !financialProfile &&
            !riskAssessment &&
            !aiThinking && (
              <Card style={styles.emptyStateCard}>
                <Card.Content style={styles.emptyStateContent}>
                  <Icon
                    name="robot-outline"
                    size={64}
                    color={theme.colors.outline}
                  />
                  <Text variant="headlineSmall" style={styles.emptyStateTitle}>
                    AI সুপারিশের জন্য প্রস্তুত
                  </Text>
                  <Text variant="bodyMedium" style={styles.emptyStateText}>
                    আপনার আর্থিক প্রোফাইল এবং ঝুঁকি মূল্যায়ন সম্পূর্ণ করুন
                    ব্যক্তিগত AI সুপারিশ পেতে
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() =>
                      navigation.navigate("FinancialProfile" as never)
                    }
                    style={styles.emptyStateButton}
                  >
                    প্রোফাইল সম্পূর্ণ করুন
                  </Button>
                </Card.Content>
              </Card>
            )}
      </ScrollView>
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
  header: {
    padding: spacing.lg,
    backgroundColor: theme.colors.primaryContainer,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
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
  getRecommendationsButton: {
    marginLeft: spacing.md,
  },
  aiThinkingCard: {
    margin: spacing.md,
    backgroundColor: theme.colors.primaryContainer,
    elevation: 2,
  },
  aiThinkingContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  aiAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  aiThinkingText: {
    flex: 1,
  },
  aiThinkingTitle: {
    fontWeight: "600",
    color: theme.colors.onPrimaryContainer,
    marginBottom: spacing.xs,
  },
  aiThinkingSubtitle: {
    color: theme.colors.onPrimaryContainer,
    opacity: 0.8,
    marginBottom: spacing.sm,
  },
  dotsContainer: {
    alignItems: "flex-start",
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginRight: 4,
  },
  dot1: {
    animationDelay: "0s",
  },
  dot2: {
    animationDelay: "0.2s",
  },
  dot3: {
    animationDelay: "0.4s",
  },
  aiLoader: {
    marginLeft: spacing.sm,
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
  aiTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: theme.roundness,
    alignSelf: "flex-start",
    marginBottom: spacing.sm,
  },
  aiTagText: {
    color: theme.colors.primary,
    marginLeft: spacing.xs,
    fontWeight: "600",
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
  riskLevelChip: {
    alignSelf: "flex-start",
  },
  riskLevelText: {
    fontSize: 12,
    fontWeight: "600",
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
});

export default RecommendationsScreen;
