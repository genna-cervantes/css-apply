import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            studentNumber,
            firstName,
            lastName,
            section,
            ebRole,
            firstOptionEb,
            secondOptionEb,
            cv,
            supabaseFilePath
        } = await request.json();

        if (
            !studentNumber ||
            !section ||
            !ebRole ||
            !firstOptionEb ||
            !secondOptionEb ||
            !cv
        ) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (!/^\d{10}$/.test(studentNumber)) {
            return NextResponse.json(
                { error: 'Student number must be 10 digits' },
                { status: 400 }
            );
        }

        const existingUserWithSN = await prisma.user.findUnique({
            where: { studentNumber },
        });

        if (existingUserWithSN && existingUserWithSN.email !== session.user.email) {
            return NextResponse.json(
                { error: 'This student number is already registered by another user' },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                studentNumber,
                section,
                name: `${firstName} ${lastName}`.trim(),
            },
        });

        const existingApplication = await prisma.eAApplication.findUnique({
            where: { studentNumber },
        });

        if (!existingApplication) {
            await prisma.eAApplication.create({
                data: {
                    studentNumber,
                    ebRole,
                    firstOptionEb,
                    secondOptionEb,
                    cv,
                    supabaseFilePath: supabaseFilePath || cv,
                    interviewSlotDay: "",
                    interviewSlotTimeStart: "",
                    interviewSlotTimeEnd: "",
                    hasFinishedInterview: false,
                    status: null,
                    redirection: null,
                    hasAccepted: false,
                },
            });
        } else {
            if (existingApplication.hasAccepted) {
                return NextResponse.json(
                    { error: 'You already have an accepted EA application' },
                    { status: 400 }
                );
            }

            // Update existing non-accepted application
            await prisma.eAApplication.update({
                where: { studentNumber },
                data: {
                    ebRole,
                    firstOptionEb,
                    secondOptionEb,
                    cv,
                    supabaseFilePath: supabaseFilePath || cv,
                },
            });
        }

        // Send confirmation email
        try {
            const emailTemplate = emailTemplates.executiveAssistantApplication(
                updatedUser.name, 
                studentNumber, 
                ebRole, 
                firstOptionEb, 
                secondOptionEb
            );
            await sendEmail(updatedUser.email, emailTemplate.subject, emailTemplate.html);
            console.log('Executive Assistant application confirmation email sent to:', updatedUser.email);
        } catch (emailError) {
            console.error('Failed to send executive assistant application confirmation email:', emailError);
            // Don't fail the application submission if email fails
        }

        return NextResponse.json({
            success: true,
            user: updatedUser,
            message: 'EA application submitted successfully. Please proceed to schedule your interview.',
        });
    } catch (error) {
        console.error('EA application error:', error);
        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return NextResponse.json(
                { error: 'This student number already has an application' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { eaApplication: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch meeting link from EBProfile if interviewBy is set
        let meetingLink = null;
        if (user.eaApplication?.interviewBy) {
            // Import the mapping function
            const { getPositionTitle } = await import('@/lib/eb-mapping');
            
            // Convert EB role ID to position title for database lookup
            const positionTitle = getPositionTitle(user.eaApplication.interviewBy);
            
            const ebProfile = await prisma.eBProfile.findFirst({
                where: { 
                    position: positionTitle 
                }
            });
            meetingLink = ebProfile?.meetingLink || null;
        }

        return NextResponse.json({ 
            hasApplication: !!user.eaApplication,
            application: user.eaApplication,
            user: {
                studentNumber: user.studentNumber,
                name: user.name,
                section: user.section
            },
            ebRole: user.eaApplication?.ebRole,
            meetingLink: meetingLink
        });
        
    } catch (error) {
        console.error('Get EA Application error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user data
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { eaApplication: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.eaApplication) {
            return NextResponse.json({ error: 'No application found' }, { status: 404 });
        }

        // Delete files from Supabase storage if they exist
        try {
            if (user.eaApplication.supabaseFilePath) {
                await supabase.storage
                .from('ea-applications')
                .remove([user.eaApplication.supabaseFilePath]);
            }
        } catch (storageError) {
            console.error('Error deleting files from storage:', storageError);
            // Continue with application deletion even if file deletion fails
        }

        // Delete the EA application
        await prisma.eAApplication.delete({
            where: { studentNumber: user.studentNumber! }
        });

        // Reset user's application-related fields (optional)
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                studentNumber: null,
                section: null
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Application deleted successfully'
        });

    } catch (error) {
        console.error('Delete application error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}