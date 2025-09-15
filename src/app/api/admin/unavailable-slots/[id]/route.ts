import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// GET unavailable slots for admin view
export async function GET(request: NextRequest, { params }: { params: Promise<{ eb: string }> }) {  
    try {
        const session = await getServerSession(authOptions)
        
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { eb } = await params

        const unavailableSlots = await prisma.availableEBInterviewTime.findMany({
            where: {
                ...(eb && { eb })
            },
            orderBy: [
                { day: 'asc' },
                { timeStart: 'asc' }
            ]
        })

        const unavailableSlotsData = unavailableSlots.map((slot) => ({
            id: slot.id,
            date: slot.day,
            timeSlot: `${slot.timeStart}-${slot.timeEnd}`,
            startTime: slot.timeStart,
            endTime: slot.timeEnd
        }))

        return NextResponse.json({ unavailableSlotsData })

    } catch (error) {
        console.error('Error fetching unavailable slots:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}