import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import {
    Button,
    Text,
    Card,
    Surface,
    Chip,
    TextInput,
    Divider,
    List,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryTheme } from 'victory-native';

import { theme, spacing } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { InvestmentRecommendationService } from '@/services/investmentRecommendation';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { InvestmentType, RiskLevel } from '@/types';

type RouteParams = {
    InvestmentDetails: {
        investmentId: string;
        investmentType?: InvestmentType;
    };
};

export const InvestmentDetailsScreen: React.FC = () => {
    const route = useRoute<RouteProp<RouteParams, 'InvestmentDetails'>>();
    const navigation = useNavigation();
    const { user, financialProfile, riskAssessment, addInvestment } = useUserStore();

    const [investmentAmount, setInvestmentAmount] = useState('');
    const [investmentPeriod, setInvestmentPeriod] = useState('5');
    const [monthlyContribution, setMonthlyContribution] = useState('');
    const [showProjection, setShowProjection] = useState(false);

    const investmentType = route.params?.investmentType || InvestmentType.SANCHAYAPATRA;
    const investmentDetails = InvestmentRecommendationService.getInvestmentDetails(investmentType);

    useEffect(() => {
        if (investmentDetails && user && financialProfile) {
            // Set default investment amount based on user's capacity
            const availableAmount = financialProfile.monthlyIncome - financialProfile.monthlyExpenses;
            const suggestedAmount = Math.max(
                Math.min(availableAmount * 0.2, 50000),
                investmentDetails.minInvestment
            );
            setInvestmentAmount(suggestedAmount.toString());
            setMonthlyContribution((availableAmount * 0.1).toString());
        }
    }, [investmentDetails, user, financialProfile]);

    if (!investmentDetails) {
        return (
            <View style={styles.container}>
                <Text>বিনিয়োগের তথ্য পাওয়া যায়নি</Text>
            </View>
        );
    }

    const getRiskColor = (risk: RiskLevel): string => {
        switch (risk) {
            case RiskLevel.LOW:
                return '#4CAF50';
            case RiskLevel.MEDIUM:
                return '#FF9800';
            case RiskLevel.HIGH:
                return '#F44336';
            default:
                return theme.colors.primary;
        }
    };

    const getRiskLabel = (risk: RiskLevel): string => {
        switch (risk) {
            case RiskLevel.LOW:
                return 'কম ঝুঁকি';
            case RiskLevel.MEDIUM:
                return 'মাঝারি ঝুঁকি';
            case RiskLevel.HIGH:
                return 'উচ্চ ঝুঁকি';
            default:
                return 'অজানা';
        }
    };

    const calculateProjection = () => {
        const amount = parseFloat(investmentAmount) || 0;
        const monthly = parseFloat(monthlyContribution) || 0;
        const years = parseInt(investmentPeriod) || 5;

        if (amount < investmentDetails.minInvestment) {
            Alert.alert(
                'অপর্যাপ্ত পরিমাণ',
                `ন্যূনতম বিনিয়োগ ${formatCurrency(investmentDetails.minInvestment)} হতে হবে।`,
                [{ text: 'ঠিক আছে' }]
            );
            return;
        }

        const projection = InvestmentRecommendationService.calculateProjection(
            amount,
            investmentDetails.expectedReturn,
            years,
            monthly
        );

        setShowProjection(true);
        return projection;
    };

    const handleInvest = () => {
        const amount = parseFloat(investmentAmount) || 0;

        if (amount < investmentDetails.minInvestment) {
            Alert.alert(
                'অপর্যাপ্ত পরিমাণ',
                `ন্যূনতম বিনিয়োগ ${formatCurrency(investmentDetails.minInvestment)} হতে হবে।`,
                [{ text: 'ঠিক আছে' }]
            );
            return;
        }

        Alert.alert(
            'বিনিয়োগ নিশ্চিত করুন',
            `আপনি কি ${formatCurrency(amount)} টাকা ${investmentDetails.name} এ বিনিয়োগ করতে চান?`,
            [
                { text: 'বাতিল', style: 'cancel' },
                {
                    text: 'নিশ্চিত করুন',
                    onPress: () => {
                        const newInvestment = {
                            id: Date.now().toString(),
                            userId: user?.id || '',
                            name: investmentDetails.name,
                            type: investmentDetails.type,
                            amount,
                            currentValue: amount,
                            expectedReturn: investmentDetails.expectedReturn,
                            startDate: new Date(),
                            riskLevel: investmentDetails.riskLevel,
                            status: 'active' as const,
                            description: investmentDetails.description,
                            features: investmentDetails.features,
                        };

                        addInvestment(newInvestment);

                        Alert.alert(
                            'বিনিয়োগ সফল',
                            'আপনার বিনিয়োগ সফলভাবে সম্পন্ন হয়েছে।',
                            [
                                {
                                    text: 'ঠিক আছে',
                                    onPress: () => navigation.goBack(),
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const projection = showProjection ? calculateProjection() : null;

    const chartData = projection?.yearlyBreakdown.map(item => ({
        x: item.year,
        y: item.value,
        y0: item.investment,
    })) || [];

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
                            <Text variant="bodyMedium" style={styles.subtitle}>
                                {investmentDetails.nameEn}
                            </Text>
                            <Text variant="bodyLarge" style={styles.description}>
                                {investmentDetails.description}
                            </Text>
                        </View>

                        <View style={styles.metricsSection}>
                            <Surface style={styles.metricCard}>
                                <Text variant="headlineSmall" style={styles.metricValue}>
                                    {investmentDetails.expectedReturn}%
                                </Text>
                                <Text variant="bodySmall" style={styles.metricLabel}>
                                    প্রত্যাশিত রিটার্ন
                                </Text>
                            </Surface>

                            <Surface style={styles.metricCard}>
                                <Chip
                                    style={[styles.riskChip, { backgroundColor: getRiskColor(investmentDetails.riskLevel) }]}
                                    textStyle={{ color: 'white', fontSize: 12 }}>
                                    {getRiskLabel(investmentDetails.riskLevel)}
                                </Chip>
                            </Surface>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            {/* Investment Calculator */}
            <Card style={styles.calculatorCard}>
                <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                        বিনিয়োগ ক্যালকুলেটর
                    </Text>

                    <TextInput
                        label="প্রাথমিক বিনিয়োগ (টাকা)"
                        value={investmentAmount}
                        onChangeText={setInvestmentAmount}
                        keyboardType="numeric"
                        left={<TextInput.Icon icon="currency-bdt" />}
                        style={styles.input}
                        helperText={`ন্যূনতম: ${formatCurrency(investmentDetails.minInvestment)}`}
                    />

                    <TextInput
                        label="মাসিক অতিরিক্ত বিনিয়োগ (টাকা)"
                        value={monthlyContribution}
                        onChangeText={setMonthlyContribution}
                        keyboardType="numeric"
                        left={<TextInput.Icon icon="calendar-month" />}
                        style={styles.input}
                        helperText="ঐচ্ছিক - নিয়মিত মাসিক বিনিয়োগ"
                    />

                    <TextInput
                        label="বিনিয়োগের মেয়াদ (বছর)"
                        value={investmentPeriod}
                        onChangeText={setInvestmentPeriod}
                        keyboardType="numeric"
                        left={<TextInput.Icon icon="calendar-clock" />}
                        style={styles.input}
                    />

                    <Button
                        mode="contained"
                        onPress={calculateProjection}
                        style={styles.calculateButton}
                        icon="calculator">
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

                        {/* Growth Chart */}
                        <View style={styles.chartContainer}>
                            <Text variant="titleMedium" style={styles.chartTitle}>
                                বৃদ্ধির চার্ট
                            </Text>
                            <VictoryChart
                                theme={VictoryTheme.material}
                                height={200}
                                padding={{ left: 60, top: 20, right: 40, bottom: 40 }}>
                                <VictoryAxis dependentAxis tickFormat={(x) => `${x / 1000}K`} />
                                <VictoryAxis />
                                <VictoryArea
                                    data={chartData}
                                    style={{
                                        data: { fill: theme.colors.primaryContainer, fillOpacity: 0.6 }
                                    }}
                                />
                                <VictoryLine
                                    data={chartData.map(d => ({ x: d.x, y: d.y0 }))}
                                    style={{
                                        data: { stroke: theme.colors.primary, strokeWidth: 2 }
                                    }}
                                />
                            </VictoryChart>
                        </View>
                    </Card.Content>
                </Card>
            )}

            {/* Features & Benefits */}
            <Card style={styles.featuresCard}>
                <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                        বৈশিষ্ট্য ও সুবিধা
                    </Text>

                    <View style={styles.featuresGrid}>
                        {investmentDetails.features.map((feature, index) => (
                            <Chip key={index} mode="outlined" style={styles.featureChip}>
                                {feature}
                            </Chip>
                        ))}
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.prosConsContainer}>
                        <View style={styles.prosSection}>
                            <Text variant="titleMedium" style={styles.prosTitle}>
                                ✅ সুবিধাসমূহ
                            </Text>
                            {investmentDetails.pros.map((pro, index) => (
                                <Text key={index} variant="bodyMedium" style={styles.proItem}>
                                    • {pro}
                                </Text>
                            ))}
                        </View>

                        <View style={styles.consSection}>
                            <Text variant="titleMedium" style={styles.consTitle}>
                                ⚠️ অসুবিধাসমূহ
                            </Text>
                            {investmentDetails.cons.map((con, index) => (
                                <Text key={index} variant="bodyMedium" style={styles.conItem}>
                                    • {con}
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

                    <List.Item
                        title="ন্যূনতম বিনিয়োগ"
                        description={formatCurrency(investmentDetails.minInvestment)}
                        left={props => <List.Icon {...props} icon="currency-bdt" />}
                    />

                    <List.Item
                        title="তরলতা"
                        description={`${investmentDetails.liquidityDays} দিন`}
                        left={props => <List.Icon {...props} icon="clock-outline" />}
                    />

                    <List.Item
                        title="কর সুবিধা"
                        description={investmentDetails.taxBenefit ? 'হ্যাঁ' : 'না'}
                        left={props => <List.Icon {...props} icon="receipt" />}
                    />

                    <List.Item
                        title="প্রদানকারী"
                        description={investmentDetails.provider}
                        left={props => <List.Icon {...props} icon="bank" />}
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
                        contentStyle={styles.investButtonContent}>
                        এখনই বিনিয়োগ করুন
                    </Button>

                    <Text variant="bodySmall" style={styles.disclaimer}>
                        * এটি একটি ডেমো অ্যাপ। প্রকৃত বিনিয়োগের জন্য সংশ্লিষ্ট প্রতিষ্ঠানের সাথে যোগাযোগ করুন।
                    </Text>
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

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
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        textAlign: 'center',
    },
    subtitle: {
        color: theme.colors.onSurfaceVariant,
        fontStyle: 'italic',
        marginTop: spacing.xs,
    },
    description: {
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
        marginTop: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    metricsSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    metricCard: {
        padding: spacing.md,
        borderRadius: theme.roundness,
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceVariant,
    },
    metricValue: {
        fontWeight: 'bold',
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
        fontWeight: 'bold',
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
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.lg,
    },
    projectionItem: {
        alignItems: 'center',
    },
    projectionValue: {
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    projectionLabel: {
        color: theme.colors.onSurfaceVariant,
        marginTop: spacing.xs,
    },
    chartContainer: {
        alignItems: 'center',
    },
    chartTitle: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginBottom: spacing.sm,
    },
    featuresCard: {
        margin: spacing.md,
        marginTop: spacing.sm,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
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
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: spacing.sm,
    },
    proItem: {
        color: theme.colors.onSurface,
        marginBottom: spacing.xs,
    },
    consSection: {},
    consTitle: {
        fontWeight: 'bold',
        color: '#FF9800',
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
        textAlign: 'center',
        color: theme.colors.onSurfaceVariant,
        marginTop: spacing.md,
        fontStyle: 'italic',
    },
});

