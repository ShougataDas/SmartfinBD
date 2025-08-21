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
    SegmentedButtons,
    Avatar,
} from 'react-native-paper';
import { Resolver } from 'react-hook-form';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { theme, spacing } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';

// interface EditProfileForm {
//     name: string;
//     email: string;
//     phone?: string | null;       // 👈 allow null
//     age: number;
//     gender?: 'male' | 'female' | 'other';
//     occupation?: string | null;  // 👈 allow null
// }
// const editProfileSchema = yup.object().shape({
//     name: yup
//         .string()
//         .min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে')
//         .required('নাম আবশ্যক'),
//     email: yup
//         .string()
//         .email('সঠিক ইমেইল ঠিকানা দিন')
//         .required('ইমেইল আবশ্যক'),
//     phone: yup
//         .string()
//         .matches(/^(\+88)?01[3-9]\d{8}$/, 'সঠিক মোবাইল নম্বর দিন')
//         .nullable()
//         .optional(),   // 👈 makes it truly optional
//     age: yup
//         .number()
//         .min(18, 'বয়স কমপক্ষে ১৮ বছর হতে হবে')
//         .max(100, 'বয়স ১০০ বছরের বেশি হতে পারে না')
//         .required('বয়স আবশ্যক'),
//     occupation: yup.string().nullable().optional(), // 👈 same here
// });

const editProfileSchema = yup.object({
    name: yup.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে').required('নাম আবশ্যক'),
    email: yup.string().email('সঠিক ইমেইল ঠিকানা দিন').required('ইমেইল আবশ্যক'),
    phone: yup
        .string()
        .matches(/^(\+88)?01[3-9]\d{8}$/, 'সঠিক মোবাইল নম্বর দিন')
        .nullable()
        .notRequired(),
    age: yup
        .number()
        .min(18, 'বয়স কমপক্ষে ১৮ বছর হতে হবে')
        .max(100, 'বয়স ১০০ বছরের বেশি হতে পারে না')
        .required('বয়স আবশ্যক'),
    gender: yup.mixed<'male' | 'female'>().oneOf(['male', 'female']).notRequired(),
    occupation: yup.string().nullable().notRequired(),
});

type EditProfileForm = yup.InferType<typeof editProfileSchema>;



export const EditProfileScreen: React.FC = () => {
    const navigation = useNavigation();
    const { user, updateUser } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors, isValid, isDirty },
    } = useForm<EditProfileForm>({
        resolver: yupResolver(editProfileSchema) as Resolver<EditProfileForm>, // 👈 cast fixes resolver mismatch
        mode: 'onChange',
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone ?? null,
            age: user?.age ?? 18,
            gender: user?.gender ?? 'male',
            occupation: user?.occupation ?? null,
        },
    });

    const genderOptions = [
        { value: 'male', label: 'পুরুষ' },
        { value: 'female', label: 'মহিলা' },
    ];

    const onSubmit = async (data: EditProfileForm) => {
        setIsLoading(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            updateUser({
                name: data.name,
                email: data.email,
                phone: data.phone || "",
                age: data.age,
                gender: data.gender,
                occupation: data.occupation || "",
            });

            Alert.alert(
                'প্রোফাইল আপডেট সফল',
                'আপনার প্রোফাইল সফলভাবে আপডেট হয়েছে।',
                [
                    {
                        text: 'ঠিক আছে',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            Alert.alert(
                'আপডেট ব্যর্থ',
                'প্রোফাইল আপডেট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
                [{ text: 'ঠিক আছে' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (isDirty) {
            Alert.alert(
                'পরিবর্তন বাতিল করুন',
                'আপনার করা পরিবর্তনগুলো সংরক্ষিত হবে না। আপনি কি নিশ্চিত?',
                [
                    { text: 'থাকুন', style: 'cancel' },
                    { text: 'বাতিল করুন', onPress: () => navigation.goBack() },
                ]
            );
        } else {
            navigation.goBack();
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>

                {/* Profile Picture Section */}
                <Surface style={styles.avatarSection} elevation={2}>
                    <Avatar.Text
                        size={100}
                        label={user?.name?.charAt(0) || 'U'}
                        style={styles.avatar}
                    />
                    <Button
                        mode="outlined"
                        onPress={() => Alert.alert('ছবি পরিবর্তন', 'এই ফিচারটি শীঘ্রই আসছে।')}
                        style={styles.changePhotoButton}
                        icon="camera">
                        ছবি পরিবর্তন করুন
                    </Button>
                </Surface>

                {/* Basic Information */}
                <Card style={styles.formCard}>
                    <Card.Content>
                        <Text variant="titleLarge" style={styles.sectionTitle}>
                            মৌলিক তথ্য
                        </Text>

                        {/* Name Input */}
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="পূর্ণ নাম *"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={!!errors.name}
                                    autoCapitalize="words"
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
                                    label="ইমেইল ঠিকানা *"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={!!errors.email}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
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
                                    value={value || ''}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={!!errors.phone}
                                    keyboardType="phone-pad"
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

                        {/* Age Input */}
                        <Controller
                            control={control}
                            name="age"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="বয়স *"
                                    value={value ? value.toString() : ''}
                                    onChangeText={(text) => onChange(parseInt(text) || 0)}
                                    onBlur={onBlur}
                                    error={!!errors.age}
                                    keyboardType="numeric"
                                    left={<TextInput.Icon icon="calendar" />}
                                    style={styles.input}
                                />
                            )}
                        />
                        {errors.age && (
                            <Text variant="bodySmall" style={styles.errorText}>
                                {errors.age.message}
                            </Text>
                        )}

                        {/* Gender Selection */}
                        <Text variant="titleMedium" style={styles.fieldLabel}>
                            লিঙ্গ
                        </Text>
                        <Controller
                            control={control}
                            name="gender"
                            render={({ field: { onChange, value } }) => (
                                <SegmentedButtons
                                    value={value || 'male'}
                                    onValueChange={onChange}
                                    buttons={genderOptions}
                                    style={styles.segmentedButtons}
                                />
                            )}
                        />

                        {/* Occupation Input */}
                        <Controller
                            control={control}
                            name="occupation"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="পেশা"
                                    value={value || ''}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    autoCapitalize="words"
                                    left={<TextInput.Icon icon="briefcase" />}
                                    style={styles.input}
                                />
                            )}
                        />
                    </Card.Content>
                </Card>

                {/* Account Information */}
                <Card style={styles.infoCard}>
                    <Card.Content>
                        <Text variant="titleLarge" style={styles.sectionTitle}>
                            অ্যাকাউন্ট তথ্য
                        </Text>

                        <View style={styles.infoRow}>
                            <Icon name="calendar-plus" size={20} color={theme.colors.primary} />
                            <Text variant="bodyMedium" style={styles.infoText}>
                                অ্যাকাউন্ট তৈরি: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('bn-BD') : 'N/A'}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Icon name="update" size={20} color={theme.colors.primary} />
                            <Text variant="bodyMedium" style={styles.infoText}>
                                শেষ আপডেট: {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('bn-BD') : 'N/A'}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Icon
                                name={user?.isEmailVerified ? "check-circle" : "alert-circle"}
                                size={20}
                                color={user?.isEmailVerified ? "#4CAF50" : "#FF9800"}
                            />
                            <Text variant="bodyMedium" style={styles.infoText}>
                                ইমেইল যাচাই: {user?.isEmailVerified ? 'সম্পন্ন' : 'অসম্পন্ন'}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Icon
                                name={user?.isPhoneVerified ? "check-circle" : "alert-circle"}
                                size={20}
                                color={user?.isPhoneVerified ? "#4CAF50" : "#FF9800"}
                            />
                            <Text variant="bodyMedium" style={styles.infoText}>
                                ফোন যাচাই: {user?.isPhoneVerified ? 'সম্পন্ন' : 'অসম্পন্ন'}
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <Button
                        mode="outlined"
                        onPress={handleCancel}
                        style={styles.cancelButton}
                        icon="close">
                        বাতিল
                    </Button>

                    <Button
                        mode="contained"
                        onPress={handleSubmit(onSubmit)}
                        loading={isLoading}
                        disabled={!isValid || !isDirty || isLoading}
                        style={styles.saveButton}
                        icon="content-save">
                        সংরক্ষণ করুন
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
    avatarSection: {
        alignItems: 'center',
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderRadius: theme.roundness,
        backgroundColor: theme.colors.surface,
    },
    avatar: {
        backgroundColor: theme.colors.primary,
        marginBottom: spacing.md,
    },
    changePhotoButton: {
        marginTop: spacing.sm,
    },
    formCard: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginBottom: spacing.lg,
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
    fieldLabel: {
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        fontWeight: 'bold',
        color: theme.colors.onSurface,
    },
    segmentedButtons: {
        marginBottom: spacing.lg,
    },
    infoCard: {
        marginBottom: spacing.lg,
        backgroundColor: theme.colors.surfaceVariant,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    infoText: {
        marginLeft: spacing.sm,
        color: theme.colors.onSurface,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },
    cancelButton: {
        flex: 1,
        marginRight: spacing.sm,
    },
    saveButton: {
        flex: 1,
        marginLeft: spacing.sm,
    },
});