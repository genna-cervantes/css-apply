// src/app/api/applications/member/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session || !session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // We no longer destructure firstName, lastName, or fullName
        const { studentNumber, section } = await request.json()

        if (!studentNumber || !section) {
            return NextResponse.json(
                { error: 'Student number and section are required' },
                { status: 400 }
            )
        }

        if (!/^\d{10}$/.test(studentNumber)) {
            return NextResponse.json(
                { error: 'Student number must be 10 digits' },
                { status: 400 }
            )
        }

        // Check if student number is already used by another user
        const existingUserWithSN = await prisma.user.findUnique({
            where: { studentNumber },
        });

        if (existingUserWithSN && existingUserWithSN.email !== session.user.email) {
            return NextResponse.json(
                { error: 'This student number is already registered by another user' },
                { status: 400 }
            );
        }

        // Check for existing application
        const existingApplication = await prisma.memberApplication.findUnique({
            where: { studentNumber },
        })

        if (existingApplication && existingApplication.hasAccepted) {
            return NextResponse.json(
                { error: 'You already have an accepted member application' },
                { status: 400 }
            )
        }

        // Update the User record with the latest info
        // This saves their progress even if they don't complete payment
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                studentNumber,
                section,
                // We do not update the name here, as it comes from Google
            },
        })

        // If no application exists or the existing one is not accepted, create/update it
        let application;
        if (!existingApplication) {
            application = await prisma.memberApplication.create({
                data: {
                    studentNumber,
                    paymentProof: "", // Empty initially
                    hasAccepted: false,
                },
            })
        } else {
            // If application exists but is not accepted, we can update it (e.g., reset paymentProof if needed)
            // For now, we'll just return the existing one
            application = existingApplication;
        }

        return NextResponse.json({ 
            success: true, 
            user: updatedUser,
            application,
            message: 'Application info saved. Please proceed to payment.' 
        })

    } catch (error) {
        console.error('Member application error:', error)
        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return NextResponse.json(
                { error: 'This student number already has an application' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { memberApplication: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ 
            hasApplication: !!user.memberApplication,
            application: user.memberApplication,
            user: {
                studentNumber: user.studentNumber,
                name: user.name,
                section: user.section
            }
        })
        
    } catch (error) {
        console.error('Get Member Application error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}