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
            firstName,
            lastName,
            section,
            firstOptionCommittee,
            secondOptionCommittee,
            cv,
            portfolio,
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
                name: `${firstName} ${lastName}`.trim(), // Sync full name
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
                    interviewSlotDay: "",
                    interviewSlotTimeStart: "",
                    interviewSlotTimeEnd: "",
                    hasAccepted: false,
                    hasFinishedInterview: false,
                    status: null,
                    redirection: null,
                },
            });
        } else {
            if (existingApplication.hasAccepted) {
                return NextResponse.json(
                    { error: 'You already have an accepted committee application' },
                    { status: 400 }
                );
            }

        // Update existing non-accepted application
        await prisma.committeeApplication.update({
            where: { studentNumber },
            data: {
            firstOptionCommittee,
            secondOptionCommittee,
            cv,
            portfolioLink: portfolio || null,
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
            include: { committeeApplication: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            hasApplication: !!user.committeeApplication,
            application: user.committeeApplication,
            user: {
                studentNumber: user.studentNumber,
                name: user.name,
                section: user.section
            }
        });
        
    } catch (error) {
        console.error('Get Committee Application error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}