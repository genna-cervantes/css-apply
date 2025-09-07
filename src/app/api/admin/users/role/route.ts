import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        
        if (!session) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
        }

        // Check if user has super_admin role
        const userRole = session.user.role;
        const isSuperAdmin = userRole === 'super_admin' || userRole === 'super-admin';
        
        if (!isSuperAdmin) {
        return NextResponse.json(
            { error: 'Forbidden - Super admin access required' },
            { status: 403 }
        );
        }

        const body = await request.json();
        const { userId, role } = body;

        if (!userId || !role) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        );
        }

        // Validate role
        const validRoles = ['user', 'admin', 'super_admin', 'super-admin', 'eb'];
        if (!validRoles.includes(role)) {
        return NextResponse.json(
            { error: 'Invalid role' },
            { status: 400 }
        );
        }

        // Update user role
        const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        }
        });

        return NextResponse.json({
        success: true,
        user: updatedUser
        });

    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}