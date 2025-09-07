import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        console.log('Schedule API endpoint called')
        
        const session = await getServerSession(authOptions)
        
        if (!session || !session.user || !session.user.email) {
            console.log('No session found')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        console.log('Received data:', body)

        const { scheduleId, scheduleTime } = body

        if (!scheduleId || !scheduleTime) {
            return NextResponse.json({ error: 'Schedule data required' }, { status: 400 })
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Parse schedule time
        const [date, start, end] = scheduleTime.split(' - ')
        console.log('Parsed:', { date, start, end })

        // Update application
        // REF: naka store na agad kahit di pa complete?
        const application = await prisma.eAApplication.update({
            where: { studentNumber: user.studentNumber },
            data: {
                interviewSlotDay: date,
                interviewSlotTimeStart: start,
                interviewSlotTimeEnd: end,
            },
        })

        console.log('Updated application:', application)

        return NextResponse.json(application)

    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}