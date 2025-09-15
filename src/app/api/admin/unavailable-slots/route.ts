// app/api/admin/unavailable-slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// POST to mark unavailable times (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const unavailableSlots: { id: string, eb: string, day: string, timeStart: string, timeEnd: string }[] = await request.json()

        const unavailableSlotsData = unavailableSlots.map((slot) => ({
            id: slot.id,
            eb: slot.eb,
            day: slot.day,
            timeStart: slot.timeStart,
            timeEnd: slot.timeEnd,
            maxSlots: 0,
            currentSlots: 0
        }))

        // Get current unavailable slots for this EB from database
        const currentDbSlots = await prisma.availableEBInterviewTime.findMany({
            where: {
                eb: unavailableSlots[0]?.eb, // Get EB from first slot
                maxSlots: 0 // Only unavailable slots
            }
        })

        console.log('currentDbSlots', currentDbSlots);

        // Get IDs of slots being passed in
        const incomingSlotIds = unavailableSlots.map(slot => slot.id)
        
        // Find slots that exist in DB but not in incoming data (these should be deleted)
        const slotsToDelete = currentDbSlots.filter(dbSlot => 
            !incomingSlotIds.includes(dbSlot.id)
        )

        console.log('slotsToDelete', slotsToDelete);

        // Delete removed slots
        if (slotsToDelete.length > 0) {
            await prisma.availableEBInterviewTime.deleteMany({
                where: {
                    id: {
                        in: slotsToDelete.map(slot => slot.id)
                    }
                }
            })
        }
        await prisma.availableEBInterviewTime.createMany({
            data: unavailableSlotsData,
            skipDuplicates: true
        })

        console.log('unavailableSlotsData', unavailableSlotsData);

        return NextResponse.json({ 
            success: true, 
            unavailableSlotsData,
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