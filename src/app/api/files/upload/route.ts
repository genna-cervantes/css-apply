// src/app/api/upload/route.ts
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

        console.log('Session found for user:', session.user.email);

        // Parse the form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const studentNumber = formData.get('studentNumber') as string;
        const fileType = formData.get('fileType') as string;
        const section = formData.get('section') as string; // Get section from form data
        
        console.log('Parsed data:', { studentNumber, fileType, section, file: file ? file.name : 'none' });

        if (!file || !studentNumber || !fileType) {
            console.error('Missing required fields:', { file: !!file, studentNumber: !!studentNumber, fileType: !!fileType });
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

        // Check if user exists by email (not student number)
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, email: true, studentNumber: true, section: true }
        });

        console.log('User found:', user);

        if (!user) {
            console.error('User not found for email:', session.user.email);
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Update the user with the student number and section if they're not already set
        const updateData: any = {};
            if (!user.studentNumber) {
            updateData.studentNumber = studentNumber;
        }
        if (section && !user.section) {
            updateData.section = section;
        }

        if (Object.keys(updateData).length > 0) {
            console.log('Updating user with:', updateData);
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

        // Check if user already has a file of this type
        const application = await prisma.committeeApplication.findUnique({
            where: { studentNumber },
            select: { 
                supabaseFilePath: true, 
                portfolioLink: true 
            }
        });

        console.log('Existing application:', application);

        let oldFilePath = '';
            if (application) {
            oldFilePath = fileType === 'cv' 
                ? (application.supabaseFilePath || '')
                : (application.portfolioLink || '');
        }

        console.log('Old file path to delete:', oldFilePath);

        // Generate unique file name
        const timestamp = Date.now();
        const fileName = `${studentNumber}_${fileType}_${timestamp}.pdf`;
        const filePath = `applications/${studentNumber}/${fileName}`;

        console.log('New file path:', filePath);

        // Convert File to ArrayBuffer for Supabase upload
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Upload file to Supabase
        console.log('Uploading to Supabase...');
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('committee-applications')
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

        console.log('Supabase upload successful:', uploadData);

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('committee-applications')
            .getPublicUrl(filePath);

        console.log('Public URL:', urlData.publicUrl);

        // Delete old file if it exists
        if (oldFilePath) {
            try {
                // Extract the file path from the stored path
                const oldPath = oldFilePath.includes('applications/') 
                ? oldFilePath
                : `applications/${studentNumber}/${oldFilePath}`;
                
                console.log('Deleting old file:', oldPath);
                const { error: deleteError } = await supabase.storage
                .from('committee-applications')
                .remove([oldPath]);
                
                if (deleteError) {
                console.error('Error deleting old file:', deleteError);
                } else {
                console.log('Old file deleted successfully');
                }
            } catch (deleteError) {
                console.error('Error deleting old file:', deleteError);
                // Continue even if deletion fails
            }
        }

        // Check if committee application already exists
        const existingApplication = await prisma.committeeApplication.findUnique({
            where: { studentNumber }
        });

        let updatedApplication;
        if (existingApplication) {
        // Update existing application
        const updateAppData = fileType === 'cv' 
            ? { 
                cv: urlData.publicUrl,
                supabaseFilePath: filePath
            }
            : {
                portfolioLink: urlData.publicUrl,
                supabaseFilePath: filePath
            };

        console.log('Updating application with:', updateAppData);

        updatedApplication = await prisma.committeeApplication.update({
            where: { studentNumber },
            data: updateAppData
        });
        } else {
        // Create new application with minimal data
        const createData = {
            studentNumber,
            cv: fileType === 'cv' ? urlData.publicUrl : '',
            portfolioLink: fileType === 'portfolio' ? urlData.publicUrl : '',
            supabaseFilePath: filePath,
            firstOptionCommittee: '', // Will be filled in later
            secondOptionCommittee: '', // Will be filled in later
            interviewSlotDay: '',
            interviewSlotTimeStart: '',
            interviewSlotTimeEnd: '',
            hasAccepted: false,
            hasFinishedInterview: false,
        };

        console.log('Creating new application with:', createData);

        updatedApplication = await prisma.committeeApplication.create({
            data: createData
        });
        }

        console.log('Application updated successfully:', updatedApplication);

        return NextResponse.json({
        success: true,
        url: urlData.publicUrl,
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