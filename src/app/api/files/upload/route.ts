import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { supabase } from '@/lib/supabase'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session || !session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const studentNumber = formData.get('studentNumber') as string
        const fileType = formData.get('fileType') as string // 'cv' or 'portfolio'

        if (!file || !studentNumber || !fileType) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        )
        }

        if (file.type !== 'application/pdf') {
        return NextResponse.json(
            { error: 'Only PDF files are allowed' },
            { status: 400 }
        )
        }

        // Check if user already has a file uploaded for this type
        const { data: existingFiles } = await supabase.storage
        .from('committee-applications')
        .list(`${studentNumber}/${fileType}`)

        // Delete existing files if they exist
        if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(file => `${studentNumber}/${fileType}/${file.name}`)
        await supabase.storage
            .from('committee-applications')
            .remove(filesToDelete)
        }

        // Generate unique filename
        const timestamp = Date.now()
        const fileExtension = file.name.split('.').pop()
        const fileName = `${fileType}-${timestamp}.${fileExtension}`
        const filePath = `${studentNumber}/${fileType}/${fileName}`

        // Upload file to Supabase
        const { data, error } = await supabase.storage
        .from('committee-applications')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
        })

        if (error) {
        console.error('Supabase upload error:', error)
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        )
        }

        // Get public URL
        const { data: urlData } = supabase.storage
        .from('committee-applications')
        .getPublicUrl(filePath)

        return NextResponse.json({
        success: true,
        fileName: file.name,
        filePath,
        downloadUrl: urlData.publicUrl,
        message: 'File uploaded successfully'
        })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
        )
    }
}