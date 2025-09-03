import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Avatar, Button, Surface, Text, ActivityIndicator } from 'react-native-paper';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { theme, spacing } from '@/constants/theme';
import { ImageService, ImagePickerResult } from '@/services/imageService';

interface ProfilePictureSelectorProps {
    currentImageUri?: string | null;
    userName?: string;
    onImageSelected: (uri: string) => void;
    onImageRemoved: () => void;
    size?: number;
    editable?: boolean;
}

export const ProfilePictureSelector: React.FC<ProfilePictureSelectorProps> = ({
    currentImageUri,
    userName = 'U',
    onImageSelected,
    onImageRemoved,
    size = 120,
    editable = true,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleImagePicker = async () => {
        if (!editable) return;

        setIsLoading(true);
        try {
            const result: ImagePickerResult = await ImageService.showImagePicker();

            if (result.success && result.uri) {
                // Validate the image
                if (ImageService.validateImage(result.uri)) {
                    onImageSelected(result.uri);
                    setImageError(false);
                } else {
                    Alert.alert(
                        'অবৈধ ছবি',
                        'অনুগ্রহ করে একটি বৈধ ছবি নির্বাচন করুন।',
                        [{ text: 'ঠিক আছে' }]
                    );
                }
            } else if (result.error && result.error !== 'ব্যবহারকারী বাতিল করেছেন') {
                Alert.alert(
                    'ছবি নির্বাচনে সমস্যা',
                    result.error,
                    [{ text: 'ঠিক আছে' }]
                );
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert(
                'ত্রুটি',
                'ছবি নির্বাচনে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
                [{ text: 'ঠিক আছে' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveImage = () => {
        if (!editable || !currentImageUri) return;

        Alert.alert(
            'ছবি মুছে ফেলুন',
            'আপনি কি প্রোফাইল ছবি মুছে ফেলতে চান?',
            [
                { text: 'বাতিল', style: 'cancel' },
                {
                    text: 'মুছে ফেলুন',
                    style: 'destructive',
                    onPress: () => {
                        onImageRemoved();
                        setImageError(false);
                    },
                },
            ]
        );
    };

    const renderProfileImage = () => {
        if (isLoading) {
            return (
                <Surface style={[styles.avatarContainer, { width: size, height: size }]}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </Surface>
            );
        }

        if (currentImageUri && !imageError) {
            return (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: currentImageUri }}
                        style={[styles.profileImage, { width: size, height: size }]}
                        contentFit="cover"
                        onError={() => setImageError(true)}
                    />
                    {editable && (
                        <Surface style={styles.editOverlay}>
                            <Icon name="camera" size={20} color={theme.colors.onPrimary} />
                        </Surface>
                    )}
                </View>
            );
        }

        return (
            <View style={styles.avatarContainer}>
                <Avatar.Text
                    size={size}
                    label={userName.charAt(0).toUpperCase()}
                    style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
                    labelStyle={{ color: theme.colors.onPrimary }}
                />
                {editable && (
                    <Surface style={styles.editOverlay}>
                        <Icon name="camera" size={20} color={theme.colors.onPrimary} />
                    </Surface>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Surface
                style={[styles.profileContainer, { opacity: editable ? 1 : 0.8 }]}
                onTouchEnd={editable ? handleImagePicker : undefined}
            >
                {renderProfileImage()}
            </Surface>

            {editable && (
                <View style={styles.actionButtons}>
                    <Button
                        mode="outlined"
                        onPress={handleImagePicker}
                        style={styles.actionButton}
                        icon="camera"
                        disabled={isLoading}
                    >
                        {currentImageUri ? 'ছবি পরিবর্তন' : 'ছবি যোগ করুন'}
                    </Button>

                    {currentImageUri && (
                        <Button
                            mode="text"
                            onPress={handleRemoveImage}
                            style={styles.removeButton}
                            icon="delete"
                            textColor={theme.colors.error}
                            disabled={isLoading}
                        >
                            ছবি মুছুন
                        </Button>
                    )}
                </View>
            )}

            {editable && (
                <Text variant="bodySmall" style={styles.helperText}>
                    সর্বোচ্চ ফাইল সাইজ: ৫ MB | সমর্থিত ফরম্যাট: JPG, PNG
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    profileContainer: {
        borderRadius: 100,
        overflow: 'hidden',
        elevation: 4,
        backgroundColor: theme.colors.surface,
    },
    avatarContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        position: 'relative',
    },
    profileImage: {
        borderRadius: 100,
    },
    avatar: {
        elevation: 2,
    },
    editOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        zIndex: 100,
    },
    actionButtons: {
        marginTop: spacing.lg,
        alignItems: 'center',
        gap: spacing.sm,
    },
    actionButton: {
        minWidth: 150,
    },
    removeButton: {
        marginTop: spacing.xs,
    },
    helperText: {
        marginTop: spacing.md,
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
        paddingHorizontal: spacing.lg,
    },
});