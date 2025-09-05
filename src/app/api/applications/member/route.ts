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
        const { paymentProof } = body

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if user already applied
        const existingApplication = await prisma.memberApplication.findUnique({
            where: { studentNumber: user.studentNumber },
        })

        if (existingApplication) {
            return NextResponse.json({ error: 'Already applied' }, { status: 400 })
        }

        // Create Member application
        const application = await prisma.memberApplication.create({
            data: {
                studentNumber: user.studentNumber,
                paymentProof,
            },
        })

        // Send confirmation email
        await sendEmail(
            session.user.email!,
            'Membership Application Received',
            `<p>Thank you for applying for CSS Membership. Welcome to the Computer Science Society!</p>`
        )

        return NextResponse.json(application, { status: 201 })

    } catch (error) {
        console.error('Member Application error:', error)
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

        // Get Member application
        const application = await prisma.memberApplication.findUnique({
            where: { studentNumber: user.studentNumber },
        })

        return NextResponse.json(application)
    } catch (error) {
        console.error('Get Member Application error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}