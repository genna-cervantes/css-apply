import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Check-existing API: Checking for user:', session.user.email);

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                memberApplication: {
                    select: {
                        id: true
                    }
                },
                committeeApplication: {
                    select: {
                        id: true,
                        firstOptionCommittee: true
                    }
                },
                eaApplication: {
                    select: {
                        id: true,
                        firstOptionEb: true
                    }
                }
            }
        });

        if (!user) {
            console.log('Check-existing API: User not found in database, creating basic record');
            // For new users, create a basic user record if it doesn't exist
            try {
                await prisma.user.create({
                    data: {
                        email: session.user.email,
                        name: session.user.name || "",
                        role: "user",
                    }
                });
                
                console.log('Check-existing API: Created new user record');
                
                const existingApplications = {
                    hasMemberApplication: false,
                    hasCommitteeApplication: false,
                    hasEAApplication: false,
                    applications: {
                        member: null,
                        committee: null,
                        ea: null
                    },
                    ebRole: null,
                    committeeId: null
                };

                return NextResponse.json(existingApplications);
            } catch (createError) {
                console.error('Check-existing API: Error creating user:', createError);
                return NextResponse.json(
                    { error: 'Failed to create user record' },
                    { status: 500 }
                );
            }
        }

        console.log('Check-existing API: User found, checking applications');

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

        console.log('Check-existing API: Returning applications data:', existingApplications);
        return NextResponse.json(existingApplications);
    } catch (error) {
        console.error('Check-existing API: Error checking existing applications:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}