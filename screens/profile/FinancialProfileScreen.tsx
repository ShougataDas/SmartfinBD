import React, { useState } from 'react';
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
    SegmentedButtons,
    Surface,
    ProgressBar,
    Chip,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { theme, spacing } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { FinancialProfileForm, EmploymentType, IncomeStability } from '@/types';
import { formatCurrency } from '@/utils/formatters';

const profileSchema = yup.object().shape({
    monthlyIncome: yup
        .number()
        .min(1000, 'মাসিক আয় কমপক্ষে ১০০০ টাকা হতে হবে')
        .max(10000000, 'মাসিক আয় ১ কোটি টাকার বেশি হতে পারে না')
        .required('মাসিক আয় আবশ্যক'),
    monthlyExpenses: yup
        .number()
        .min(500, 'মাসিক খরচ কমপক্ষে ৫০০ টাকা হতে হবে')
        .test('expenses-less-than-income', 'মাসিক খরচ আয়ের চেয়ে কম হতে হবে', function (value) {
            return value < this.parent.monthlyIncome;
        })
        .required('মাসিক খরচ আবশ্যক'),
    currentSavings: yup
        .number()
        .min(0, 'বর্তমান সঞ্চয় ০ বা তার বেশি হতে হবে')
        .required('বর্তমান সঞ্চয় আবশ্যক'),
    dependents: yup
        .number()
        .min(0, 'নির্ভরশীল সদস্য ০ বা তার বেশি হতে হবে')
        .max(20, 'নির্ভরশীল সদস্য ২০ জনের বেশি হতে পারে না')
        .required('নির্ভরশীল সদস্য সংখ্যা আবশ্যক'),
});

export const FinancialProfileScreen: React.FC = () => {
    const navigation = useNavigation();
    const { updateFinancialProfile, isLoading, user } = useUserStore();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isValid },
        trigger,
    } = useForm<FinancialProfileForm>({
        resolver: yupResolver(profileSchema),
        mode: 'onChange',
        defaultValues: {
            monthlyIncome: 0,
            monthlyExpenses: 0,
            currentSavings: 0,
            dependents: 0,
            employmentType: EmploymentType.PRIVATE,
            incomeStability: IncomeStability.STABLE,
        },
    });

    const watchedValues = watch();
    const monthlySavings = watchedValues.monthlyIncome - watchedValues.monthlyExpenses;

    const employmentOptions = [
        { value: EmploymentType.GOVERNMENT, label: 'সরকারি', icon: 'bank' },
        { value: EmploymentType.PRIVATE, label: 'বেসরকারি', icon: 'office-building' },
        { value: EmploymentType.BUSINESS, label: 'ব্যবসা', icon: 'store' },
        { value: EmploymentType.FREELANCE, label: 'ফ্রিল্যান্স', icon: 'laptop' },
        { value: EmploymentType.STUDENT, label: 'ছাত্র/ছাত্রী', icon: 'school' },
        { value: EmploymentType.RETIRED, label: 'অবসরপ্রাপ্ত', icon: 'account-clock' },
    ];

    const incomeStabilityOptions = [
        { value: IncomeStability.STABLE, label: 'স্থিতিশীল', description: 'নিয়মিত নির্দিষ্ট আয়' },
        { value: IncomeStability.VARIABLE, label: 'পরিবর্তনশীল', description: 'আয় মাসে মাসে পরিবর্তিত হয়' },
        { value: IncomeStability.IRREGULAR, label: 'অনিয়মিত', description: 'আয় অনিশ্চিত ও অনিয়মিত' },
    ];

    const onSubmit = async (data: FinancialProfileForm) => {
        try {
            await updateFinancialProfile(data);
            Alert.alert(
                'প্রোফাইল আপডেট সফল',
                'আপনার আর্থিক প্রোফাইল সফলভাবে আপডেট হয়েছে।',
                [
                    {
                        text: 'ঠিক আছে',
                        onPress: () => navigation.navigate('RiskAssessment' as never),
                    },
                ]
            );
        } catch (error) {
            Alert.alert(
                'আপডেট ব্যর্থ',
                'প্রোফাইল আপডেট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
                [{ text: 'ঠিক আছে' }]
            );
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
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const getFieldsForStep = (step: number): (keyof FinancialProfileForm)[] => {
        switch (step) {
            case 1:
                return ['monthlyIncome'];
            case 2:
                return ['monthlyExpenses'];
            case 3:
                return ['currentSavings', 'dependents'];
            case 4:
                return ['employmentType', 'incomeStability'];
            default:
                return [];
        }
    };

    const renderStep1 = () => (
        <Card style={styles.stepCard}>
            <Card.Content>
                <View style={styles.stepHeader}>
                    <Icon name="currency-bdt" size={40} color={theme.colors.primary} />
                    <Text variant="headlineSmall" style={styles.stepTitle}>
                        মাসিক আয়
                    </Text>
                    <Text variant="bodyMedium" style={styles.stepDescription}>
                        আপনার মাসিক মোট আয় কত? (সব উৎস থেকে)
                    </Text>
                </View>

                <Controller
                    control={control}
                    name="monthlyIncome"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="মাসিক আয় (টাকা)"
                            value={value ? value.toString() : ''}
                            onChangeText={(text) => onChange(parseInt(text) || 0)}
                            onBlur={onBlur}
                            error={!!errors.monthlyIncome}
                            keyboardType="numeric"
                            left={<TextInput.Icon icon="currency-bdt" />}
                            style={styles.input}
                        />
                    )}
                />
                {errors.monthlyIncome && (
                    <Text variant="bodySmall" style={styles.errorText}>
                        {errors.monthlyIncome.message}
                    </Text>
                )}

                {watchedValues.monthlyIncome > 0 && (
                    <Surface style={styles.infoCard}>
                        <Text variant="bodyMedium" style={styles.infoText}>
                            💡 আপনার মাসিক আয়: {formatCurrency(watchedValues.monthlyIncome)}
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
                    <Icon name="cart" size={40} color={theme.colors.secondary} />
                    <Text variant="headlineSmall" style={styles.stepTitle}>
                        মাসিক খরচ
                    </Text>
                    <Text variant="bodyMedium" style={styles.stepDescription}>
                        আপনার মাসিক মোট খরচ কত? (সব ধরনের খরচ)
                    </Text>
                </View>

                <Controller
                    control={control}
                    name="monthlyExpenses"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="মাসিক খরচ (টাকা)"
                            value={value ? value.toString() : ''}
                            onChangeText={(text) => onChange(parseInt(text) || 0)}
                            onBlur={onBlur}
                            error={!!errors.monthlyExpenses}
                            keyboardType="numeric"
                            left={<TextInput.Icon icon="cart" />}
                            style={styles.input}
                        />
                    )}
                />
                {errors.monthlyExpenses && (
                    <Text variant="bodySmall" style={styles.errorText}>
                        {errors.monthlyExpenses.message}
                    </Text>
                )}

                {watchedValues.monthlyExpenses > 0 && monthlySavings >= 0 && (
                    <Surface style={styles.infoCard}>
                        <Text variant="bodyMedium" style={styles.infoText}>
                            💰 মাসিক সঞ্চয় সম্ভাবনা: {formatCurrency(monthlySavings)}
                        </Text>
                        <Text variant="bodySmall" style={styles.infoSubtext}>
                            (আয় - খরচ = সঞ্চয়)
                        </Text>
                    </Surface>
                )}
            </Card.Content>
        </Card>
    );

    const renderStep3 = () => (
        <Card style={styles.stepCard}>
            <Card.Content>
                <View style={styles.stepHeader}>
                    <Icon name="piggy-bank" size={40} color={theme.colors.tertiary} />
                    <Text variant="headlineSmall" style={styles.stepTitle}>
                        সঞ্চয় ও পরিবার
                    </Text>
                    <Text variant="bodyMedium" style={styles.stepDescription}>
                        আপনার বর্তমান সঞ্চয় ও পারিবারিক তথ্য
                    </Text>
                </View>

                <Controller
                    control={control}
                    name="currentSavings"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="বর্তমান সঞ্চয় (টাকা)"
                            value={value ? value.toString() : ''}
                            onChangeText={(text) => onChange(parseInt(text) || 0)}
                            onBlur={onBlur}
                            error={!!errors.currentSavings}
                            keyboardType="numeric"
                            left={<TextInput.Icon icon="piggy-bank" />}
                            style={styles.input}
                        />
                    )}
                />
                {errors.currentSavings && (
                    <Text variant="bodySmall" style={styles.errorText}>
                        {errors.currentSavings.message}
                    </Text>
                )}

                <Controller
                    control={control}
                    name="dependents"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="নির্ভরশীল সদস্য সংখ্যা"
                            value={value ? value.toString() : ''}
                            onChangeText={(text) => onChange(parseInt(text) || 0)}
                            onBlur={onBlur}
                            error={!!errors.dependents}
                            keyboardType="numeric"
                            left={<TextInput.Icon icon="account-group" />}
                            style={styles.input}
                            helperText="যারা আপনার আয়ের উপর নির্ভরশীল"
                        />
                    )}
                />
                {errors.dependents && (
                    <Text variant="bodySmall" style={styles.errorText}>
                        {errors.dependents.message}
                    </Text>
                )}
            </Card.Content>
        </Card>
    );

    const renderStep4 = () => (
        <Card style={styles.stepCard}>
            <Card.Content>
                <View style={styles.stepHeader}>
                    <Icon name="briefcase" size={40} color={theme.colors.primary} />
                    <Text variant="headlineSmall" style={styles.stepTitle}>
                        কর্মসংস্থান তথ্য
                    </Text>
                    <Text variant="bodyMedium" style={styles.stepDescription}>
                        আপনার কাজের ধরন ও আয়ের স্থিতিশীলতা
                    </Text>
                </View>

                <Text variant="titleMedium" style={styles.sectionTitle}>
                    কর্মসংস্থানের ধরন
                </Text>
                <View style={styles.optionsGrid}>
                    {employmentOptions.map((option) => (
                        <Controller
                            key={option.value}
                            control={control}
                            name="employmentType"
                            render={({ field: { onChange, value } }) => (
                                <Chip
                                    selected={value === option.value}
                                    onPress={() => onChange(option.value)}
                                    style={styles.optionChip}
                                    icon={option.icon}>
                                    {option.label}
                                </Chip>
                            )}
                        />
                    ))}
                </View>

                <Text variant="titleMedium" style={styles.sectionTitle}>
                    আয়ের স্থিতিশীলতা
                </Text>
                {incomeStabilityOptions.map((option) => (
                    <Controller
                        key={option.value}
                        control={control}
                        name="incomeStability"
                        render={({ field: { onChange, value } }) => (
                            <Surface
                                style={[
                                    styles.stabilityOption,
                                    value === option.value && styles.selectedOption,
                                ]}
                                onTouchEnd={() => onChange(option.value)}>
                                <View style={styles.stabilityContent}>
                                    <Text variant="titleMedium" style={styles.stabilityTitle}>
                                        {option.label}
                                    </Text>
                                    <Text variant="bodySmall" style={styles.stabilityDescription}>
                                        {option.description}
                                    </Text>
                                </View>
                                {value === option.value && (
                                    <Icon name="check-circle" size={24} color={theme.colors.primary} />
                                )}
                            </Surface>
                        )}
                    />
                ))}
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
            case 4:
                return renderStep4();
            default:
                return renderStep1();
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>

                {/* Progress Header */}
                <Surface style={styles.progressHeader} elevation={2}>
                    <Text variant="titleLarge" style={styles.progressTitle}>
                        আর্থিক প্রোফাইল
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

                {/* Navigation Buttons */}
                <View style={styles.navigationContainer}>
                    {currentStep > 1 && (
                        <Button
                            mode="outlined"
                            onPress={handlePrevious}
                            style={styles.previousButton}
                            icon="arrow-left">
                            পূর্ববর্তী
                        </Button>
                    )}

                    <Button
                        mode="contained"
                        onPress={handleNext}
                        loading={isLoading}
                        disabled={isLoading}
                        style={styles.nextButton}
                        icon={currentStep === totalSteps ? "check" : "arrow-right"}>
                        {currentStep === totalSteps ? 'সম্পূর্ণ করুন' : 'পরবর্তী'}
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.md,
    },
    progressHeader: {
        padding: spacing.lg,
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
    },
    stepDescription: {
        textAlign: 'center',
        color: theme.colors.onSurfaceVariant,
        paddingHorizontal: spacing.md,
    },
    input: {
        marginBottom: spacing.sm,
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
    sectionTitle: {
        marginTop: spacing.lg,
        marginBottom: spacing.md,
        fontWeight: 'bold',
        color: theme.colors.onSurface,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.lg,
    },
    optionChip: {
        margin: spacing.xs,
    },
    stabilityOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: theme.roundness,
        backgroundColor: theme.colors.surfaceVariant,
    },
    selectedOption: {
        backgroundColor: theme.colors.primaryContainer,
    },
    stabilityContent: {
        flex: 1,
    },
    stabilityTitle: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
    },
    stabilityDescription: {
        color: theme.colors.onSurfaceVariant,
        marginTop: spacing.xs,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.lg,
    },
    previousButton: {
        flex: 1,
        marginRight: spacing.sm,
    },
    nextButton: {
        flex: 1,
        marginLeft: spacing.sm,
    },
});

