import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { theme, spacing } from '@/constants/theme';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { Investment, FinancialProfile } from '@/types';

interface FinancialMetricsProps {
    investments: Investment[];
    financialProfile: FinancialProfile;
}

interface MetricCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: string;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    color,
    trend,
    trendValue,
}) => {
    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return 'trending-up';
            case 'down':
                return 'trending-down';
            default:
                return 'trending-neutral';
        }
    };

    const getTrendColor = () => {
        switch (trend) {
            case 'up':
                return '#4CAF50';
            case 'down':
                return '#F44336';
            default:
                return theme.colors.onSurfaceVariant;
        }
    };

    return (
        <Card style={styles.metricCard}>
            <Card.Content style={styles.metricContent}>
                <View style={styles.metricHeader}>
                    <Icon name={icon} size={24} color={color} />
                    <Text variant="bodySmall" style={styles.metricTitle}>
                        {title}
                    </Text>
                </View>

                <Text variant="headlineSmall" style={[styles.metricValue, { color }]}>
                    {value}
                </Text>

                {subtitle && (
                    <Text variant="bodySmall" style={styles.metricSubtitle}>
                        {subtitle}
                    </Text>
                )}

                {trend && trendValue && (
                    <View style={styles.trendContainer}>
                        <Icon name={getTrendIcon()} size={16} color={getTrendColor()} />
                        <Text variant="bodySmall" style={[styles.trendText, { color: getTrendColor() }]}>
                            {trendValue}
                        </Text>
                    </View>
                )}
            </Card.Content>
        </Card>
    );
};

export const FinancialMetrics: React.FC<FinancialMetricsProps> = ({
    investments,
    financialProfile,
}) => {
    // Calculate metrics
    const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalReturn = totalCurrentValue - totalInvestment;
    const returnPercentage = totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;

    const monthlyIncome = financialProfile.monthlyIncome;
    const monthlyExpenses = financialProfile.monthlyExpenses;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

    const currentSavings = financialProfile.currentSavings;
    const emergencyFundMonths = monthlyExpenses > 0 ? currentSavings / monthlyExpenses : 0;

    // Calculate weighted average return
    const weightedReturn = investments.reduce((sum, inv) => {
        const weight = inv.amount / totalInvestment;
        return sum + (inv.expectedReturn * weight);
    }, 0);

    // Calculate portfolio diversity (number of different investment types)
    const uniqueTypes = new Set(investments.map(inv => inv.type));
    const diversityScore = (uniqueTypes.size / 6) * 100; // 6 is max investment types

    const metrics = [
        {
            title: 'মোট পোর্টফোলিও',
            value: formatCurrency(totalCurrentValue),
            subtitle: `${investments.length}টি বিনিয়োগ`,
            icon: 'wallet',
            color: theme.colors.primary,
            trend: returnPercentage > 0 ? 'up' : returnPercentage < 0 ? 'down' : 'neutral',
            trendValue: formatPercentage(returnPercentage / 100),
        },
        {
            title: 'মোট রিটার্ন',
            value: formatCurrency(totalReturn),
            subtitle: 'লাভ/ক্ষতি',
            icon: totalReturn >= 0 ? 'trending-up' : 'trending-down',
            color: totalReturn >= 0 ? '#4CAF50' : '#F44336',
            trend: totalReturn >= 0 ? 'up' : 'down',
            trendValue: formatPercentage(returnPercentage / 100),
        },
        {
            title: 'মাসিক সঞ্চয়',
            value: formatCurrency(monthlySavings),
            subtitle: `সঞ্চয়ের হার: ${formatPercentage(savingsRate / 100)}`,
            icon: 'piggy-bank',
            color: '#2196F3',
            trend: savingsRate >= 20 ? 'up' : savingsRate >= 10 ? 'neutral' : 'down',
            trendValue: `${savingsRate.toFixed(1)}%`,
        },
        {
            title: 'জরুরি তহবিল',
            value: formatCurrency(currentSavings),
            subtitle: `${emergencyFundMonths.toFixed(1)} মাসের খরচ`,
            icon: 'shield-check',
            color: '#FF9800',
            trend: emergencyFundMonths >= 6 ? 'up' : emergencyFundMonths >= 3 ? 'neutral' : 'down',
            trendValue: `${emergencyFundMonths.toFixed(1)}M`,
        },
        {
            title: 'প্রত্যাশিত রিটার্ন',
            value: `${weightedReturn.toFixed(1)}%`,
            subtitle: 'বার্ষিক গড় রিটার্ন',
            icon: 'chart-line',
            color: '#9C27B0',
            trend: weightedReturn >= 10 ? 'up' : weightedReturn >= 7 ? 'neutral' : 'down',
            trendValue: 'বার্ষিক',
        },
        {
            title: 'পোর্টফোলিও বৈচিত্র্য',
            value: `${diversityScore.toFixed(0)}%`,
            subtitle: `${uniqueTypes.size} ধরনের বিনিয়োগ`,
            icon: 'chart-donut',
            color: '#607D8B',
            trend: diversityScore >= 50 ? 'up' : diversityScore >= 30 ? 'neutral' : 'down',
            trendValue: `${uniqueTypes.size}/6`,
        },
    ];

    return (
        <View style={styles.container}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
                আর্থিক সূচক
            </Text>

            <View style={styles.metricsGrid}>
                {metrics.map((metric, index) => (
                    <MetricCard
                        key={index}
                        title={metric.title}
                        value={metric.value}
                        subtitle={metric.subtitle}
                        icon={metric.icon}
                        color={metric.color}
                        trend={metric.trend as 'up' | 'down' | 'neutral'}
                        trendValue={metric.trendValue}
                    />
                ))}
            </View>

            {/* Financial Health Score */}
            <Card style={styles.healthScoreCard}>
                <Card.Content>
                    <View style={styles.healthScoreHeader}>
                        <Icon name="heart-pulse" size={32} color={theme.colors.primary} />
                        <Text variant="titleLarge" style={styles.healthScoreTitle}>
                            আর্থিক স্বাস্থ্য স্কোর
                        </Text>
                    </View>

                    <View style={styles.healthScoreContent}>
                        {renderHealthScore(savingsRate, emergencyFundMonths, diversityScore, returnPercentage)}
                    </View>
                </Card.Content>
            </Card>
        </View>
    );
};

const renderHealthScore = (
    savingsRate: number,
    emergencyFundMonths: number,
    diversityScore: number,
    returnPercentage: number
): React.ReactElement => {
    // Calculate health score (0-100)
    let score = 0;

    // Savings rate (25 points)
    if (savingsRate >= 20) score += 25;
    else if (savingsRate >= 15) score += 20;
    else if (savingsRate >= 10) score += 15;
    else if (savingsRate >= 5) score += 10;

    // Emergency fund (25 points)
    if (emergencyFundMonths >= 6) score += 25;
    else if (emergencyFundMonths >= 3) score += 20;
    else if (emergencyFundMonths >= 1) score += 15;
    else if (emergencyFundMonths >= 0.5) score += 10;

    // Portfolio diversity (25 points)
    score += (diversityScore / 100) * 25;

    // Investment performance (25 points)
    if (returnPercentage >= 10) score += 25;
    else if (returnPercentage >= 5) score += 20;
    else if (returnPercentage >= 0) score += 15;
    else if (returnPercentage >= -5) score += 10;

    const getScoreColor = (score: number): string => {
        if (score >= 80) return '#4CAF50';
        if (score >= 60) return '#FF9800';
        return '#F44336';
    };

    const getScoreLabel = (score: number): string => {
        if (score >= 80) return 'চমৎকার';
        if (score >= 60) return 'ভালো';
        if (score >= 40) return 'মাঝারি';
        return 'উন্নতি প্রয়োজন';
    };

    return (
        <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
                <Text variant="headlineLarge" style={[styles.scoreValue, { color: getScoreColor(score) }]}>
                    {Math.round(score)}
                </Text>
                <Text variant="bodyMedium" style={styles.scoreLabel}>
                    {getScoreLabel(score)}
                </Text>
            </View>

            <View style={styles.scoreBreakdown}>
                <View style={styles.scoreItem}>
                    <Text variant="bodySmall" style={styles.scoreItemLabel}>সঞ্চয়ের হার</Text>
                    <View style={styles.scoreBar}>
                        <View style={[styles.scoreBarFill, { width: `${Math.min(savingsRate * 5, 100)}%`, backgroundColor: '#2196F3' }]} />
                    </View>
                </View>

                <View style={styles.scoreItem}>
                    <Text variant="bodySmall" style={styles.scoreItemLabel}>জরুরি তহবিল</Text>
                    <View style={styles.scoreBar}>
                        <View style={[styles.scoreBarFill, { width: `${Math.min(emergencyFundMonths * 16.67, 100)}%`, backgroundColor: '#FF9800' }]} />
                    </View>
                </View>

                <View style={styles.scoreItem}>
                    <Text variant="bodySmall" style={styles.scoreItemLabel}>বৈচিত্র্য</Text>
                    <View style={styles.scoreBar}>
                        <View style={[styles.scoreBarFill, { width: `${diversityScore}%`, backgroundColor: '#9C27B0' }]} />
                    </View>
                </View>

                <View style={styles.scoreItem}>
                    <Text variant="bodySmall" style={styles.scoreItemLabel}>রিটার্ন</Text>
                    <View style={styles.scoreBar}>
                        <View style={[styles.scoreBarFill, { width: `${Math.min(Math.max(returnPercentage * 5 + 50, 0), 100)}%`, backgroundColor: '#4CAF50' }]} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginBottom: spacing.lg,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    metricCard: {
        width: '48%',
        marginBottom: spacing.md,
    },
    metricContent: {
        paddingVertical: spacing.md,
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    metricTitle: {
        marginLeft: spacing.sm,
        color: theme.colors.onSurfaceVariant,
        flex: 1,
    },
    metricValue: {
        fontWeight: 'bold',
        marginBottom: spacing.xs,
    },
    metricSubtitle: {
        color: theme.colors.onSurfaceVariant,
        marginBottom: spacing.xs,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendText: {
        marginLeft: spacing.xs,
        fontSize: 12,
        fontWeight: 'bold',
    },
    healthScoreCard: {
        backgroundColor: theme.colors.surfaceVariant,
    },
    healthScoreHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    healthScoreTitle: {
        marginLeft: spacing.md,
        fontWeight: 'bold',
        color: theme.colors.onSurface,
    },
    healthScoreContent: {
        alignItems: 'center',
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    scoreCircle: {
        alignItems: 'center',
        marginRight: spacing.xl,
    },
    scoreValue: {
        fontWeight: 'bold',
        fontSize: 48,
    },
    scoreLabel: {
        color: theme.colors.onSurfaceVariant,
        marginTop: spacing.xs,
    },
    scoreBreakdown: {
        flex: 1,
    },
    scoreItem: {
        marginBottom: spacing.md,
    },
    scoreItemLabel: {
        color: theme.colors.onSurfaceVariant,
        marginBottom: spacing.xs,
    },
    scoreBar: {
        height: 8,
        backgroundColor: theme.colors.outline,
        borderRadius: 4,
        overflow: 'hidden',
    },
    scoreBarFill: {
        height: '100%',
        borderRadius: 4,
    },
});

