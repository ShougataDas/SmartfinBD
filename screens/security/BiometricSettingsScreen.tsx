import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import {
    Card,
    Text,
    Button,
    List,
    Surface,
    Switch,
    Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { theme, spacing } from '@/constants/theme';
import { BiometricService } from '@/services/biometricService';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';

export const BiometricSettingsScreen: React.FC = () => {
    const navigation = useNavigation();
    const { 
        biometricEnabled, 
        biometricAvailable, 
        enableBiometricAuth, 
        disableBiometricAuth, 
        checkBiometricStatus 
    } = useAuthStore();
    const { user } = useUserStore();

    const [biometricTypes, setBiometricTypes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        checkBiometricStatus();
        BiometricService.getAvailableBiometricTypes().then(setBiometricTypes);
    }, []);

    const handleBiometricToggle = async (enabled: boolean) => {
        if (!user?.email) {
            Alert.alert('ত্রুটি', 'ব্যবহারকারীর তথ্য পাওয়া যায়নি।');
            return;
        }

        setIsLoading(true);

        try {
            if (enabled) {
                // For demo purposes, using default password
                // In production, you'd prompt for current password
                await enableBiometricAuth(user.email, 'demo123');
            } else {
                Alert.alert(
                    'বায়োমেট্রিক লগইন বন্ধ করুন',
                    'আপনি কি নিশ্চিত যে বায়োমেট্রিক লগইন বন্ধ করতে চান?',
                    [
                        { text: 'বাতিল', style: 'cancel' },
                        { 
                            text: 'বন্ধ করুন', 
                            style: 'destructive',
                            onPress: () => disableBiometricAuth() 
                        },
                    ]
                );
            }
        } catch (error) {
            console.error('Biometric toggle error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestBiometric = async () => {
        try {
            const result = await BiometricService.authenticateWithBiometrics(
                'বায়োমেট্রিক প্রমাণীকরণ পরীক্ষা করুন'
            );

            if (result.success) {
                Alert.alert(
                    'পরীক্ষা সফল',
                    'বায়োমেট্রিক প্রমাণীকরণ সঠিকভাবে কাজ করছে।',
                    [{ text: 'ঠিক আছে' }]
                );
            } else {
                Alert.alert(
                    'পরীক্ষা ব্যর্থ',
                    result.error || 'বায়োমেট্রিক প্রমাণীকরণ কাজ করছে না।',
                    [{ text: 'ঠিক আছে' }]
                );
            }
        } catch (error) {
            Alert.alert(
                'ত্রুটি',
                'বায়োমেট্রিক পরীক্ষায় সমস্যা হয়েছে।',
                [{ text: 'ঠিক আছে' }]
            );
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <Surface style={styles.header} elevation={2}>
                <Icon name="fingerprint" size={48} color={theme.colors.primary} />
                <Text variant="headlineMedium" style={styles.headerTitle}>
                    বায়োমেট্রিক নিরাপত্তা
                </Text>
                <Text variant="bodyLarge" style={styles.headerSubtitle}>
                    আপনার অ্যাকাউন্টের জন্য অতিরিক্ত নিরাপত্তা
                </Text>
            </Surface>

            {/* Biometric Status */}
            <Card style={styles.statusCard}>
                <Card.Content>
                    <View style={styles.statusHeader}>
                        <Icon 
                            name={biometricEnabled ? "check-circle" : "alert-circle"} 
                            size={32} 
                            color={biometricEnabled ? "#4CAF50" : "#FF9800"} 
                        />
                        <Text variant="titleLarge" style={styles.statusTitle}>
                            {biometricEnabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </Text>
                    </View>

                    <Text variant="bodyMedium" style={styles.statusDescription}>
                        {biometricEnabled 
                            ? `${biometricTypes.join('/')} লগইন সক্রিয় রয়েছে`
                            : 'বায়োমেট্রিক লগইন বর্তমানে বন্ধ রয়েছে'
                        }
                    </Text>

                    {biometricAvailable && (
                        <View style={styles.availableTypes}>
                            <Text variant="bodySmall" style={styles.typesLabel}>
                                উপলব্ধ পদ্ধতি:
                            </Text>
                            {biometricTypes.map((type, index) => (
                                <Text key={index} variant="bodySmall" style={styles.typeItem}>
                                    • {type}
                                </Text>
                            ))}
                        </View>
                    )}
                </Card.Content>
            </Card>

            {/* Settings */}
            <Card style={styles.settingsCard}>
                <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                        সেটিংস
                    </Text>

                    {biometricAvailable ? (
                        <>
                            <List.Item
                                title="বায়োমেট্রিক লগইন"
                                description={`${biometricTypes.join('/')} দিয়ে লগইন করুন`}
                                left={(props) => (
                                    <List.Icon
                                        {...props}
                                        icon="fingerprint"
                                        color={theme.colors.primary}
                                    />
                                )}
                                right={() => (
                                    <Switch
                                        value={biometricEnabled}
                                        onValueChange={handleBiometricToggle}
                                        disabled={isLoading}
                                    />
                                )}
                            />

                            <Divider />

                            {biometricEnabled && (
                                <>
                                    <List.Item
                                        title="বায়োমেট্রিক পরীক্ষা"
                                        description="প্রমাণীকরণ সঠিকভাবে কাজ করছে কিনা পরীক্ষা করুন"
                                        left={(props) => (
                                            <List.Icon
                                                {...props}
                                                icon="test-tube"
                                                color={theme.colors.secondary}
                                            />
                                        )}
                                        right={(props) => <List.Icon {...props} icon="chevron-right" />}
                                        onPress={handleTestBiometric}
                                    />

                                    <Divider />
                                </>
                            )}
                        </>
                    ) : (
                        <Surface style={styles.unavailableCard}>
                            <Icon name="alert-circle" size={32} color="#FF9800" />
                            <Text variant="titleMedium" style={styles.unavailableTitle}>
                                বায়োমেট্রিক উপলব্ধ নেই
                            </Text>
                            <Text variant="bodyMedium" style={styles.unavailableText}>
                                আপনার ডিভাইসে বায়োমেট্রিক প্রমাণীকরণ সেটআপ করা নেই বা সমর্থিত নয়।
                            </Text>
                        </Surface>
                    )}
                </Card.Content>
            </Card>

            {/* Security Tips */}
            <Card style={styles.tipsCard}>
                <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                        নিরাপত্তা টিপস
                    </Text>

                    <View style={styles.tipsList}>
                        <View style={styles.tipItem}>
                            <Icon name="shield-check" size={20} color="#4CAF50" />
                            <Text variant="bodyMedium" style={styles.tipText}>
                                বায়োমেট্রিক ডেটা আপনার ডিভাইসেই থাকে, কোথাও পাঠানো হয় না
                            </Text>
                        </View>

                        <View style={styles.tipItem}>
                            <Icon name="lock" size={20} color="#2196F3" />
                            <Text variant="bodyMedium" style={styles.tipText}>
                                আপনার লগইন তথ্য এনক্রিপ্ট করে সংরক্ষণ করা হয়
                            </Text>
                        </View>

                        <View style={styles.tipItem}>
                            <Icon name="account-key" size={20} color="#9C27B0" />
                            <Text variant="bodyMedium" style={styles.tipText}>
                                যেকোনো সময় বায়োমেট্রিক লগইন বন্ধ করতে পারবেন
                            </Text>
                        </View>

                        <View style={styles.tipItem}>
                            <Icon name="cellphone-lock" size={20} color="#FF9800" />
                            <Text variant="bodyMedium" style={styles.tipText}>
                                ডিভাইস লক থাকলে বায়োমেট্রিক লগইন কাজ করবে না
                            </Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            {/* Biometric Setup Card for new users */}
            {showBiometricSetup && registeredCredentials && (
                <BiometricSetupCard
                    userEmail={registeredCredentials.email}
                    userPassword={registeredCredentials.password}
                    onSetupComplete={() => {
                        setShowBiometricSetup(false);
                        Alert.alert(
                            'সেটআপ সম্পূর্ণ',
                            'বায়োমেট্রিক লগইন সফলভাবে সক্রিয় করা হয়েছে।',
                            [{ text: 'ঠিক আছে' }]
                        );
                    }}
                    onSkip={() => {
                        setShowBiometricSetup(false);
                    }}
                />
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        alignItems: 'center',
        padding: spacing.xl,
        margin: spacing.md,
        borderRadius: theme.roundness,
        backgroundColor: theme.colors.surface,
    },
    headerTitle: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    headerSubtitle: {
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    statusCard: {
        margin: spacing.md,
        marginTop: spacing.sm,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    statusTitle: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginLeft: spacing.md,
    },
    statusDescription: {
        color: theme.colors.onSurfaceVariant,
        marginBottom: spacing.md,
    },
    availableTypes: {
        backgroundColor: theme.colors.surfaceVariant,
        padding: spacing.md,
        borderRadius: theme.roundness,
    },
    typesLabel: {
        fontWeight: 'bold',
        color: theme.colors.onSurfaceVariant,
        marginBottom: spacing.sm,
    },
    typeItem: {
        color: theme.colors.onSurfaceVariant,
        marginLeft: spacing.sm,
    },
    settingsCard: {
        margin: spacing.md,
        marginTop: spacing.sm,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginBottom: spacing.md,
    },
    unavailableCard: {
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: theme.roundness,
    },
    unavailableTitle: {
        fontWeight: 'bold',
        color: theme.colors.onSurfaceVariant,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    unavailableText: {
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    tipsCard: {
        margin: spacing.md,
        marginTop: spacing.sm,
        marginBottom: spacing.xl,
    },
    tipsList: {
        gap: spacing.md,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    tipText: {
        flex: 1,
        marginLeft: spacing.sm,
        color: theme.colors.onSurface,
        lineHeight: 20,
    },
});