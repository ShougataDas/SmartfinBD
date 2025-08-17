import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text, Surface } from "react-native-paper";
import { CartesianChart, Line, Area, useChartPressState } from "victory-native";
import { useFont } from "@shopify/react-native-skia";

import { theme, spacing } from "@/constants/theme";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { Investment, InvestmentType } from "@/types";

const { width: screenWidth } = Dimensions.get("window");
const chartWidth = screenWidth - spacing.lg * 2;

interface PortfolioChartProps {
  investments: Investment[];
  type: "pie" | "performance" | "growth";
  title: string;
  height?: number;
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({
  investments,
  type,
  title,
  height = 250,
}) => {
  // Move hooks to component level
  const font = useFont(require("@/assets/fonts/SpaceMono-Regular.ttf"), 12);
  const { state: performanceState } = useChartPressState({ x: 0, y: { y: 0 } });
  const yKeys = investments.map((_, index) => `y${index}`);
  const { state: growthState } = useChartPressState({
    x: 0,
    y: Object.fromEntries(yKeys.map((key) => [key, 0])),
  });

  const getInvestmentTypeColor = (investmentType: InvestmentType): string => {
    const colors: Record<InvestmentType, string> = {
      [InvestmentType.Sanchayapatra]: "#4CAF50",
      [InvestmentType.DPS]: "#2196F3",
      [InvestmentType.FixedDeposit]: "#FF9800",
      [InvestmentType.MutualFund]: "#9C27B0",
      [InvestmentType.Stock]: "#F44336",
      [InvestmentType.Other]: "#607D8B",
      [InvestmentType.Bond]: "#FFEB3B",
    };
    return colors[investmentType] || theme.colors.primary;
  };

  const getInvestmentTypeName = (investmentType: InvestmentType): string => {
    const names: Record<InvestmentType, string> = {
      [InvestmentType.Sanchayapatra]: "সঞ্চয়পত্র",
      [InvestmentType.DPS]: "DPS",
      [InvestmentType.FixedDeposit]: "ফিক্সড ডিপোজিট",
      [InvestmentType.MutualFund]: "মিউচুয়াল ফান্ড",
      [InvestmentType.Stock]: "স্টক",
      [InvestmentType.Other]: "অন্যান্য",
      [InvestmentType.Bond]: "বন্ড",
    };
    return names[investmentType] || investmentType;
  };

  const renderPieChart = () => {
    const pieData = investments.map((investment) => ({
      label: getInvestmentTypeName(investment.type),
      value: investment.currentValue,
      color: getInvestmentTypeColor(investment.type),
    }));

    const totalValue = investments.reduce(
      (sum, inv) => sum + inv.currentValue,
      0
    );

    return (
      <View style={styles.chartContainer}>
        {/* Custom Pie Chart using basic React Native components */}
        <View style={styles.pieChartContainer}>
          {pieData.map((item, index) => {
            const percentage = (item.value / totalValue) * 100;
            return (
              <View key={index} style={styles.pieSegment}>
                <View
                  style={[
                    styles.pieBar,
                    {
                      backgroundColor: item.color,
                      width: `${percentage}%`,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>

        {/* Center Label */}
        <View style={styles.centerLabel}>
          <Text variant="headlineSmall" style={styles.totalValue}>
            {formatCurrency(totalValue)}
          </Text>
          <Text variant="bodySmall" style={styles.totalLabel}>
            মোট পোর্টফোলিও
          </Text>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {pieData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: item.color }]}
              />
              <Text variant="bodySmall" style={styles.legendText}>
                {item.label}: {formatPercentage(item.value / totalValue)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderPerformanceChart = () => {
    const performanceData = investments.map((investment, index) => {
      const returnPercentage =
        ((investment.currentValue - investment.amount) / investment.amount) *
        100;
      return {
        x: index,
        y: returnPercentage,
        label: getInvestmentTypeName(investment.type),
        color: returnPercentage >= 0 ? "#4CAF50" : "#F44336",
      };
    });

    return (
      <View style={styles.chartContainer}>
        <CartesianChart
          data={performanceData}
          xKey="x"
          yKeys={["y"]}
          axisOptions={{
            font: font,
            formatYLabel: (value: number) => `${value.toFixed(1)}%`,
            formatXLabel: (value: number) =>
              performanceData[value]?.label || "",
          }}
          chartPressState={performanceState}
        >
          {({ points }) => (
            <Area
              points={points.y}
              y0={0}
              color={theme.colors.primary}
              opacity={0.7}
            />
          )}
        </CartesianChart>

        {/* Performance Legend */}
        <View style={styles.legend}>
          {performanceData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: item.color }]}
              />
              <Text variant="bodySmall" style={styles.legendText}>
                {item.label}: {item.y.toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderGrowthChart = () => {
    // Generate growth projection data
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const growthData = months.map((month) => {
      const dataPoint: any = { x: month };
      investments.forEach((investment, index) => {
        const monthlyGrowth = investment.expectedReturn / 12 / 100;
        dataPoint[`y${index}`] =
          investment.amount * Math.pow(1 + monthlyGrowth, month);
      });
      return dataPoint;
    });

    return (
      <View style={styles.chartContainer}>
        <CartesianChart
          data={growthData}
          xKey="x"
          yKeys={yKeys}
          axisOptions={{
            font: font,
            formatYLabel: (value: number) => `${(value / 1000).toFixed(0)}K`,
            formatXLabel: (value: number) => `${value}M`,
          }}
          chartPressState={growthState}
        >
          {({ points }) => (
            <>
              {investments.map((investment, index) => (
                <Line
                  key={index}
                  points={points[`y${index}`]}
                  color={getInvestmentTypeColor(investment.type)}
                  strokeWidth={3}
                />
              ))}
            </>
          )}
        </CartesianChart>

        {/* Growth Legend */}
        <View style={styles.legend}>
          {investments.map((investment, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: getInvestmentTypeColor(investment.type) },
                ]}
              />
              <Text variant="bodySmall" style={styles.legendText}>
                {getInvestmentTypeName(investment.type)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderChart = () => {
    switch (type) {
      case "pie":
        return renderPieChart();
      case "performance":
        return renderPerformanceChart();
      case "growth":
        return renderGrowthChart();
      default:
        return renderPieChart();
    }
  };

  return (
    <Surface style={styles.container} elevation={2}>
      <Text variant="titleLarge" style={styles.title}>
        {title}
      </Text>
      {investments.length > 0 ? (
        renderChart()
      ) : (
        <View style={styles.emptyState}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            কোনো বিনিয়োগ তথ্য পাওয়া যায়নি
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            বিনিয়োগ শুরু করুন এবং আপনার পোর্টফোলিও দেখুন
          </Text>
        </View>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: spacing.md,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontWeight: "bold",
    color: theme.colors.onSurface,
    textAlign: "center",
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  chartContainer: {
    alignItems: "center",
    paddingBottom: spacing.lg,
    height: 300,
  },
  pieChartContainer: {
    width: chartWidth - 40,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: spacing.md,
  },
  pieSegment: {
    width: "100%",
    height: 20,
    marginVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceVariant,
  },
  pieBar: {
    height: "100%",
    borderRadius: 10,
  },
  centerLabel: {
    position: "absolute",
    top: "30%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -20 }],
    alignItems: "center",
  },
  totalValue: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  totalLabel: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    color: theme.colors.onSurface,
    fontSize: 11,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    color: theme.colors.onSurfaceVariant,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    color: theme.colors.onSurfaceVariant,
    textAlign: "center",
    opacity: 0.7,
  },
});
