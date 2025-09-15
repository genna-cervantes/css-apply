import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

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