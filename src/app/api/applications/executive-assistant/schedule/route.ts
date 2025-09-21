import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { emailTemplates, sendEmail, getEBEmail } from '@/lib/email';
import { getPositionTitle } from '@/lib/eb-mapping';
import { roles } from '@/data/ebRoles';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            studentNumber,
            interviewSlotDay,
            interviewSlotTimeStart,
            interviewSlotTimeEnd,
            ebRole,
            interviewBy
        } = await request.json();

        if (!studentNumber || !interviewSlotDay || !interviewSlotTimeStart || !interviewSlotTimeEnd || !ebRole || !interviewBy) {
            return NextResponse.json(
                { error: 'All schedule fields are required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { eaApplication: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.eaApplication) {
            return NextResponse.json(
                { error: 'EA application not found' },
                { status: 400 }
            );
        }

        const updatedApplication = await prisma.eAApplication.update({
            where: { studentNumber },
            data: {
                interviewSlotDay,
                interviewSlotTimeStart,
                interviewSlotTimeEnd,
                interviewBy
            },
        });

        // Send email notification with meeting link when schedule is selected
        try {
            // Get the EB profile for the interviewer to get their meeting link
            // Convert EB role ID to position title for the query
            const positionTitle = getPositionTitle(interviewBy);
            console.log('Looking for EB profile:', { interviewBy, positionTitle });
            const ebProfile = await prisma.eBProfile.findFirst({
                where: { 
                    position: positionTitle 
                }
            });

            const meetingLink = ebProfile?.meetingLink || null;
            console.log('EB profile found:', { ebProfile: ebProfile?.position, meetingLink });

            // Send email to applicant
            const emailTemplate = emailTemplates.executiveAssistantApplication(
                user.name ?? 'Applicant',
                user.eaApplication.studentNumber,
                user.eaApplication.ebRole,
                user.eaApplication.firstOptionEb,
                user.eaApplication.secondOptionEb,
                meetingLink || undefined,
                interviewBy
            );
            await sendEmail(user.email, emailTemplate.subject, emailTemplate.html);
            console.log('Executive Assistant schedule confirmation email sent to:', user.email);

            // Send email notification to EB interviewer
            try {
                const ebRole = roles.find(r => r.id === interviewBy);
                const ebName = ebRole?.ebName || interviewBy;
                const ebEmail = getEBEmail(interviewBy);
                
                // Format interview date and time
                const interviewDate = new Date(interviewSlotDay).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                const interviewTime = `${interviewSlotTimeStart} - ${interviewSlotTimeEnd}`;

                const ebEmailTemplate = emailTemplates.ebInterviewNotificationEA(
                    ebName,
                    user.name ?? 'Applicant',
                    user.eaApplication.studentNumber,
                    user.eaApplication.ebRole,
                    interviewDate,
                    interviewTime,
                    meetingLink || undefined
                );
                
                await sendEmail(ebEmail, ebEmailTemplate.subject, ebEmailTemplate.html);
                console.log('EB interview notification email sent to:', ebEmail);
            } catch (ebEmailError) {
                console.error('Failed to send EB interview notification email:', ebEmailError);
            }
        } catch (emailError) {
            console.error('Failed to send executive assistant schedule confirmation email:', emailError);
        }

        return NextResponse.json({
            success: true,
            application: updatedApplication,
            message: 'Interview schedule updated successfully'
        });

    } catch (error) {
        console.error('Schedule update error:', error);
        
        if (error instanceof Error && error.message.includes('Record to update not found')) {
            return NextResponse.json(
                { error: 'EA application not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}