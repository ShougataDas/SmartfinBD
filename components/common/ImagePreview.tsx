import React, { useState } from 'react';
import { View, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import { Surface, IconButton, Text } from 'react-native-paper';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';

import { theme, spacing } from '@/constants/theme';

interface ImagePreviewProps {
    imageUri: string;
    visible: boolean;
    onClose: () => void;
    title?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ImagePreview: React.FC<ImagePreviewProps> = ({
    imageUri,
    visible,
    onClose,
    title = 'ছবি প্রিভিউ',
}) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <BlurView intensity={50} style={styles.modalContainer}>
                <Pressable style={styles.backdrop} onPress={onClose} />

                <Surface style={styles.previewContainer} elevation={4}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text variant="titleMedium" style={styles.title}>
                            {title}
                        </Text>
                        <IconButton
                            icon="close"
                            size={24}
                            onPress={onClose}
                            iconColor={theme.colors.onSurface}
                        />
                    </View>

                    {/* Image */}
                    <View style={styles.imageContainer}>
                        {!imageError ? (
                            <Image
                                source={{ uri: imageUri }}
                                style={styles.previewImage}
                                contentFit="contain"
                                onLoadStart={() => setImageLoading(true)}
                                onLoadEnd={() => setImageLoading(false)}
                                onError={() => {
                                    setImageError(true);
                                    setImageLoading(false);
                                }}
                            />
                        ) : (
                            <View style={styles.errorContainer}>
                                <Text variant="bodyLarge" style={styles.errorText}>
                                    ছবি লোড করতে সমস্যা হয়েছে
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <IconButton
                            icon="download"
                            size={24}
                            mode="contained"
                            onPress={() => {
                                // Implement download functionality if needed
                                console.log('Download image:', imageUri);
                            }}
                        />
                        <IconButton
                            icon="share"
                            size={24}
                            mode="contained"
                            onPress={() => {
                                // Implement share functionality if needed
                                console.log('Share image:', imageUri);
                            }}
                        />
                    </View>
                </Surface>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    previewContainer: {
        width: screenWidth * 0.9,
        maxHeight: screenHeight * 0.8,
        borderRadius: theme.roundness * 2,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outline,
    },
    title: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
    },
    imageContainer: {
        flex: 1,
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        maxWidth: screenWidth * 0.8,
        maxHeight: screenHeight * 0.6,
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    errorText: {
        color: theme.colors.error,
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: spacing.md,
        gap: spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.outline,
    },
});