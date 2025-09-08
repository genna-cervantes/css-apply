// src/lib/supabase-storage.ts
import { supabase, supabaseAdmin } from '@/lib/supabase'

const BUCKET_NAME = 'portfolio-applications'

export async function ensureBucketExists() {
    try {
        const { data: buckets, error } = await supabaseAdmin.storage.listBuckets()
        
        if (error) {
            console.error('Error listing buckets:', error)
            throw error
        }

        const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME)
        
        if (!bucketExists) {
            console.log(`Creating bucket: ${BUCKET_NAME}`)
            const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
                public: true,
                fileSizeLimit: 10 * 1024 * 1024, // 10MB limit
        })
        
        if (createError) {
            console.error('Error creating bucket:', createError)
            throw createError
        }
            console.log('Bucket created successfully')
        } else {
            console.log('Bucket already exists')
        }
        
        return true
    } catch (error) {
        console.error('Error ensuring bucket exists:', error)
        throw error
    }
}

export async function uploadFileToSupabase(
        file: File,
        folder: 'cv' | 'portfolio',
        userIdentifier: string
    ): Promise<{ filePath: string; publicUrl: string }> {
    try {
        // Create a unique file name
        const fileExtension = file.name.split('.').pop()
        const fileName = `${folder}-${userIdentifier}-${Date.now()}.${fileExtension}`
        const filePath = `${folder}/${fileName}`

        // Upload file to Supabase Storage
        const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        })

        if (error) {
            throw new Error(`Supabase upload error: ${error.message}`)
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath)

        return {
            filePath: data.path,
            publicUrl: urlData.publicUrl
        }

    } catch (error) {
        console.error('Error uploading to Supabase:', error)
        throw error
    }
}

export async function getFileUrl(filePath: string): Promise<string> {
    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

    return data.publicUrl
}

export const deleteFileFromSupabase = async (filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('Error deleting file from Supabase:', error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to delete file:', error)
    throw error
  }
}

// Create bucket if it doesn't exist
export async function createStorageBucket() {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets()
    
    if (error) {
        console.error('Error listing buckets:', error)
        return
    }

    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME)
    
    if (!bucketExists) {
        const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
            public: true,
            fileSizeLimit: 5 * 1024 * 1024,
        })
        
        if (createError) {
        console.error('Error creating bucket:', createError)
        } else {
        console.log('Bucket created successfully')
        }
    }
}