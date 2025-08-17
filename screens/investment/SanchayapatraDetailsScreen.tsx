import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Alert,
    Dimensions,
} from 'react-native';
import {
    Button,
    Text,
    Card,
    Surface,
    Chip,
    TextInput,
    HelperText,
    Divider,
    List,
    DataTable,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { theme, spacing } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { InvestmentType, RiskLevel, InvestmentStatus,InvestmentDetails,InvestmentRecommendation } from '@/types';

const { width: screenWidth } = Dimensions.get('window');

interface SanchayapatraType {
    name: string;
    nameEn: string;
    tenure: number;
    interestRate: number;
    minInvestment: number;
    maxInvestment: number;
    taxBenefit: boolean;
    features: string[];
}

const sanchayapatraTypes: SanchayapatraType[] = [
    {
        name: '৫ বছর মেয়াদী সঞ্চয়পত্র',
        nameEn: '5-Year Sanchayapatra',
        tenure: 5,
        interestRate: 8.5,
        minInvestment: 1000,
        maxInvestment: 3000000,
        taxBenefit: true,
        features: ['নিয়মিত সুদ প্রদান', 'সরকারি গ্যারান্টি', 'কর সুবিধা'],
    },
    {
        name: '৩ বছর মেয়াদী সঞ্চয়পত্র',
        nameEn: '3-Year Sanchayapatra',
        tenure: 3,
        interestRate: 8.0,
        minInvestment: 1000,
        maxInvestment: 2000000,
        taxBenefit: true,
        features: ['ত্রৈমাসিক সুদ প্রদান', 'সরকারি গ্যারান্টি', 'কর সুবিধা'],
    },
    {
        name: 'পেনশনার সঞ্চয়পত্র',
        nameEn: 'Pensioner Sanchayapatra',
        tenure: 5,
        interestRate: 9.0,
        minInvestment: 1000,
        maxInvestment: 5000000,
        taxBenefit: true,
        features: ['পেনশনারদের জন্য বিশেষ', 'উচ্চ সুদের হার', 'মাসিক সুদ প্রদান'],
    },
    {
        name: 'পারিবারিক সঞ্চয়পত্র',
        nameEn: 'Family Sanchayapatra',
        tenure: 5,
        interestRate: 8.75,
        minInvestment: 1000,
        maxInvestment: 4500000,
        taxBenefit: true,
        features: ['পারিবারিক বিনিয়োগের জন্য', 'মাসিক সুদ প্রদান', 'নমনীয় মেয়াদ'],
    },
];

export const SanchayapatraDetailsScreen: React.FC = () => {
    const navigation = useNavigation();
    const { user, financialProfile, addInvestment } = useUserStore();

    const [selectedType, setSelectedType] = useState<SanchayapatraType>(sanchayapatraTypes[0]);
    const [investmentAmount, setInvestmentAmount] = useState('');
    const [showCalculator, setShowCalculator] = useState(false);

    const calculateReturns = (amount: number, rate: number, years: number) => {
        const futureValue = amount * Math.pow(1 + rate / 100, years);
        const totalReturn = futureValue - amount;
        const monthlyReturn = totalReturn / (years * 12);

        return {
            futureValue: Math.round(futureValue),
            totalReturn: Math.round(totalReturn),
            monthlyReturn: Math.round(monthlyReturn),
        };
    };

    const handleInvest = () => {
        const amount = parseFloat(investmentAmount) || 0;

        if (amount < selectedType.minInvestment) {
            Alert.alert(
                'অপর্যাপ্ত পরিমাণ',
                `ন্যূনতম বিনিয়োগ ${formatCurrency(selectedType.minInvestment)} হতে হবে।`,
                [{ text: 'ঠিক আছে' }]
            );
            return;
        }

        if (amount > selectedType.maxInvestment) {
            Alert.alert(
                'সর্বোচ্চ সীমা অতিক্রম',
                `সর্বোচ্চ বিনিয়োগ ${formatCurrency(selectedType.maxInvestment)} হতে পারে।`,
                [{ text: 'ঠিক আছে' }]
            );
            return;
        }

        Alert.alert(
            'বিনিয়োগ নিশ্চিত করুন',
            `আপনি কি ${formatCurrency(amount)} টাকা ${selectedType.name} এ বিনিয়োগ করতে চান?`,
            [
                { text: 'বাতিল', style: 'cancel' },
                {
                    text: 'নিশ্চিত করুন',
                    onPress: () => {
                        const newInvestment = {
                            id: Date.now().toString(),
                            userId: user?.id || '',
                            name: selectedType.name,
                            type: InvestmentType.Sanchayapatra,
                            amount,
                            currentValue: amount,
                            expectedReturn: selectedType.interestRate,
                            startDate: new Date(),
                            maturityDate: new Date(Date.now() + selectedType.tenure * 365 * 24 * 60 * 60 * 1000),
                            status: InvestmentStatus.Active, // ✅ FIXED
                            riskLevel: RiskLevel.Low,
                            details: {
                                institution: 'Bangladesh Bank',
                                certificateNumber: `SB${Date.now()}`,
                                interestRate: selectedType.interestRate,
                            },
                            performance: {
                                monthlyReturns: [],
                                lastUpdated: new Date(),
                            },
                            notifications: {
                                maturityReminder: true,
                                performanceAlerts: true,
                            },
                            notes: selectedType.nameEn,
                            tags: selectedType.features,
                            isActive: true,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };


                        addInvestment(newInvestment);

                        Alert.alert(
                            'বিনিয়োগ সফল',
                            'আপনার সঞ্চয়পত্র বিনিয়োগ সফলভাবে সম্পন্ন হয়েছে।',
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

    const amount = parseFloat(investmentAmount) || 0;
    const projection = amount > 0 ? calculateReturns(amount, selectedType.interestRate, selectedType.tenure) : null;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header Card */}
            <Card style={styles.headerCard}>
                <Card.Content>
                    <View style={styles.headerContent}>
                        <Icon name="bank" size={48} color={theme.colors.primary} />
                        <Text variant="headlineMedium" style={styles.title}>
                            সঞ্চয়পত্র
                        </Text>
                        <Text variant="bodyLarge" style={styles.subtitle}>
                            বাংলাদেশ সরকারের সবচেয়ে নিরাপদ বিনিয়োগ মাধ্যম
                        </Text>
                    </View>

                    <View style={styles.keyMetrics}>
                        <Surface style={styles.metricCard}>
                            <Icon name="shield-check" size={24} color="#4CAF50" />
                            <Text variant="bodySmall" style={styles.metricLabel}>
                                ঝুঁকি
                            </Text>
                            <Text variant="titleMedium" style={styles.metricValue}>
                                শূন্য
                            </Text>
                        </Surface>

                        <Surface style={styles.metricCard}>
                            <Icon name="trending-up" size={24} color={theme.colors.primary} />
                            <Text variant="bodySmall" style={styles.metricLabel}>
                                সুদের হার
                            </Text>
                            <Text variant="titleMedium" style={styles.metricValue}>
                                ৮-৯%
                            </Text>
                        </Surface>

                        <Surface style={styles.metricCard}>
                            <Icon name="currency-bdt" size={24} color={theme.colors.secondary} />
                            <Text variant="bodySmall" style={styles.metricLabel}>
                                ন্যূনতম
                            </Text>
                            <Text variant="titleMedium" style={styles.metricValue}>
                                ১০০০ টাকা
                            </Text>
                        </Surface>
                    </View>
                </Card.Content>
            </Card>

            {/* Types of Sanchayapatra */}
            <Card style={styles.typesCard}>
                <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                        সঞ্চয়পত্রের ধরন
                    </Text>

                    {sanchayapatraTypes.map((type, index) => (
                        <Surface
                            key={index}
                            style={[
                                styles.typeCard,
                                selectedType.name === type.name && styles.selectedTypeCard,
                            ]}
                            onTouchEnd={() => setSelectedType(type)}>
                            <View style={styles.typeHeader}>
                                <View style={styles.typeInfo}>
                                    <Text variant="titleMedium" style={styles.typeName}>
                                        {type.name}
                                    </Text>
                                    <Text variant="bodySmall" style={styles.typeNameEn}>
                                        {type.nameEn}
                                    </Text>
                                </View>
                                <View style={styles.typeMetrics}>
                                    <Chip style={styles.rateChip}>
                                        {type.interestRate}% সুদ
                                    </Chip>
                                    <Text variant="bodySmall" style={styles.tenureText}>
                                        {type.tenure} বছর মেয়াদ
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.typeFeatures}>
                                {type.features.map((feature, idx) => (
                                    <Chip key={idx} mode="outlined" style={styles.featureChip}>
                                        {feature}
                                    </Chip>
                                ))}
                            </View>

                            <View style={styles.typeDetails}>
                                <Text variant="bodySmall" style={styles.investmentRange}>
                                    বিনিয়োগ সীমা: {formatCurrency(type.minInvestment)} - {formatCurrency(type.maxInvestment)}
                                </Text>
                            </View>
                        </Surface>
                    ))}
                </Card.Content>
            </Card>

            {/* Investment Calculator */}
            <Card style={styles.calculatorCard}>
                <Card.Content>
                    <View style={styles.calculatorHeader}>
                        <Text variant="titleLarge" style={styles.sectionTitle}>
                            বিনিয়োগ ক্যালকুলেটর
                        </Text>
                        <Button
                            mode={showCalculator ? "contained" : "outlined"}
                            onPress={() => setShowCalculator(!showCalculator)}
                            icon="calculator">
                            {showCalculator ? 'লুকান' : 'দেখান'}
                        </Button>
                    </View>

                    {showCalculator && (
                        <View style={styles.calculatorContent}>
                            <TextInput
                                label="প্রাথমিক বিনিয়োগ (টাকা)"
                                value={investmentAmount}
                                onChangeText={setInvestmentAmount}
                                keyboardType="numeric"
                                left={<TextInput.Icon icon="currency-bdt" />}
                                style={styles.input}
                            />
                            <HelperText type="info" visible={!!investmentAmount}>
                                ন্যূনতম বিনিয়োগ: {formatCurrency(selectedType.minInvestment)} | সর্বোচ্চ বিনিয়োগ: {formatCurrency(selectedType.maxInvestment)}
                            </HelperText>
                            {projection && (
                                <Surface style={styles.projectionCard}>
                                    <Text variant="titleMedium" style={styles.projectionTitle}>
                                        {selectedType.tenure} বছর পর প্রাপ্ত অর্থ
                                    </Text>

                                    <View style={styles.projectionGrid}>
                                        <View style={styles.projectionItem}>
                                            <Text variant="headlineSmall" style={styles.projectionValue}>
                                                {formatCurrency(projection.futureValue)}
                                            </Text>
                                            <Text variant="bodySmall" style={styles.projectionLabel}>
                                                মোট প্রাপ্ত অর্থ
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
                                                {formatCurrency(projection.monthlyReturn)}
                                            </Text>
                                            <Text variant="bodySmall" style={styles.projectionLabel}>
                                                মাসিক গড় লাভ
                                            </Text>
                                        </View>
                                    </View>
                                </Surface>
                            )}
                        </View>
                    )}
                </Card.Content>
            </Card>

            {/* Features & Benefits */}
            <Card style={styles.featuresCard}>
                <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                        সুবিধাসমূহ
                    </Text>

                    <View style={styles.benefitsList}>
                        <View style={styles.benefitItem}>
                            <Icon name="shield-check" size={24} color="#4CAF50" />
                            <View style={styles.benefitContent}>
                                <Text variant="titleMedium" style={styles.benefitTitle}>
                                    সরকারি গ্যারান্টি
                                </Text>
                                <Text variant="bodyMedium" style={styles.benefitDescription}>
                                    বাংলাদেশ সরকারের পূর্ণ গ্যারান্টি সহ ১০০% নিরাপদ বিনিয়োগ
                                </Text>
                            </View>
                        </View>

                        <View style={styles.benefitItem}>
                            <Icon name="cash-multiple" size={24} color={theme.colors.primary} />
                            <View style={styles.benefitContent}>
                                <Text variant="titleMedium" style={styles.benefitTitle}>
                                    নিয়মিত সুদ প্রদান
                                </Text>
                                <Text variant="bodyMedium" style={styles.benefitDescription}>
                                    মাসিক, ত্রৈমাসিক বা বার্ষিক ভিত্তিতে নিয়মিত সুদ প্রদান
                                </Text>
                            </View>
                        </View>

                        <View style={styles.benefitItem}>
                            <Icon name="receipt" size={24} color="#FF9800" />
                            <View style={styles.benefitContent}>
                                <Text variant="titleMedium" style={styles.benefitTitle}>
                                    কর সুবিধা
                                </Text>
                                <Text variant="bodyMedium" style={styles.benefitDescription}>
                                    আয়কর আইন অনুযায়ী নির্দিষ্ট পরিমাণ পর্যন্ত কর ছাড়
                                </Text>
                            </View>
                        </View>

                        <View style={styles.benefitItem}>
                            <Icon name="bank-transfer" size={24} color="#9C27B0" />
                            <View style={styles.benefitContent}>
                                <Text variant="titleMedium" style={styles.benefitTitle}>
                                    সহজ প্রক্রিয়া
                                </Text>
                                <Text variant="bodyMedium" style={styles.benefitDescription}>
                                    যেকোনো ব্যাংক বা পোস্ট অফিস থেকে সহজেই ক্রয় করা যায়
                                </Text>
                            </View>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            {/* Comparison Table */}
            <Card style={styles.comparisonCard}>
                <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                        তুলনামূলক বিশ্লেষণ
                    </Text>

                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title>ধরন</DataTable.Title>
                            <DataTable.Title numeric>সুদ</DataTable.Title>
                            <DataTable.Title numeric>মেয়াদ</DataTable.Title>
                            <DataTable.Title numeric>সর্বোচ্চ</DataTable.Title>
                        </DataTable.Header>

                        {sanchayapatraTypes.map((type, index) => (
                            <DataTable.Row key={index}>
                                <DataTable.Cell style={styles.nameCell}>
                                    <Text variant="bodySmall" numberOfLines={2}>
                                        {type.name}
                                    </Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text variant="bodyMedium" style={styles.rateText}>
                                        {type.interestRate}%
                                    </Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text variant="bodyMedium">
                                        {type.tenure} বছর
                                    </Text>
                                </DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <Text variant="bodySmall">
                                        {(type.maxInvestment / 100000).toFixed(0)}L
                                    </Text>
                                </DataTable.Cell>
                            </DataTable.Row>
                        ))}
                    </DataTable>
                </Card.Content>
            </Card>

            {/* How to Apply */}
            <Card style={styles.howToCard}>
                <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                        কীভাবে আবেদন করবেন
                    </Text>

                    <View style={styles.stepsList}>
                        <View style={styles.stepItem}>
                            <Surface style={styles.stepNumber}>
                                <Text variant="titleMedium" style={styles.stepNumberText}>১</Text>
                            </Surface>
                            <View style={styles.stepContent}>
                                <Text variant="titleMedium" style={styles.stepTitle}>
                                    প্রয়োজনীয় কাগজপত্র
                                </Text>
                                <Text variant="bodyMedium" style={styles.stepDescription}>
                                    জাতীয় পরিচয়পত্র, ছবি, ব্যাংক অ্যাকাউন্ট তথ্য
                                </Text>
                            </View>
                        </View>

                        <View style={styles.stepItem}>
                            <Surface style={styles.stepNumber}>
                                <Text variant="titleMedium" style={styles.stepNumberText}>২</Text>
                            </Surface>
                            <View style={styles.stepContent}>
                                <Text variant="titleMedium" style={styles.stepTitle}>
                                    ব্যাংক বা পোস্ট অফিসে যান
                                </Text>
                                <Text variant="bodyMedium" style={styles.stepDescription}>
                                    যেকোনো সরকারি ব্যাংক বা পোস্ট অফিসে আবেদন করুন
                                </Text>
                            </View>
                        </View>

                        <View style={styles.stepItem}>
                            <Surface style={styles.stepNumber}>
                                <Text variant="titleMedium" style={styles.stepNumberText}>৩</Text>
                            </Surface>
                            <View style={styles.stepContent}>
                                <Text variant="titleMedium" style={styles.stepTitle}>
                                    ফর্ম পূরণ ও অর্থ জমা
                                </Text>
                                <Text variant="bodyMedium" style={styles.stepDescription}>
                                    আবেদন ফর্ম পূরণ করে নির্ধারিত অর্থ জমা দিন
                                </Text>
                            </View>
                        </View>

                        <View style={styles.stepItem}>
                            <Surface style={styles.stepNumber}>
                                <Text variant="titleMedium" style={styles.stepNumberText}>৪</Text>
                            </Surface>
                            <View style={styles.stepContent}>
                                <Text variant="titleMedium" style={styles.stepTitle}>
                                    সার্টিফিকেট সংগ্রহ
                                </Text>
                                <Text variant="bodyMedium" style={styles.stepDescription}>
                                    ৭-১৫ দিনের মধ্যে সঞ্চয়পত্র সার্টিফিকেট সংগ্রহ করুন
                                </Text>
                            </View>
                        </View>
                    </View>
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
                        * এটি একটি ডেমো অ্যাপ। প্রকৃত বিনিয়োগের জন্য নিকটস্থ ব্যাংক বা পোস্ট অফিসে যোগাযোগ করুন।
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
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginTop: spacing.md,
    },
    subtitle: {
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
        marginTop: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    keyMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: spacing.lg,
    },
    metricCard: {
        padding: spacing.md,
        borderRadius: theme.roundness,
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceVariant,
        minWidth: 80,
    },
    metricLabel: {
        color: theme.colors.onSurfaceVariant,
        marginTop: spacing.xs,
    },
    metricValue: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginTop: spacing.xs,
    },
    typesCard: {
        margin: spacing.md,
        marginTop: spacing.sm,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginBottom: spacing.md,
    },
    typeCard: {
        padding: spacing.md,
        marginBottom: spacing.md,
        borderRadius: theme.roundness,
        backgroundColor: theme.colors.surfaceVariant,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedTypeCard: {
        backgroundColor: theme.colors.primaryContainer,
        borderColor: theme.colors.primary,
    },
    typeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    typeInfo: {
        flex: 1,
    },
    typeName: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
    },
    typeNameEn: {
        color: theme.colors.onSurfaceVariant,
        fontStyle: 'italic',
        marginTop: spacing.xs,
    },
    typeMetrics: {
        alignItems: 'flex-end',
    },
    rateChip: {
        backgroundColor: theme.colors.primary,
        marginBottom: spacing.xs,
    },
    tenureText: {
        color: theme.colors.onSurfaceVariant,
    },
    typeFeatures: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.sm,
        gap: spacing.xs,
    },
    featureChip: {
        marginRight: spacing.xs,
        marginBottom: spacing.xs,
    },
    typeDetails: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.outline,
        paddingTop: spacing.sm,
    },
    investmentRange: {
        color: theme.colors.onSurfaceVariant,
        fontStyle: 'italic',
    },
    calculatorCard: {
        margin: spacing.md,
        marginTop: spacing.sm,
    },
    calculatorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    calculatorContent: {
        marginTop: spacing.md,
    },
    input: {
        marginBottom: spacing.md,
        backgroundColor: theme.colors.surface,
    },
    projectionCard: {
        padding: spacing.lg,
        borderRadius: theme.roundness,
        backgroundColor: theme.colors.primaryContainer,
        marginTop: spacing.md,
    },
    projectionTitle: {
        fontWeight: 'bold',
        color: theme.colors.onPrimaryContainer,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    projectionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    projectionItem: {
        alignItems: 'center',
    },
    projectionValue: {
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    projectionLabel: {
        color: theme.colors.onPrimaryContainer,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    featuresCard: {
        margin: spacing.md,
        marginTop: spacing.sm,
    },
    benefitsList: {
        gap: spacing.lg,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    benefitContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    benefitTitle: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginBottom: spacing.xs,
    },
    benefitDescription: {
        color: theme.colors.onSurfaceVariant,
        lineHeight: 20,
    },
    comparisonCard: {
        margin: spacing.md,
        marginTop: spacing.sm,
    },
    nameCell: {
        flex: 2,
    },
    rateText: {
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    howToCard: {
        margin: spacing.md,
        marginTop: spacing.sm,
    },
    stepsList: {
        gap: spacing.lg,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    stepNumberText: {
        color: theme.colors.onPrimary,
        fontWeight: 'bold',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginBottom: spacing.xs,
    },
    stepDescription: {
        color: theme.colors.onSurfaceVariant,
        lineHeight: 20,
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