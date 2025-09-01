import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as SecureStore from 'expo-secure-store';
import { Alert, Platform } from 'react-native';

export interface ImagePickerResult {
    success: boolean;
    uri?: string;
    error?: string;
}

export class ImageService {
    private static readonly PROFILE_PICTURE_KEY = 'profile_picture_uri';
    private static readonly MAX_IMAGE_SIZE = 1024; // Max width/height in pixels
    private static readonly COMPRESSION_QUALITY = 0.8;

    /**
     * Request camera and media library permissions
     */
    static async requestPermissions(): Promise<boolean> {
        try {
            if (Platform.OS !== 'web') {
                const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

                if (!cameraPermission.granted || !mediaLibraryPermission.granted) {
                    Alert.alert(
                        'অনুমতি প্রয়োজন',
                        'ছবি নির্বাচন করতে ক্যামেরা ও গ্যালারির অনুমতি প্রয়োজন।',
                        [{ text: 'ঠিক আছে' }]
                    );
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error('Permission request error:', error);
            return false;
        }
    }

    /**
     * Show image picker options (camera or gallery)
     */
    static async showImagePicker(): Promise<ImagePickerResult> {
        try {
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                return { success: false, error: 'অনুমতি প্রদান করা হয়নি' };
            }

            return new Promise((resolve) => {
                Alert.alert(
                    'প্রোফাইল ছবি নির্বাচন করুন',
                    'আপনি কীভাবে ছবি যোগ করতে চান?',
                    [
                        {
                            text: 'বাতিল',
                            style: 'cancel',
                            onPress: () => resolve({ success: false, error: 'ব্যবহারকারী বাতিল করেছেন' }),
                        },
                        {
                            text: 'ক্যামেরা',
                            onPress: async () => {
                                const result = await this.pickImageFromCamera();
                                resolve(result);
                            },
                        },
                        {
                            text: 'গ্যালারি',
                            onPress: async () => {
                                const result = await this.pickImageFromGallery();
                                resolve(result);
                            },
                        },
                    ]
                );
            });
        } catch (error) {
            console.error('Image picker error:', error);
            return {
                success: false,
                error: 'ছবি নির্বাচনে সমস্যা হয়েছে',
            };
        }
    }

    /**
     * Pick image from camera
     */
    static async pickImageFromCamera(): Promise<ImagePickerResult> {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1], // Square aspect ratio for profile pictures
                quality: this.COMPRESSION_QUALITY,
            });

            if (result.canceled) {
                return { success: false, error: 'ব্যবহারকারী বাতিল করেছেন' };
            }

            const asset = result.assets[0];
            if (!asset.uri) {
                return { success: false, error: 'ছবি লোড করতে সমস্যা হয়েছে' };
            }

            // Process and compress the image
            const processedUri = await this.processImage(asset.uri);
            return { success: true, uri: processedUri };
        } catch (error) {
            console.error('Camera picker error:', error);
            return {
                success: false,
                error: 'ক্যামেরা থেকে ছবি নিতে সমস্যা হয়েছে',
            };
        }
    }

    /**
     * Pick image from gallery
     */
    static async pickImageFromGallery(): Promise<ImagePickerResult> {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1], // Square aspect ratio for profile pictures
                quality: this.COMPRESSION_QUALITY,
            });

            if (result.canceled) {
                return { success: false, error: 'ব্যবহারকারী বাতিল করেছেন' };
            }

            const asset = result.assets[0];
            if (!asset.uri) {
                return { success: false, error: 'ছবি লোড করতে সমস্যা হয়েছে' };
            }

            // Process and compress the image
            const processedUri = await this.processImage(asset.uri);
            return { success: true, uri: processedUri };
        } catch (error) {
            console.error('Gallery picker error:', error);
            return {
                success: false,
                error: 'গ্যালারি থেকে ছবি নিতে সমস্যা হয়েছে',
            };
        }
    }

    /**
     * Process and compress image
     */
    static async processImage(uri: string): Promise<string> {
        try {
            const manipulatedImage = await ImageManipulator.manipulateAsync(
                uri,
                [
                    {
                        resize: {
                            width: this.MAX_IMAGE_SIZE,
                            height: this.MAX_IMAGE_SIZE,
                        },
                    },
                ],
                {
                    compress: this.COMPRESSION_QUALITY,
                    format: ImageManipulator.SaveFormat.JPEG,
                }
            );

            return manipulatedImage.uri;
        } catch (error) {
            console.error('Image processing error:', error);
            // Return original URI if processing fails
            return uri;
        }
    }

    /**
     * Save profile picture URI securely
     */
    static async saveProfilePicture(uri: string): Promise<boolean> {
        try {
            await SecureStore.setItemAsync(this.PROFILE_PICTURE_KEY, uri);
            return true;
        } catch (error) {
            console.error('Failed to save profile picture:', error);
            return false;
        }
    }

    /**
     * Get saved profile picture URI
     */
    static async getProfilePicture(): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(this.PROFILE_PICTURE_KEY);
        } catch (error) {
            console.error('Failed to get profile picture:', error);
            return null;
        }
    }

    /**
     * Delete profile picture
     */
    static async deleteProfilePicture(): Promise<boolean> {
        try {
            await SecureStore.deleteItemAsync(this.PROFILE_PICTURE_KEY);
            return true;
        } catch (error) {
            console.error('Failed to delete profile picture:', error);
            return false;
        }
    }

    /**
     * Validate image file
     */
    static validateImage(uri: string): boolean {
        // Basic validation - check if URI exists and has image extension
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const lowerUri = uri.toLowerCase();

        return imageExtensions.some(ext => lowerUri.includes(ext)) || uri.startsWith('file://');
    }

    /**
     * Get image size information
     */
    static async getImageInfo(uri: string): Promise<{
        width: number;
        height: number;
        size?: number;
    } | null> {
        try {
            // This would require expo-image-manipulator or similar library
            // For now, return null as placeholder
            return null;
        } catch (error) {
            console.error('Failed to get image info:', error);
            return null;
        }
    }
}