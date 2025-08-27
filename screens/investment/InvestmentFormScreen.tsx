import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import {
    TextInput,
    Button,
    Text,
    Card,
    Surface,
    Chip,
    Switch,
    List,
    Divider,
    ProgressBar,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

import { theme, spacing } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { InvestmentRecommendationService } from '@/services/investmentRecommendation';
import { formatCurrency } from '@/utils/formatters';
import { InvestmentType, InvestmentStatus, RiskLevel } from '@/types';

type RouteParams = {
    InvestmentForm: {
        investmentType: InvestmentType;
        investmentName: string;
    };
};

interface InvestmentFormData {
    amount: number;
    monthlyContribution?: number;
    tenure: number;
    autoReinvest: boolean;
    maturityReminder: boolean;
    performanceAlerts: boolean;
    notes?: string;
}

const investmentSchema = yup.object().shape({
    amount: yup
        .number()
        .min(1000, 'ন্যূনতম বিনিয়োগ ১০০০ টাকা হতে হবে')
        .max(10000000, 'সর্বোচ্চ বিনিয়োগ ১ কোটি টাকা')
        .required('বিনিয়োগের পরিমাণ আবশ্যক'),
    monthlyContribution: yup
        .number()
        .min(0, 'মাসিক অবদান ০ বা তার বেশি হতে হবে')
        .optional(),
    tenure: yup
        .number()
        .min(1, 'ন্যূনতম মেয়াদ ১ বছর')
        .max(30, 'সর্বোচ্চ মেয়াদ ৩০ বছর')
        .required('বিনিয়োগের মেয়াদ আবশ্যক'),
    autoReinvest: yup.boolean().default(false),
    maturityReminder: yup.boolean().default(true),
    performanceAlerts: yup.boolean().default(true),
    notes: yup.string().optional(),
});

export const InvestmentFormScreen: React.FC = () => {
    const route = useRoute<RouteProp<RouteParams, 'InvestmentForm'>>();
    const navigation = useNavigation();
    const { user, financialProfile, addInvestment } = useUserStore();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [projection, setProjection] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { investmentType, investmentName } = route.params;
    const investmentDetails = InvestmentRecommendationService.getInvestmentDetails(investmentType);
    
    const totalSteps = 3;

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid },
        trigger,
    } = useForm<InvestmentFormData>({
        resolver: yupResolver(investmentSchema),
        mode: 'onChange',
        defaultValues: {
            amount: investmentDetails?.minInvestment || 1000,
            monthlyContribution: 0,
            tenure: 5,
            autoReinvest: false,
            maturityReminder: true,
            performanceAlerts: true,
            notes: '',
        },
    });

    const watchedValues = watch();

    useEffect(() => {
        if (investmentDetails && financialProfile) {
            // Set suggested amount based on user's capacity
            const availableAmount = financialProfile.monthlyIncome - financialProfile.monthlyExpenses;
            const suggestedAmount = Math.max(
                Math.min(availableAmount * 0.2, 50000),
                investmentDetails.minInvestment
            );
            setValue('amount', suggestedAmount);
            setValue('monthlyContribution', Math.floor(availableAmount * 0.1));
        }
    }, [investmentDetails, financialProfile, setValue]);

    useEffect(() => {
        if (watchedValues.amount > 0 && investmentDetails) {
            calculateProjection();
        }
    }, [watchedValues.amount, watchedValues.monthlyContribution, watchedValues.tenure]);

    const calculateProjection = () => {
        if (!investmentDetails) return;

        const projection = InvestmentRecommendationService.calculateProjection(
            watchedValues.amount,
            investmentDetails.expectedReturn,
            watchedValues.tenure,
            watchedValues.monthlyContribution || 0
        );
        setProjection(projection);
    };

    const onSubmit = async (data: InvestmentFormData) => {
        if (!investmentDetails || !user) {
            Alert.alert('ত্রুটি', 'ব্যবহারকারীর তথ্য পাওয়া যায়নি।');
            return;
        }

        setIsSubmitting(true);

        try {
            // Calculate maturity date
            const maturityDate = new Date();
            maturityDate.setFullYear(maturityDate.getFullYear() + data.tenure);

            const newInvestment = {
                id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: user.id,
                name: investmentName,
                type: investmentType,
                amount: data.amount,
                currentValue: data.amount,
                expectedReturn: investmentDetails.expectedReturn,
                startDate: new Date(),
                maturityDate,
                status: InvestmentStatus.Active,
                details: {
                    institution: investmentDetails.provider,
                    interestRate: investmentDetails.expectedReturn,
                    monthlyContribution: data.monthlyContribution,
                    autoReinvest: data.autoReinvest,
                },
                performance: {
                    monthlyReturns: [],
                    lastUpdated: new Date(),
                },
                notifications: {
                    maturityReminder: data.maturityReminder,
                    performanceAlerts: data.performanceAlerts,
                },
                notes: data.notes,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            addInvestment(newInvestment);

            Alert.alert(
                'বিনিয়োগ সফল! 🎉',
                `আপনার ${formatCurrency(data.amount)} টাকার ${investmentName} বিনিয়োগ সফলভাবে সম্পন্ন হয়েছে।\n\nপ্রত্যাশিত মেয়াদান্তে প্রাপ্ত অর্থ: ${formatCurrency(projection?.futureValue || 0)}`,
                [
                    {
                        text: 'পোর্টফোলিও দেখুন',
                        onPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Main' as never }],
                            });
                            // Navigate to Dashboard tab
                            setTimeout(() => {
                                navigation.navigate('Dashboard' as never);
                            }, 100);
                        },
                    },
                    {
                        text: 'ঠিক আছে',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            console.error('Investment submission error:', error);
            Alert.alert(
                'বিনিয়োগ ব্যর্থ',
                'বিনিয়োগ প্রক্রিয়ায় সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
                [{ text: 'ঠিক আছে' }]
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = async () => {
        const fieldsToValidate = getFieldsForStep(currentStep);
        const isStepValid = await trigger(fieldsToValidate);
        
        if (isStepValid) {
            if (currentStep < totalSteps) {
                setCurrentStep(currentStep + 1);
            } else {
                handleSubmit(onSubmit)();
            }
        } else {
            Alert.alert(
                'ফর্ম সম্পূর্ণ করুন',
                'অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন।',
                [{ text: 'ঠিক আছে' }]
            );
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigation.goBack();
        }
    };

    const getFieldsForStep = (step: number): (keyof InvestmentFormData)[] => {
        switch (step) {
            case 1:
                return ['amount'];
            case 2:
                return ['tenure'];
            case 3:
                return [];
            default:
                return [];
        }
    };

    if (!investmentDetails) {
        return (
            <View style={styles.container}>
                <Card style={styles.errorCard}>
                    <Card.Content>
                        <Text variant="headlineSmall" style={styles.errorTitle}>
                            তথ্য পাওয়া যায়নি
                        </Text>
                        <Text variant="bodyMedium" style={styles.errorText}>
                            বিনিয়োগের বিস্তারিত তথ্য লোড করতে সমস্যা হয়েছে।
                        </Text>
                        <Button
                            mode="contained"
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            ফিরে যান
                        </Button>
                    </Card.Content>
                </Card>
            </View>
        );
    }

    const renderStep1 = () => (
        <Card style={styles.stepCard}>
            <Card.Content>
                <View style={styles.stepHeader}>
                    <Icon name="currency-bdt" size={40} color={theme.colors.primary} />
                    <Text variant="headlineSmall" style={styles.stepTitle}>
                        বিনিয়োগের পরিমাণ
                    </Text>
                    <Text variant="bodyMedium" style={styles.stepDescription}>
                        আপনি কত টাকা {investmentName} এ বিনিয়োগ করতে চান?
                    </Text>
                </View>

                <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="বিনিয়োগের পরিমাণ (টাকা)"
                            value={value ? value.toString() : ''}
                            onChangeText={(text) => onChange(parseInt(text) || 0)}
                            onBlur={onBlur}
                            error={!!errors.amount}
                            keyboardType="numeric"
                            left={<TextInput.Icon icon="currency-bdt" />}
                            style={styles.input}
                        />
                    )}
                />
                {errors.amount && (
                    <Text variant="bodySmall" style={styles.errorText}>
                        {errors.amount.message}
                    </Text>
                )}

                <Surface style={styles.infoCard}>
                    <Text variant="bodyMedium" style={styles.infoText}>
                        💡 ন্যূনতম বিনিয়োগ: {formatCurrency(investmentDetails.minInvestment)}
                    </Text>
                    <Text variant="bodySmall" style={styles.infoSubtext}>
                        প্রত্যাশিত বার্ষিক রিটার্ন: {investmentDetails.expectedReturn}%
                    </Text>
                </Surface>

                {financialProfile && (
                    <Surface style={styles.suggestionCard}>
                        <Text variant="titleMedium" style={styles.suggestionTitle}>
                            💰 আপনার জন্য সুপারিশ
                        </Text>
                        <Text variant="bodyMedium" style={styles.suggestionText}>
                            মাসিক সঞ্চয় ক্ষমতা: {formatCurrency(financialProfile.monthlyIncome - financialProfile.monthlyExpenses)}
                        </Text>
                        <Text variant="bodySmall" style={styles.suggestionSubtext}>
                            সুপারিশকৃত বিনিয়োগ: {formatCurrency(Math.min((financialProfile.monthlyIncome - financialProfile.monthlyExpenses) * 0.3, 50000))}
                        </Text>
                    </Surface>
                )}
            </Card.Content>
        </Card>
    );

    const renderStep2 = () => (
        <Card style={styles.stepCard}>
            <Card.Content>
                <View style={styles.stepHeader}>
                    <Icon name="calendar-clock" size={40} color={theme.colors.secondary} />
                    <Text variant="headlineSmall" style={styles.stepTitle}>
                        বিনিয়োগের মেয়াদ
                    </Text>
                    <Text variant="bodyMedium" style={styles.stepDescription}>
                        কত বছরের জন্য বিনিয়োগ করতে চান?
                    </Text>
                </View>

                <Controller
                    control={control}
                    name="tenure"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="বিনিয়োগের মেয়াদ (বছর)"
                            value={value ? value.toString() : ''}
                            onChangeText={(text) => onChange(parseInt(text) || 0)}
                            onBlur={onBlur}
                            error={!!errors.tenure}
                            keyboardType="numeric"
                            left={<TextInput.Icon icon="calendar-clock" />}
                            style={styles.input}
                        />
                    )}
                />
                {errors.tenure && (
                    <Text variant="bodySmall" style={styles.errorText}>
                        {errors.tenure.message}
                    </Text>
                )}

                <Controller
                    control={control}
                    name="monthlyContribution"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="মাসিক অতিরিক্ত বিনিয়োগ (ঐচ্ছিক)"
                            value={value ? value.toString() : ''}
                            onChangeText={(text) => onChange(parseInt(text) || 0)}
                            onBlur={onBlur}
                            keyboardType="numeric"
                            left={<TextInput.Icon icon="calendar-month" />}
                            style={styles.input}
                        />
                    )}
                />

                {projection && (
                    <Surface style={styles.projectionCard}>
                        <Text variant="titleMedium" style={styles.projectionTitle}>
                            📊 বিনিয়োগ প্রজেকশন
                        </Text>
                        
                        <View style={styles.projectionGrid}>
                            <View style={styles.projectionItem}>
                                <Text variant="headlineSmall" style={styles.projectionValue}>
                                    {formatCurrency(projection.futureValue)}
                                </Text>
                                <Text variant="bodySmall" style={styles.projectionLabel}>
                                    মেয়াদান্তে প্রাপ্ত অর্থ
                                </Text>
                            </View>

                            <View style={styles.projectionItem}>
                                <Text variant="headlineSmall" style={[styles.projectionValue, { color: '#4CAF50' }]}>
                                    {formatCurrency(projection.totalReturn)}
                                </Text>
                                <Text variant="bodySmall" style={styles.projectionLabel}>
                                    মোট লাভ
                                </Text>
                            </View>
                        </View>

                        <Divider style={styles.divider} />

                        <View style={styles.projectionDetails}>
                            <Text variant="bodyMedium" style={styles.projectionDetailText}>
                                • মোট বিনিয়োগ: {formatCurrency(projection.totalInvestment)}
                            </Text>
                            <Text variant="bodyMedium" style={styles.projectionDetailText}>
                                • বার্ষিক রিটার্ন: {investmentDetails.expectedReturn}%
                            </Text>
                            <Text variant="bodyMedium" style={styles.projectionDetailText}>
                                • বিনিয়োগের মেয়াদ: {watchedValues.tenure} বছর
                            </Text>
                        </View>
                    </Surface>
                )}
            </Card.Content>
        </Card>
    );

    const renderStep3 = () => (
        <Card style={styles.stepCard}>
            <Card.Content>
                <View style={styles.stepHeader}>
                    <Icon name="cog" size={40} color={theme.colors.tertiary} />
                    <Text variant="headlineSmall" style={styles.stepTitle}>
                        অতিরিক্ত সেটিংস
                    </Text>
                    <Text variant="bodyMedium" style={styles.stepDescription}>
                        আপনার বিনিয়োগের জন্য অতিরিক্ত সেটিংস কনফিগার করুন
                    </Text>
                </View>

                <View style={styles.settingsContainer}>
                    <Controller
                        control={control}
                        name="autoReinvest"
                        render={({ field: { onChange, value } }) => (
                            <List.Item
                                title="স্বয়ংক্রিয় পুনঃবিনিয়োগ"
                                description="মেয়াদান্তে স্বয়ংক্রিয়ভাবে পুনরায় বিনিয়োগ করুন"
                                left={(props) => <List.Icon {...props} icon="autorenew" />}
                                right={() => (
                                    <Switch
                                        value={value}
                                        onValueChange={onChange}
                                    />
                                )}
                            />
                        )}
                    />

                    <Divider />

                    <Controller
                        control={control}
                        name="maturityReminder"
                        render={({ field: { onChange, value } }) => (
                            <List.Item
                                title="মেয়াদান্তের রিমাইন্ডার"
                                description="মেয়াদ শেষ হওয়ার আগে নোটিফিকেশন পান"
                                left={(props) => <List.Icon {...props} icon="bell-ring" />}
                                right={() => (
                                    <Switch
                                        value={value}
                                        onValueChange={onChange}
                                    />
                                )}
                            />
                        )}
                    />

                    <Divider />

                    <Controller
                        control={control}
                        name="performanceAlerts"
                        render={({ field: { onChange, value } }) => (
                            <List.Item
                                title="পারফরম্যান্স অ্যালার্ট"
                                description="বিনিয়োগের পারফরম্যান্স আপডেট পান"
                                left={(props) => <List.Icon {...props} icon="chart-line" />}
                                right={() => (
                                    <Switch
                                        value={value}
                                        onValueChange={onChange}
                                    />
                                )}
                            />
                        )}
                    />
                </View>

                <Controller
                    control={control}
                    name="notes"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="অতিরিক্ত নোট (ঐচ্ছিক)"
                            value={value || ''}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            multiline
                            numberOfLines={3}
                            placeholder="এই বিনিয়োগ সম্পর্কে কোনো বিশেষ নোট..."
                            left={<TextInput.Icon icon="note-text" />}
                            style={styles.notesInput}
                        />
                    )}
                />
            </Card.Content>
        </Card>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderStep1();
            case 2:
                return renderStep2();
            case 3:
                return renderStep3();
            default:
                return renderStep1();
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            
            {/* Header */}
            <Surface style={styles.header} elevation={2}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Icon name="plus-circle" size={32} color={theme.colors.primary} />
                        <View style={styles.headerText}>
                            <Text variant="titleLarge" style={styles.headerTitle}>
                                {investmentName}
                            </Text>
                            <Text variant="bodyMedium" style={styles.headerSubtitle}>
                                নতুন বিনিয়োগ
                            </Text>
                        </View>
                    </View>
                    
                    <Chip style={styles.riskChip}>
                        {investmentDetails.riskLevel === RiskLevel.Low ? 'কম ঝুঁকি' : 
                         investmentDetails.riskLevel === RiskLevel.Medium ? 'মাঝারি ঝুঁকি' : 'উচ্চ ঝুঁকি'}
                    </Chip>
                </View>
            </Surface>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>

                {/* Progress Header */}
                <Surface style={styles.progressHeader} elevation={1}>
                    <Text variant="titleMedium" style={styles.progressTitle}>
                        বিনিয়োগ প্রক্রিয়া
                    </Text>
                    <Text variant="bodyMedium" style={styles.progressSubtitle}>
                        ধাপ {currentStep} / {totalSteps}
                    </Text>
                    <ProgressBar
                        progress={currentStep / totalSteps}
                        color={theme.colors.primary}
                        style={styles.progressBar}
                    />
                </Surface>

                {/* Current Step */}
                {renderCurrentStep()}

                {/* Investment Summary */}
                {currentStep === totalSteps && projection && (
                    <Card style={styles.summaryCard}>
                        <Card.Content>
                            <Text variant="titleLarge" style={styles.summaryTitle}>
                                📋 বিনিয়োগ সারসংক্ষেপ
                            </Text>

                            <View style={styles.summaryGrid}>
                                <View style={styles.summaryItem}>
                                    <Text variant="bodySmall" style={styles.summaryLabel}>বিনিয়োগের ধরন</Text>
                                    <Text variant="titleMedium" style={styles.summaryValue}>{investmentName}</Text>
                                </View>

                                <View style={styles.summaryItem}>
                                    <Text variant="bodySmall" style={styles.summaryLabel}>প্রাথমিক বিনিয়োগ</Text>
                                    <Text variant="titleMedium" style={styles.summaryValue}>
                                        {formatCurrency(watchedValues.amount)}
                                    </Text>
                                </View>

                                <View style={styles.summaryItem}>
                                    <Text variant="bodySmall" style={styles.summaryLabel}>মেয়াদ</Text>
                                    <Text variant="titleMedium" style={styles.summaryValue}>
                                        {watchedValues.tenure} বছর
                                    </Text>
                                </View>

                                <View style={styles.summaryItem}>
                                    <Text variant="bodySmall" style={styles.summaryLabel}>মেয়াদান্তে প্রাপ্ত</Text>
                                    <Text variant="titleMedium" style={[styles.summaryValue, { color: '#4CAF50' }]}>
                                        {formatCurrency(projection.futureValue)}
                                    </Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                )}
            </ScrollView>

            {/* Navigation Buttons */}
            <Surface style={styles.navigationContainer} elevation={3}>
                <View style={styles.navigationButtons}>
                    <Button
                        mode="outlined"
                        onPress={handlePrevious}
                        style={styles.previousButton}
                        icon={currentStep === 1 ? "arrow-left" : "arrow-left"}>
                        {currentStep === 1 ? 'বাতিল' : 'পূর্ববর্তী'}
                    </Button>

                    <Button
                        mode="contained"
                        onPress={handleNext}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        style={styles.nextButton}
                        icon={currentStep === totalSteps ? "check" : "arrow-right"}>
                        {currentStep === totalSteps ? 'বিনিয়োগ নিশ্চিত করুন' : 'পরবর্তী'}
                    </Button>
                </View>
            </Surface>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: theme.colors.surface,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerText: {
        marginLeft: spacing.sm,
        flex: 1,
    },
    headerTitle: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
    },
    headerSubtitle: {
        color: theme.colors.onSurfaceVariant,
    },
    riskChip: {
        backgroundColor: theme.colors.primaryContainer,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.md,
    },
    progressHeader: {
        padding: spacing.md,
        marginBottom: spacing.lg,
        borderRadius: theme.roundness,
        backgroundColor: theme.colors.surface,
    },
    progressTitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: theme.colors.onSurface,
    },
    progressSubtitle: {
        textAlign: 'center',
        color: theme.colors.onSurfaceVariant,
        marginTop: spacing.xs,
        marginBottom: spacing.md,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
    },
    stepCard: {
        marginBottom: spacing.lg,
    },
    stepHeader: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    stepTitle: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    stepDescription: {
        textAlign: 'center',
        color: theme.colors.onSurfaceVariant,
        paddingHorizontal: spacing.md,
    },
    input: {
        marginBottom: spacing.md,
        backgroundColor: theme.colors.surface,
    },
    notesInput: {
        marginTop: spacing.md,
        backgroundColor: theme.colors.surface,
    },
    errorText: {
        color: theme.colors.error,
        marginBottom: spacing.sm,
        marginLeft: spacing.sm,
    },
    infoCard: {
        padding: spacing.md,
        marginTop: spacing.md,
        borderRadius: theme.roundness,
        backgroundColor: theme.colors.primaryContainer,
    },
    infoText: {
        color: theme.colors.onPrimaryContainer,
        fontWeight: 'bold',
    },
    infoSubtext: {
        color: theme.colors.onPrimaryContainer,
        opacity: 0.8,
        marginTop: spacing.xs,
    },
    suggestionCard: {
        padding: spacing.md,
        marginTop: spacing.md,
        borderRadius: theme.roundness,
        backgroundColor: theme.colors.tertiaryContainer,
    },
    suggestionTitle: {
        color: theme.colors.onTertiaryContainer,
        fontWeight: 'bold',
        marginBottom: spacing.sm,
    },
    suggestionText: {
        color: theme.colors.onTertiaryContainer,
    },
    suggestionSubtext: {
        color: theme.colors.onTertiaryContainer,
        opacity: 0.8,
        marginTop: spacing.xs,
    },
    projectionCard: {
        padding: spacing.lg,
        marginTop: spacing.lg,
        borderRadius: theme.roundness,
        backgroundColor: theme.colors.secondaryContainer,
    },
    projectionTitle: {
        fontWeight: 'bold',
        color: theme.colors.onSecondaryContainer,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    projectionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.md,
    },
    projectionItem: {
        alignItems: 'center',
    },
    projectionValue: {
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    projectionLabel: {
        color: theme.colors.onSecondaryContainer,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    projectionDetails: {
        marginTop: spacing.md,
    },
    projectionDetailText: {
        color: theme.colors.onSecondaryContainer,
        marginBottom: spacing.xs,
    },
    divider: {
        marginVertical: spacing.md,
    },
    settingsContainer: {
        marginBottom: spacing.lg,
    },
    summaryCard: {
        backgroundColor: theme.colors.primaryContainer,
    },
    summaryTitle: {
        fontWeight: 'bold',
        color: theme.colors.onPrimaryContainer,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    summaryItem: {
        width: '48%',
        marginBottom: spacing.md,
        alignItems: 'center',
    },
    summaryLabel: {
        color: theme.colors.onPrimaryContainer,
        opacity: 0.8,
    },
    summaryValue: {
        color: theme.colors.onPrimaryContainer,
        fontWeight: 'bold',
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    navigationContainer: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    previousButton: {
        flex: 1,
        marginRight: spacing.sm,
    },
    nextButton: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    errorCard: {
        margin: spacing.lg,
    },
    errorTitle: {
        fontWeight: 'bold',
        color: theme.colors.error,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    errorText: {
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    backButton: {
        marginTop: spacing.md,
    },
});