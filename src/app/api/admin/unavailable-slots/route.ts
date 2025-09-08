// app/api/admin/unavailable-slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// POST to mark unavailable times (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { eb, day, timeStart, timeEnd } = await request.json()

        if (!eb || !day || !timeStart || !timeEnd) {
            return NextResponse.json(
                { error: 'Committee, day, startTime, and endTime are required' },
                { status: 400 }
            )
        }

        // Create unavailable slot (maxSlots = 0 indicates unavailable)
        const unavailableSlot = await prisma.availableEBInterviewTime.create({
            data: {
                eb,
                day,
                timeStart,
                timeEnd,
                maxSlots: 0,
                currentSlots: 0
            }
        })

        return NextResponse.json({ 
            success: true, 
            unavailableSlot,
            message: 'Unavailable time marked successfully' 
        })

    } catch (error) {
        console.error('Error creating unavailable slot:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
    }

    // GET unavailable slots for admin view
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const committee = searchParams.get('committee')

        const unavailableSlots = await prisma.availableEBInterviewTime.findMany({
            where: {
                maxSlots: 0, // Only get unavailable slots
                ...(committee && { eb: committee })
            },
            orderBy: [
                { day: 'asc' },
                { timeStart: 'asc' }
            ]
        })

        return NextResponse.json({ unavailableSlots })

    } catch (error) {
        console.error('Error fetching unavailable slots:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}