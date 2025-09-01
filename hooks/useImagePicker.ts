import { useState, useCallback } from 'react';
import { ImageService, ImagePickerResult } from '@/services/imageService';

export interface UseImagePickerReturn {
    isLoading: boolean;
    error: string | null;
    pickImage: () => Promise<string | null>;
    clearError: () => void;
}

/**
 * Custom hook for handling image picking functionality
 */
export const useImagePicker = (): UseImagePickerReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pickImage = useCallback(async (): Promise<string | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const result: ImagePickerResult = await ImageService.showImagePicker();
            
            if (result.success && result.uri) {
                return result.uri;
            } else if (result.error && result.error !== 'ব্যবহারকারী বাতিল করেছেন') {
                setError(result.error);
            }
            
            return null;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'ছবি নির্বাচনে সমস্যা হয়েছে';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isLoading,
        error,
        pickImage,
        clearError,
    };
};