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
    Divider,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { theme, spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { LoginForm } from '@/types';

const loginSchema = yup.object().shape({
    email: yup
        .string()
        .email('সঠিক ইমেইল ঠিকানা দিন')
        .required('ইমেইল আবশ্যক'),
    password: yup
        .string()
        .min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে')
        .required('পাসওয়ার্ড আবশ্যক'),
});

export const LoginScreen: React.FC = () => {
    const navigation = useNavigation();
    const { login, isLoading, error } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<LoginForm>({
        resolver: yupResolver(loginSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            await login(data);
            // Navigation will be handled automatically by the navigator
        } catch (error) {
            Alert.alert(
                'লগইন ব্যর্থ',
                'ইমেইল বা পাসওয়ার্ড ভুল। অনুগ্রহ করে আবার চেষ্টা করুন।',
                [{ text: 'ঠিক আছে' }]
            );
        }
    };

    const handleForgotPassword = () => {
        Alert.alert(
            'পাসওয়ার্ড ভুলে গেছেন?',
            'পাসওয়ার্ড রিসেট করার জন্য আমাদের সাথে যোগাযোগ করুন।',
            [
                { text: 'বাতিল', style: 'cancel' },
                { text: 'যোগাযোগ করুন', onPress: () => { } },
            ]
        );
    };

    const handleBiometricLogin = () => {
        Alert.alert(
            'বায়োমেট্রিক লগইন',
            'এই ফিচারটি শীঘ্রই আসছে।',
            [{ text: 'ঠিক আছে' }]
        );
    };

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
                        name="bank"
                        size={60}
                        color={theme.colors.primary}
                        style={styles.logo}
                    />
                    <Text variant="headlineMedium" style={styles.title}>
                        SmartFin BD
                    </Text>
                    <Text variant="bodyLarge" style={styles.subtitle}>
                        আপনার আর্থিক সাফল্যের সঙ্গী
                    </Text>
                </Surface>

                {/* Login Form */}
                <Card style={styles.formCard}>
                    <Card.Content style={styles.formContent}>
                        <Text variant="headlineSmall" style={styles.formTitle}>
                            লগইন করুন
                        </Text>

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
                                    autoComplete="password"
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

                        {/* Remember Me & Forgot Password */}
                        <View style={styles.optionsRow}>
                            <View style={styles.rememberMe}>
                                <Checkbox
                                    status={rememberMe ? 'checked' : 'unchecked'}
                                    onPress={() => setRememberMe(!rememberMe)}
                                />
                                <Text variant="bodyMedium" style={styles.rememberText}>
                                    মনে রাখুন
                                </Text>
                            </View>
                            <Button
                                mode="text"
                                onPress={handleForgotPassword}
                                style={styles.forgotButton}>
                                পাসওয়ার্ড ভুলে গেছেন?
                            </Button>
                        </View>

                        {/* Error Message */}
                        {error && (
                            <Text variant="bodySmall" style={styles.errorMessage}>
                                {error}
                            </Text>
                        )}

                        {/* Login Button */}
                        <Button
                            mode="contained"
                            onPress={handleSubmit(onSubmit)}
                            loading={isLoading}
                            disabled={!isValid || isLoading}
                            style={styles.loginButton}
                            icon="login">
                            লগইন করুন
                        </Button>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <Divider style={styles.divider} />
                            <Text variant="bodySmall" style={styles.dividerText}>
                                অথবা
                            </Text>
                            <Divider style={styles.divider} />
                        </View>

                        {/* Biometric Login */}
                        <Button
                            mode="outlined"
                            onPress={handleBiometricLogin}
                            style={styles.biometricButton}
                            icon="fingerprint">
                            ফিঙ্গারপ্রিন্ট দিয়ে লগইন
                        </Button>

                        {/* Register Link */}
                        <View style={styles.registerContainer}>
                            <Text variant="bodyMedium" style={styles.registerText}>
                                নতুন ব্যবহারকারী?{' '}
                            </Text>
                            <Button
                                mode="text"
                                onPress={() => navigation.navigate('Register' as never)}
                                style={styles.registerButton}>
                                রেজিস্টার করুন
                            </Button>
                        </View>
                    </Card.Content>
                </Card>

                {/* Demo Credentials */}
                <Card style={styles.demoCard}>
                    <Card.Content>
                        <Text variant="titleSmall" style={styles.demoTitle}>
                            ডেমো অ্যাকাউন্ট
                        </Text>
                        <Text variant="bodySmall" style={styles.demoText}>
                            ইমেইল: demo@smartfinbd.com
                        </Text>
                        <Text variant="bodySmall" style={styles.demoText}>
                            পাসওয়ার্ড: demo123
                        </Text>
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
    formTitle: {
        textAlign: 'center',
        marginBottom: spacing.lg,
        fontWeight: 'bold',
        color: theme.colors.onSurface,
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
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: spacing.md,
    },
    rememberMe: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rememberText: {
        marginLeft: spacing.xs,
        color: theme.colors.onSurface,
    },
    forgotButton: {
        paddingHorizontal: 0,
    },
    errorMessage: {
        color: theme.colors.error,
        textAlign: 'center',
        marginBottom: spacing.md,
        backgroundColor: theme.colors.errorContainer,
        padding: spacing.sm,
        borderRadius: theme.roundness,
    },
    loginButton: {
        marginVertical: spacing.md,
        paddingVertical: spacing.xs,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    divider: {
        flex: 1,
    },
    dividerText: {
        marginHorizontal: spacing.md,
        color: theme.colors.onSurfaceVariant,
    },
    biometricButton: {
        marginBottom: spacing.lg,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        color: theme.colors.onSurface,
    },
    registerButton: {
        paddingHorizontal: spacing.xs,
    },
    demoCard: {
        backgroundColor: theme.colors.primaryContainer,
        marginTop: spacing.md,
    },
    demoTitle: {
        fontWeight: 'bold',
        marginBottom: spacing.sm,
        color: theme.colors.onPrimaryContainer,
    },
    demoText: {
        color: theme.colors.onPrimaryContainer,
        fontFamily: 'monospace',
    },
});

