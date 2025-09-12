import { supabase } from '@/lib/supabase';

export const STORAGE_BUCKET = 'committee-applications';

export async function createStorageBucket() {
    const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: false,
        allowedMimeTypes: ['application/pdf'],
        fileSizeLimit: 10 * 1024 * 1024,
    });

    if (error && error.message !== 'Bucket already exists') {
        console.error('Error creating bucket:', error);
        throw error;
    }
    
    return data;
}

export async function uploadFile(file: File, studentNumber: string, fileType: 'cv' | 'portfolio'): Promise<string> {
    try {
        const timestamp = Date.now();
        const fileName = `${studentNumber}/${fileType}_${timestamp}.pdf`;

        const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

        if (error) {
        throw error;
        }

        return fileName; // Return the file path for database storage
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

// Delete file from Supabase Storage
export async function deleteFile(filePath: string): Promise<void> {
    try {
        const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

        if (error) {
           throw error;
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

export async function getFileUrl(filePath: string): Promise<string> {
    try {
        const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(filePath, 3600); // URL expires in 1 hour

        if (error) {
           throw error;
        }

        return data.signedUrl;
    } catch (error) {
        console.error('Error getting file URL:', error);
        throw error;
    }
}

export async function replaceFile(oldFilePath: string, newFile: File, studentNumber: string, fileType: 'cv' | 'portfolio'): Promise<string> {
    try {
        // Delete old file first
        if (oldFilePath) {
        await deleteFile(oldFilePath);
        }

        // Upload new file
        const newFilePath = await uploadFile(newFile, studentNumber, fileType);
        
        return newFilePath;
    } catch (error) {
        console.error('Error replacing file:', error);
        throw error;
    }
}