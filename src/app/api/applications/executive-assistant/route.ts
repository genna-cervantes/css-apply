import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            console.log('No session found')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            firstOptionEb,
            secondOptionEb,
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

        // Check if user already applied
        const existingApplication = await prisma.eAApplication.findUnique({
            where: { studentNumber: user.studentNumber },
        })

        if (existingApplication) {
            return NextResponse.json({ error: 'Already applied for an EA position.' }, { status: 400 })
        }

        // Create EA application
        const application = await prisma.eAApplication.create({
            data: {
                studentNumber: user.studentNumber,
                firstOptionEb,
                secondOptionEb,
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
            `<p>Thank you for applying as an Executive Associate. We will review your application and contact you soon.</p>`
        )

        return NextResponse.json(application, { status: 201 })
        
    } catch (error) {
        console.error('EA Application error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json(null) // No user, no application
        }

        // Get EA application
        const application = await prisma.eAApplication.findUnique({
            where: { studentNumber: user.studentNumber },
        })

        return NextResponse.json(application) // This returns null if no application exists
        
    } catch (error) {
        console.error('Get EA Application error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}