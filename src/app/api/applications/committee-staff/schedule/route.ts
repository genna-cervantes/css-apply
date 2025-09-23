import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { emailTemplates, sendEmailWithValidation, getEBEmail } from '@/lib/email';
import { getPositionTitle, getRoleId } from '@/lib/eb-mapping';
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
            interviewBy
        } = await request.json();

        if (!studentNumber || !interviewSlotDay || !interviewSlotTimeStart || !interviewSlotTimeEnd || !interviewBy) {
            return NextResponse.json(
                { error: 'All schedule fields are required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { committeeApplication: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.committeeApplication) {
            return NextResponse.json(
                { error: 'Committee application not found' },
                { status: 400 }
            );
        }

        // Check for slot conflicts before updating
        const existingBookings = await prisma.committeeApplication.findMany({
            where: {
                AND: [
                    { interviewSlotDay },
                    { interviewSlotTimeStart },
                    { interviewSlotTimeEnd },
                    { interviewBy },
                    { studentNumber: { not: studentNumber } } // Exclude current user
                ]
            }
        });

        if (existingBookings.length > 0) {
            console.log(`Slot conflict detected for Committee application: ${studentNumber} trying to book ${interviewSlotDay} ${interviewSlotTimeStart}-${interviewSlotTimeEnd} with ${interviewBy}`);
            return NextResponse.json(
                { 
                    error: 'This time slot is no longer available. Please select another time slot.',
                    conflict: true 
                },
                { status: 409 }
            );
        }

        const updatedApplication = await prisma.committeeApplication.update({
            where: { studentNumber },
            data: {
                interviewBy,
                interviewSlotDay,
                interviewSlotTimeStart,
                interviewSlotTimeEnd
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
            const emailTemplate = emailTemplates.committeeApplication(
                user.name ?? 'Applicant',
                user.committeeApplication.studentNumber,
                user.committeeApplication.firstOptionCommittee,
                user.committeeApplication.secondOptionCommittee,
                meetingLink || undefined,
                interviewBy
            );
            await sendEmailWithValidation(user.email, emailTemplate.subject, emailTemplate.html, 'Committee Staff applicant confirmation');

            // Send email notification to EB interviewer with enhanced error handling
            try {
                // Convert position title to role ID if needed
                const roleId = getRoleId(interviewBy);
                console.log(`Converting interviewBy "${interviewBy}" to roleId "${roleId}"`);
                
                const ebRole = roles.find(r => r.id === roleId);
                const ebName = ebRole?.ebName || interviewBy;
                const ebEmail = getEBEmail(roleId, `Committee Staff interview notification for ${user.name}`);
                
                // Format interview date and time
                const interviewDate = new Date(interviewSlotDay).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                const interviewTime = `${interviewSlotTimeStart} - ${interviewSlotTimeEnd}`;

                const ebEmailTemplate = emailTemplates.ebInterviewNotificationCommittee(
                    ebName,
                    user.name ?? 'Applicant',
                    user.committeeApplication.studentNumber,
                    user.committeeApplication.firstOptionCommittee,
                    interviewDate,
                    interviewTime,
                    meetingLink || undefined
                );
                
                await sendEmailWithValidation(ebEmail, ebEmailTemplate.subject, ebEmailTemplate.html, `Committee Staff interview notification to ${ebName}`);
            } catch (ebEmailError) {
                console.error('CRITICAL: Failed to send EB interview notification email:', ebEmailError);
                // Don't fail the entire request, but log this as a critical error
                // The admin should be notified about this failure
            }
        } catch (emailError) {
            console.error('Failed to send committee staff schedule confirmation email:', emailError);
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
                { error: 'Committee application not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}