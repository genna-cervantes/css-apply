import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session || !session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { studentNumber, firstName, lastName, section, fullName } = await request.json()

        if (!studentNumber || !firstName || !lastName || !section) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            )
        }

        if (!/^\d{10}$/.test(studentNumber)) {
            return NextResponse.json(
                { error: 'Student number must be 10 digits' },
                { status: 400 }
            )
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

        const existingApplication = await prisma.memberApplication.findUnique({
            where: { studentNumber },
        })

        if (existingApplication) {
            return NextResponse.json(
                { error: 'You already have a pending member application' },
                { status: 400 }
            )
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                studentNumber,
                name: fullName,
                section,
            },
        })

        const application = await prisma.memberApplication.create({
            data: {
                studentNumber,
                paymentProof: "", // Empty initially, will be updated after payment
                hasAccepted: false,
            },
        })

        
        return NextResponse.json({ 
            success: true, 
            user: updatedUser,
            application,
            message: 'Application submitted successfully. Please proceed to payment.' 
        })

    } catch (error) {
        console.error('Member application error:', error)
        // Handle unique constraint violation
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

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user from database
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