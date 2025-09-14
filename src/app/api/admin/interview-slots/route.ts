import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all available interview slots
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has admin access
        const userRole = session.user.role;
        const hasAdminAccess = userRole === 'admin' || userRole === 'super_admin';
        
        if (!hasAdminAccess) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const eb = searchParams.get('eb'); // committee or eb role

        const whereClause: any = {};
        if (eb) {
            whereClause.eb = eb;
        }

        const slots = await prisma.availableEBInterviewTime.findMany({
            where: whereClause,
            orderBy: [
                { day: 'asc' },
                { timeStart: 'asc' }
            ]
        });

        return NextResponse.json({
            success: true,
            slots
        });

    } catch (error) {
        console.error('Error fetching interview slots:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST create new interview slot
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has admin access
        const userRole = session.user.role;
        const hasAdminAccess = userRole === 'admin' || userRole === 'super_admin';
        
        if (!hasAdminAccess) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const { eb, day, timeStart, timeEnd, maxSlots } = await request.json();

        if (!eb || !day || !timeStart || !timeEnd || maxSlots === undefined) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if slot already exists
        const existingSlot = await prisma.availableEBInterviewTime.findFirst({
            where: {
                eb,
                day,
                timeStart,
                timeEnd
            }
        });

        if (existingSlot) {
            return NextResponse.json(
                { error: 'Time slot already exists' },
                { status: 400 }
            );
        }

        const newSlot = await prisma.availableEBInterviewTime.create({
            data: {
                eb,
                day,
                timeStart,
                timeEnd,
                maxSlots: parseInt(maxSlots),
                currentSlots: 0
            }
        });

        return NextResponse.json({
            success: true,
            slot: newSlot,
            message: 'Interview slot created successfully'
        });

    } catch (error) {
        console.error('Error creating interview slot:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT update interview slot
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has admin access
        const userRole = session.user.role;
        const hasAdminAccess = userRole === 'admin' || userRole === 'super_admin';
        
        if (!hasAdminAccess) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const { slotId, maxSlots, isUnavailable } = await request.json();

        if (!slotId) {
            return NextResponse.json(
                { error: 'Slot ID is required' },
                { status: 400 }
            );
        }

        const updateData: any = {};
        
        if (maxSlots !== undefined) {
            updateData.maxSlots = parseInt(maxSlots);
        }
        
        if (isUnavailable !== undefined) {
            updateData.maxSlots = isUnavailable ? 0 : updateData.maxSlots || 1;
        }

        const updatedSlot = await prisma.availableEBInterviewTime.update({
            where: { id: slotId },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            slot: updatedSlot,
            message: 'Interview slot updated successfully'
        });

    } catch (error) {
        console.error('Error updating interview slot:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE interview slot
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has admin access
        const userRole = session.user.role;
        const hasAdminAccess = userRole === 'admin' || userRole === 'super_admin';
        
        if (!hasAdminAccess) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const slotId = searchParams.get('slotId');

        if (!slotId) {
            return NextResponse.json(
                { error: 'Slot ID is required' },
                { status: 400 }
            );
        }

        // Check if slot has current bookings
        const slot = await prisma.availableEBInterviewTime.findUnique({
            where: { id: slotId }
        });

        if (!slot) {
            return NextResponse.json(
                { error: 'Slot not found' },
                { status: 404 }
            );
        }

        if (slot.currentSlots > 0) {
            return NextResponse.json(
                { error: 'Cannot delete slot with existing bookings' },
                { status: 400 }
            );
        }

        await prisma.availableEBInterviewTime.delete({
            where: { id: slotId }
        });

        return NextResponse.json({
            success: true,
            message: 'Interview slot deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting interview slot:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}