import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

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
            firstOptionCommittee,
            secondOptionCommittee,
            cv,
            portfolio,
            supabaseFilePath
        } = await request.json();

        if (
            !studentNumber ||
            !section ||
            !firstOptionCommittee ||
            !secondOptionCommittee ||
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

        const existingApplication = await prisma.committeeApplication.findUnique({
            where: { studentNumber },
        });

        if (!existingApplication) {
            await prisma.committeeApplication.create({
                data: {
                    studentNumber,
                    firstOptionCommittee,
                    secondOptionCommittee,
                    cv,
                    portfolioLink: portfolio || null,
                    supabaseFilePath: supabaseFilePath || cv,
                    interviewSlotDay: "",
                    interviewSlotTimeStart: "",
                    interviewSlotTimeEnd: "",
                    hasAccepted: false,
                    hasFinishedInterview: false,
                    status: null,
                    redirection: null,
                },
            });

                // Application created successfully - email will be sent when schedule is selected
        } else {
            if (existingApplication.hasAccepted) {
                return NextResponse.json(
                    { error: 'You already have an accepted committee application' },
                    { status: 400 }
                );
            }

            // Update existing non-accepted application (NO EMAIL SENT)
            await prisma.committeeApplication.update({
                where: { studentNumber },
                data: {
                    firstOptionCommittee,
                    secondOptionCommittee,
                    cv,
                    portfolioLink: portfolio || null, 
                    supabaseFilePath: supabaseFilePath || cv,
                },
            });
        }

        return NextResponse.json({
            success: true,
            user: updatedUser,
            message: 'Committee application submitted successfully. Please proceed to schedule your interview.',
        });
    } catch (error) {
        console.error('Committee application error:', error);
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

export async function GET() {
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
            include: { committeeApplication: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let meetingLink = null;
        if (user.committeeApplication?.interviewBy) {
            const { getPositionTitle } = await import('@/lib/eb-mapping');
            
            const positionTitle = getPositionTitle(user.committeeApplication.interviewBy);
            
            const ebProfile = await prisma.eBProfile.findFirst({
                where: { 
                    position: positionTitle 
                }
            });
            meetingLink = ebProfile?.meetingLink || null;
        }

        return NextResponse.json({ 
            hasApplication: !!user.committeeApplication,
            application: user.committeeApplication,
            user: {
                studentNumber: user.studentNumber,
                name: user.name,
                section: user.section
            },
            meetingLink: meetingLink
        });
        
    } catch (error) {
        console.error('Get Committee Application error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user data
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { committeeApplication: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.committeeApplication) {
            return NextResponse.json({ error: 'No application found' }, { status: 404 });
        }

        // Delete files from Supabase storage if they exist
        try {
            if (user.committeeApplication.supabaseFilePath) {
                await supabase.storage
                .from('committee-applications')
                .remove([user.committeeApplication.supabaseFilePath]);
            }

            // Also check if there's a portfolio file to delete
            if (user.committeeApplication.portfolioLink) {
                const portfolioPath = user.committeeApplication.portfolioLink.split('/').slice(-2).join('/');
                await supabase.storage
                .from('committee-applications')
                .remove([portfolioPath]);
            }
        } catch (storageError) {
            console.error('Error deleting files from storage:', storageError);
        // Continue with application deletion even if file deletion fails
        }

        // Delete the committee application
        await prisma.committeeApplication.delete({
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