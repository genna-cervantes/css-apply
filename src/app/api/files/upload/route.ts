// src/app/api/files/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { supabase } from '@/lib/supabase'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        console.log('Upload API called');
        const session = await getServerSession(authOptions);
        
        if (!session || !session?.user?.email) {
            console.error('Unauthorized: No session or email');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse the form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const studentNumber = formData.get('studentNumber') as string;
        const fileType = formData.get('fileType') as string;
        const section = formData.get('section') as string;
        const applicationType = formData.get('applicationType') as string; // 'ea' or 'committee'
        
        if (!file || !studentNumber || !fileType || !applicationType) {
            console.error('Missing required fields:', { 
                file: !!file, 
                studentNumber: !!studentNumber, 
                fileType: !!fileType,
                applicationType: !!applicationType
            });
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            console.error('Invalid file type:', file.type);
            return NextResponse.json(
                { error: 'Only PDF files are allowed' },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            console.error('File too large:', file.size);
            return NextResponse.json(
                { error: 'File size must be less than 10MB' },
                { status: 400 }
            );
        }

        // Check if user exists by email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, email: true, studentNumber: true, section: true }
        });

        if (!user) {
            console.error('User not found for email:', session.user.email);
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Update the user with the student number and section if they're not already set
        const updateData: {studentNumber?: string; section?: string} = {};
        if (!user.studentNumber) {
            updateData.studentNumber = studentNumber;
        }
        if (section && !user.section) {
            updateData.section = section;
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.user.update({
                where: { email: session.user.email },
                data: updateData
            });
        } else if (user.studentNumber !== studentNumber) {
            console.error('Student number mismatch:', { dbStudentNumber: user.studentNumber, formStudentNumber: studentNumber });
            return NextResponse.json(
                { error: 'Student number does not match your account' },
                { status: 400 }
            );
        }

        // Determine the bucket and application type
        const bucketName = applicationType === 'ea' ? 'ea-applications' : 'committee-applications';
        
        // Check if user already has an application of this type
        let existingApplication = null;
        let oldFilePath = '';

        if (applicationType === 'ea') {
            existingApplication = await prisma.eAApplication.findUnique({
                where: { studentNumber },
                select: { 
                    supabaseFilePath: true,
                    cv: true
                }
            });
            
            if (existingApplication) {
                oldFilePath = fileType === 'cv' 
                    ? (existingApplication.supabaseFilePath || '')
                    : '';
            }
        } else {
            existingApplication = await prisma.committeeApplication.findUnique({
                where: { studentNumber },
                select: { 
                    supabaseFilePath: true, 
                    cv: true,
                    portfolioLink: true 
                }
            });
            
            if (existingApplication) {
                oldFilePath = fileType === 'cv' 
                    ? (existingApplication.supabaseFilePath || '')
                    : (existingApplication.portfolioLink || '');
            }
        }

        // Generate unique file name
        const timestamp = Date.now();
        const fileName = `${studentNumber}_${fileType}_${timestamp}.pdf`;
        const filePath = `applications/${studentNumber}/${fileName}`;

        // Convert File to ArrayBuffer for Supabase upload
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Upload file to Supabase
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, uint8Array, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'application/pdf'
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return NextResponse.json(
                { error: 'Failed to upload file to storage' },
                { status: 500 }
            );
        }

        // Get signed URL for secure access (works with private buckets) - 24 hours expiration
        const { data: urlData, error: urlError } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(filePath, 86400);

        if (urlError) {
            console.error('Error creating signed URL:', urlError);
            return NextResponse.json(
                { error: 'Failed to create file access URL' },
                { status: 500 }
            );
        }

        // Delete old file if it exists
        if (oldFilePath) {
            try {
                // Extract the file path from the stored path
                const oldPath = oldFilePath.includes('applications/') 
                    ? oldFilePath
                    : `applications/${studentNumber}/${oldFilePath}`;
                
                const { error: deleteError } = await supabase.storage
                    .from(bucketName)
                    .remove([oldPath]);
                
                if (deleteError) {
                    console.error('Error deleting old file:', deleteError);
                } else {
                    console.log('Old file deleted successfully');
                }
            } catch (deleteError) {
                console.error('Error deleting old file:', deleteError);
            }
        }

        // Update existing application if it exists
        if (existingApplication) {
            if (applicationType === 'ea') {
                // Update EA application - only CV is supported for EA
                const updateAppData = {
                    cv: urlData.signedUrl,
                    supabaseFilePath: filePath
                };

                console.log('Updating existing EA application with:', updateAppData);

                await prisma.eAApplication.update({
                    where: { studentNumber },
                    data: updateAppData
                });
            } else {
                // Update committee application - supports both CV and portfolio
                const updateAppData = fileType === 'cv' 
                    ? { 
                        cv: urlData.signedUrl,
                        supabaseFilePath: filePath
                    }
                    : {
                        portfolioLink: urlData.signedUrl,
                        supabaseFilePath: filePath
                    };

                console.log('Updating existing committee application with:', updateAppData);

                await prisma.committeeApplication.update({
                    where: { studentNumber },
                    data: updateAppData
                });
            }
        } else {
            // Don't create a new application here - just return the file URL
            console.log('No existing application found - file uploaded but no application record created yet');
        }

        return NextResponse.json({
            success: true,
            url: urlData.signedUrl,
            filePath: filePath,
            message: 'File uploaded successfully'
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}