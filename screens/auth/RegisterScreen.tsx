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
    Surface,
    Checkbox,
    ProgressBar,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { theme, spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { RegisterForm } from '@/types';

const registerSchema = yup.object().shape({
    name: yup
        .string()
        .min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে')
        .required('নাম আবশ্যক'),
    email: yup
        .string()
        .email('সঠিক ইমেইল ঠিকানা দিন')
        .required('ইমেইল আবশ্যক'),
    phone: yup
        .string()
        .matches(/^(\+88)?01[3-9]\d{8}$/, 'সঠিক মোবাইল নম্বর দিন')
        .required('মোবাইল নম্বর আবশ্যক'),
    password: yup
        .string()
        .min(8, 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে')
        .matches(/(?=.*[a-z])/, 'পাসওয়ার্ডে ছোট হাতের অক্ষর থাকতে হবে')
        .matches(/(?=.*[A-Z])/, 'পাসওয়ার্ডে বড় হাতের অক্ষর থাকতে হবে')
        .matches(/(?=.*\d)/, 'পাসওয়ার্ডে সংখ্যা থাকতে হবে')
        .required('পাসওয়ার্ড আবশ্যক'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'পাসওয়ার্ড মিলছে না')
        .required('পাসওয়ার্ড নিশ্চিত করুন'),
});

export const RegisterScreen: React.FC = () => {
    const navigation = useNavigation();
    const { register, isLoading, error } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isValid },
    } = useForm<RegisterForm>({
        resolver: yupResolver(registerSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        },
    });

    const password = watch('password');

    const getPasswordStrength = (password: string): number => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/(?=.*[a-z])/.test(password)) strength += 25;
        if (/(?=.*[A-Z])/.test(password)) strength += 25;
        if (/(?=.*\d)/.test(password)) strength += 25;
        return strength / 100;
    };

    const getPasswordStrengthText = (strength: number): string => {
        if (strength < 0.25) return 'দুর্বল';
        if (strength < 0.5) return 'মাঝারি';
        if (strength < 0.75) return 'ভালো';
        return 'শক্তিশালী';
    };

    const getPasswordStrengthColor = (strength: number): string => {
        if (strength < 0.25) return theme.colors.error;
        if (strength < 0.5) return '#FF9800';
        if (strength < 0.75) return '#2196F3';
        return '#4CAF50';
    };

    const onSubmit = async (data: RegisterForm) => {
        if (!acceptTerms || !acceptPrivacy) {
            Alert.alert(
                'শর্তাবলী গ্রহণ করুন',
                'রেজিস্ট্রেশন সম্পূর্ণ করতে শর্তাবলী ও গোপনীয়তা নীতি গ্রহণ করুন।',
                [{ text: 'ঠিক আছে' }]
            );
            return;
        }

        try {
            await register(data);
            Alert.alert(
                'রেজিস্ট্রেশন সফল',
                'আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।',
                [{ text: 'ঠিক আছে' }]
            );
        } catch (error) {
            Alert.alert(
                'রেজিস্ট্রেশন ব্যর্থ',
                'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
                [{ text: 'ঠিক আছে' }]
            );
        }
    };

    const passwordStrength = getPasswordStrength(password || '');

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>

                {/* Header */}
                <Surface style={styles.header} elevation={0}>
                    <Icon
                        name="account-plus"
                        size={50}
                        color={theme.colors.primary}
                        style={styles.logo}
                    />
                    <Text variant="headlineMedium" style={styles.title}>
                        নতুন অ্যাকাউন্ট
                    </Text>
                    <Text variant="bodyLarge" style={styles.subtitle}>
                        SmartFin BD তে যোগ দিন
                    </Text>
                </Surface>

                {/* Registration Form */}
                <Card style={styles.formCard}>
                    <Card.Content style={styles.formContent}>

                        {/* Name Input */}
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="পূর্ণ নাম"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={!!errors.name}
                                    autoCapitalize="words"
                                    autoComplete="name"
                                    left={<TextInput.Icon icon="account" />}
                                    style={styles.input}
                                />
                            )}
                        />
                        {errors.name && (
                            <Text variant="bodySmall" style={styles.errorText}>
                                {errors.name.message}
                            </Text>
                        )}

                        {/* Email Input */}
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="ইমেইল ঠিকানা"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={!!errors.email}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    left={<TextInput.Icon icon="email" />}
                                    style={styles.input}
                                />
                            )}
                        />
                        {errors.email && (
                            <Text variant="bodySmall" style={styles.errorText}>
                                {errors.email.message}
                            </Text>
                        )}

                        {/* Phone Input */}
                        <Controller
                            control={control}
                            name="phone"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="মোবাইল নম্বর"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={!!errors.phone}
                                    keyboardType="phone-pad"
                                    autoComplete="tel"
                                    placeholder="+880 1XXX-XXXXXX"
                                    left={<TextInput.Icon icon="phone" />}
                                    style={styles.input}
                                />
                            )}
                        />
                        {errors.phone && (
                            <Text variant="bodySmall" style={styles.errorText}>
                                {errors.phone.message}
                            </Text>
                        )}

                        {/* Password Input */}
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="পাসওয়ার্ড"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={!!errors.password}
                                    secureTextEntry={!showPassword}
                                    autoComplete="new-password"
                                    left={<TextInput.Icon icon="lock" />}
                                    right={
                                        <TextInput.Icon
                                            icon={showPassword ? 'eye-off' : 'eye'}
                                            onPress={() => setShowPassword(!showPassword)}
                                        />
                                    }
                                    style={styles.input}
                                />
                            )}
                        />
                        {errors.password && (
                            <Text variant="bodySmall" style={styles.errorText}>
                                {errors.password.message}
                            </Text>
                        )}

                        {/* Password Strength Indicator */}
                        {password && (
                            <View style={styles.passwordStrength}>
                                <View style={styles.strengthHeader}>
                                    <Text variant="bodySmall" style={styles.strengthLabel}>
                                        পাসওয়ার্ডের শক্তি:
                                    </Text>
                                    <Text
                                        variant="bodySmall"
                                        style={[
                                            styles.strengthText,
                                            { color: getPasswordStrengthColor(passwordStrength) },
                                        ]}>
                                        {getPasswordStrengthText(passwordStrength)}
                                    </Text>
                                </View>
                                <ProgressBar
                                    progress={passwordStrength}
                                    color={getPasswordStrengthColor(passwordStrength)}
                                    style={styles.strengthBar}
                                />
                            </View>
                        )}

                        {/* Confirm Password Input */}
                        <Controller
                            control={control}
                            name="confirmPassword"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="পাসওয়ার্ড নিশ্চিত করুন"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={!!errors.confirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    autoComplete="new-password"
                                    left={<TextInput.Icon icon="lock-check" />}
                                    right={
                                        <TextInput.Icon
                                            icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        />
                                    }
                                    style={styles.input}
                                />
                            )}
                        />
                        {errors.confirmPassword && (
                            <Text variant="bodySmall" style={styles.errorText}>
                                {errors.confirmPassword.message}
                            </Text>
                        )}

                        {/* Terms and Privacy */}
                        <View style={styles.checkboxContainer}>
                            <View style={styles.checkboxRow}>
                                <Checkbox
                                    status={acceptTerms ? 'checked' : 'unchecked'}
                                    onPress={() => setAcceptTerms(!acceptTerms)}
                                />
                                <Text variant="bodySmall" style={styles.checkboxText}>
                                    আমি{' '}
                                    <Text style={styles.linkText}>ব্যবহারের শর্তাবলী</Text>{' '}
                                    গ্রহণ করি
                                </Text>
                            </View>

                            <View style={styles.checkboxRow}>
                                <Checkbox
                                    status={acceptPrivacy ? 'checked' : 'unchecked'}
                                    onPress={() => setAcceptPrivacy(!acceptPrivacy)}
                                />
                                <Text variant="bodySmall" style={styles.checkboxText}>
                                    আমি{' '}
                                    <Text style={styles.linkText}>গোপনীয়তা নীতি</Text>{' '}
                                    গ্রহণ করি
                                </Text>
                            </View>
                        </View>

                        {/* Error Message */}
                        {error && (
                            <Text variant="bodySmall" style={styles.errorMessage}>
                                {error}
                            </Text>
                        )}

                        {/* Register Button */}
                        <Button
                            mode="contained"
                            onPress={handleSubmit(onSubmit)}
                            loading={isLoading}
                            disabled={!isValid || !acceptTerms || !acceptPrivacy || isLoading}
                            style={styles.registerButton}
                            icon="account-plus">
                            রেজিস্টার করুন
                        </Button>

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                            <Text variant="bodyMedium" style={styles.loginText}>
                                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                            </Text>
                            <Button
                                mode="text"
                                onPress={() => navigation.navigate('Login' as never)}
                                style={styles.loginButton}>
                                লগইন করুন
                            </Button>
                        </View>
                    </Card.Content>
                </Card>
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
        padding: spacing.lg,
    },
    header: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        backgroundColor: 'transparent',
    },
    logo: {
        marginBottom: spacing.md,
    },
    title: {
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
    },
    formCard: {
        marginVertical: spacing.lg,
    },
    formContent: {
        paddingVertical: spacing.lg,
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
    passwordStrength: {
        marginBottom: spacing.md,
    },
    strengthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    strengthLabel: {
        color: theme.colors.onSurfaceVariant,
    },
    strengthText: {
        fontWeight: 'bold',
    },
    strengthBar: {
        height: 4,
        borderRadius: 2,
    },
    checkboxContainer: {
        marginVertical: spacing.md,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    checkboxText: {
        flex: 1,
        marginLeft: spacing.xs,
        color: theme.colors.onSurface,
    },
    linkText: {
        color: theme.colors.primary,
        textDecorationLine: 'underline',
    },
    errorMessage: {
        color: theme.colors.error,
        textAlign: 'center',
        marginBottom: spacing.md,
        backgroundColor: theme.colors.errorContainer,
        padding: spacing.sm,
        borderRadius: theme.roundness,
    },
    registerButton: {
        marginVertical: spacing.md,
        paddingVertical: spacing.xs,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: theme.colors.onSurface,
    },
    loginButton: {
        paddingHorizontal: spacing.xs,
    },
});

