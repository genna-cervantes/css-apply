import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            firstOptionCommittee,
            secondOptionCommittee,
            portfolioLink,
            cv,
            interviewSlotDay,
            interviewSlotTimeStart,
            interviewSlotTimeEnd,
        } = body

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // REF: should check for all types of applications
        // REF: check for null values para walang error
        // Check if user already applied

        const existingApplication = await prisma.committeeApplication.findUnique({
            where: { studentNumber: user.studentNumber },
        })

        if (existingApplication) {
            return NextResponse.json({ error: 'Already applied for a committee position.' }, { status: 400 })
        }

        // Create Committee application
        const application = await prisma.committeeApplication.create({
        data: {
            studentNumber: user.studentNumber,
            firstOptionCommittee,
            secondOptionCommittee,
            portfolioLink,
            cv,
            interviewSlotDay,
            interviewSlotTimeStart,
            interviewSlotTimeEnd,
        },
        })

        // Send confirmation email
        await sendEmail(
            session.user.email!,
            'EA Application Received',
            `<p>Thank you for applying as Committee Staff. We will review your application and contact you soon.</p>`
        )

        return NextResponse.json(application, { status: 201 })
        
    } catch (error) {
        console.error('Committee Application error:', error)
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
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get Committee application
        const application = await prisma.committeeApplication.findUnique({
            where: { studentNumber: user.studentNumber },
        })

        return NextResponse.json(application)
    } catch (error) {
        console.error('Get Committee Application error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}