import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        console.log('API endpoint called: /api/applications/ea/complete')
        
        const session = await getServerSession(authOptions)
        
        if (!session || !session.user || !session.user.email) {
        console.log('No session found')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('Session user email:', session.user.email)

        const body = await request.json()
        console.log('Received data:', body)

        const {
            studentNumber,
            section,
            firstName,
            lastName,
            firstOptionEb,
            secondOptionEb,
            cv,
            portfolioLink,
        } = body

        // Validate required fields
        if (!studentNumber || !section || !firstName || !lastName || !firstOptionEb || !secondOptionEb || !cv || !portfolioLink) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            )
        }

        // Validate student number format
        // REF: walang gantong validatin sa iba?
        const studentNumberRegex = /^\d{10}$/
        if (!studentNumberRegex.test(studentNumber)) {
        return NextResponse.json(
            { error: 'Student number must be exactly 10 digits' },
            { status: 400 }
        )
        }

        // Check if student number is already taken by another user
        const existingUserWithStudentNumber = await prisma.user.findUnique({
        where: { studentNumber },
        })

        if (existingUserWithStudentNumber && existingUserWithStudentNumber.email !== session.user.email) {
            return NextResponse.json(
                { error: 'Student number already registered by another user. Contact the EBs in case of issues.' },
                { status: 400 }
            )
        }

        // Create or update user profile
        console.log('Creating/updating user profile...')
        const user = await prisma.user.upsert({
            where: { email: session.user.email },
            update: {
                studentNumber,
                section,
                name: `${firstName} ${lastName}`.trim(),
            },
            create: {
                email: session.user.email,
                studentNumber,
                section,
                name: `${firstName} ${lastName}`.trim(),
            },
        })

        console.log('User profile created/updated:', user)

        // Check if user already applied for EA
        const existingApplication = await prisma.eAApplication.findUnique({
            where: { studentNumber: user.studentNumber },
        })

        if (existingApplication) {
            console.log('User already applied for EA - redirecting to status')
            return NextResponse.json({ 
                redirect: '/apply/ea/status',
                message: 'You have already applied for an EA position!' 
            }, { status: 303 })
        }

        // REF: asan ung validation for overlapping schedule?
        // Create EA application
        console.log('Creating EA application...')
        const application = await prisma.eAApplication.create({
            data: {
                studentNumber: user.studentNumber,
                firstOptionEb,
                secondOptionEb,
                cv: cv,
                portfolioLink,
                interviewSlotDay: 'TBD',
                interviewSlotTimeStart: 'TBD',
                interviewSlotTimeEnd: 'TBD',
            },
        })

        console.log('Application created successfully:', application)

        return NextResponse.json(application, { status: 201 })
        
    } catch (error) {
        console.error('Error in API endpoint:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}