import React, { useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Text,
  Searchbar,
  FAB,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

import { theme, spacing } from "@/constants/theme";
import { formatCurrency } from "@/utils/formatters";
import { InvestmentType } from "@/types";

interface InvestmentOption {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  expectedReturn: number;
  minInvestment: number;
  riskLevel: "low" | "medium" | "high";
  category: "government" | "bank" | "stock" | "mutual_fund";
  features: string[];
}

const InvestmentScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const investmentOptions: InvestmentOption[] = [
    {
      id: "1",
      name: "সঞ্চয়পত্র",
      nameEn: "Sanchayapatra",
      description: "সরকারি সঞ্চয়পত্র - নিরাপদ ও নিশ্চিত আয়",
      expectedReturn: 8.5,
      minInvestment: 1000,
      riskLevel: "low",
      category: "government",
      features: ["সরকারি গ্যারান্টি", "নিয়মিত সুদ", "কর সুবিধা"],
    },
    {
      id: "2",
      name: "DPS",
      nameEn: "Deposit Pension Scheme",
      description: "ব্যাংক ডিপোজিট পেনশন স্কিম",
      expectedReturn: 7.2,
      minInvestment: 500,
      riskLevel: "low",
      category: "bank",
      features: ["মাসিক জমা", "পেনশন সুবিধা", "নমনীয় মেয়াদ"],
    },
    {
      id: "3",
      name: "মিউচুয়াল ফান্ড",
      nameEn: "Mutual Fund",
      description: "বিভিন্ন কোম্পানির শেয়ারে বিনিয়োগ",
      expectedReturn: 12.3,
      minInvestment: 5000,
      riskLevel: "medium",
      category: "mutual_fund",
      features: ["পেশাদার ব্যবস্থাপনা", "বৈচিত্র্যময় পোর্টফোলিও", "তরলতা"],
    },
    {
      id: "4",
      name: "স্টক মার্কেট",
      nameEn: "Stock Market",
      description: "শেয়ার বাজারে প্রত্যক্ষ বিনিয়োগ",
      expectedReturn: 15.8,
      minInvestment: 10000,
      riskLevel: "high",
      category: "stock",
      features: ["উচ্চ রিটার্ন সম্ভাবনা", "তাৎক্ষণিক ট্রেডিং", "লভ্যাংশ আয়"],
    },
    {
      id: "5",
      name: "ফিক্সড ডিপোজিট",
      nameEn: "Fixed Deposit",
      description: "ব্যাংক ফিক্সড ডিপোজিট",
      expectedReturn: 6.5,
      minInvestment: 1000,
      riskLevel: "low",
      category: "bank",
      features: ["নিশ্চিত রিটার্ন", "বিভিন্ন মেয়াদ", "সহজ প্রক্রিয়া"],
    },
  ];

  const categories = [
    { key: "all", label: "সব", icon: "view-grid" },
    { key: "government", label: "সরকারি", icon: "bank" },
    { key: "bank", label: "ব্যাংক", icon: "office-building" },
    { key: "mutual_fund", label: "মিউচুয়াল ফান্ড", icon: "chart-line" },
    { key: "stock", label: "শেয়ার", icon: "trending-up" },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "#4CAF50";
      case "medium":
        return "#FF9800";
      case "high":
        return "#F44336";
      default:
        return theme.colors.primary;
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "low":
        return "কম ঝুঁকি";
      case "medium":
        return "মাঝারি ঝুঁকি";
      case "high":
        return "উচ্চ ঝুঁকি";
      default:
        return "অজানা";
    }
  };

  const getInvestmentType = (investmentName: string): InvestmentType => {
    switch (investmentName) {
      case "সঞ্চয়পত্র":
        return InvestmentType.Sanchayapatra;
      case "DPS":
        return InvestmentType.DPS;
      case "মিউচুয়াল ফান্ড":
        return InvestmentType.MutualFund;
      case "স্টক মার্কেট":
        return InvestmentType.Stock;
      case "ফিক্সড ডিপোজিট":
        return InvestmentType.FixedDeposit;
      default:
        return InvestmentType.Sanchayapatra;
    }
  };

  const filteredInvestments = investmentOptions.filter((investment) => {
    const matchesSearch =
      investment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investment.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || investment.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
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
                    <Title style={styles.investmentName}>
                      {investment.name}
                    </Title>
                    <Text variant="bodySmall" style={styles.investmentNameEn}>
                      {investment.nameEn}
                    </Text>
                  </View>
                  <Chip
                    style={[
                      styles.riskChip,
                      { backgroundColor: getRiskColor(investment.riskLevel) },
                    ]}
                    textStyle={{ color: "white", fontSize: 10 }}
                  >
                    {getRiskLabel(investment.riskLevel)}
                  </Chip>
                </View>

                <Paragraph style={styles.description}>
                  {investment.description}
                </Paragraph>

                <View style={styles.investmentStats}>
                  <View style={styles.statItem}>
                    <Icon
                      name="trending-up"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text variant="bodySmall" style={styles.statText}>
                      প্রত্যাশিত রিটার্ন: {investment.expectedReturn}%
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon
                      name="currency-bdt"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text variant="bodySmall" style={styles.statText}>
                      ন্যূনতম: {formatCurrency(investment.minInvestment)}
                    </Text>
                  </View>
                </View>

                <View style={styles.features}>
                  {investment.features.map((feature, index) => (
                    <Chip
                      key={index}
                      mode="outlined"
                      style={styles.featureChip}
                      textStyle={styles.featureText}
                    >
                      {feature}
                    </Chip>
                  ))}
                </View>

                <View style={styles.cardActions}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      const investmentType = getInvestmentType(investment.name);
                      (navigation.navigate as any)("InvestmentDetails", {
                        investmentType,
                      });
                    }}
                    style={styles.detailsButton}
                  >
                    বিস্তারিত
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      const investmentType = getInvestmentType(investment.name);
                      (navigation.navigate as any)("InvestmentForm", {
                        investmentType,
                        investmentName: investment.name,
                      });
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

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => { }}
        label="কাস্টম প্ল্যান"
      />
    </View>
  );
};

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
  investmentNameEn: {
    color: theme.colors.onSurfaceVariant,
    fontStyle: "italic",
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
});

export default InvestmentScreen;