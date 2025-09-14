import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                memberApplication: true,
                committeeApplication: true,
                eaApplication: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const existingApplications = {
            hasMemberApplication: !!user.memberApplication,
            hasCommitteeApplication: !!user.committeeApplication,
            hasEAApplication: !!user.eaApplication,
            applications: {
                member: user.memberApplication,
                committee: user.committeeApplication,
                ea: user.eaApplication
            },
            // ADD these for proper redirects
            ebRole: user.eaApplication?.firstOptionEb,
            committeeId: user.committeeApplication?.firstOptionCommittee
        };

        return NextResponse.json(existingApplications);
    } catch (error) {
        console.error('Error checking existing applications:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}