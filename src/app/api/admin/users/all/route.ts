import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userRole = session.user.role;
        const isSuperAdmin = userRole === 'super_admin' || userRole === 'super-admin';
        
        if (!isSuperAdmin) {
            return NextResponse.json(
                { error: 'Forbidden - Super admin access required' },
                { status: 403 }
            );
        }

        // Get pagination parameters from URL
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const totalCount = await prisma.user.count();

        // Fetch users with their EB profiles (paginated)
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                studentNumber: true,
                section: true,
                createdAt: true,
                ebProfile: {
                select: {
                    position: true,
                    committees: true,
                    isActive: true,
                }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: skip,
            take: limit
        });

        return NextResponse.json({
            success: true,
            users: users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount: totalCount,
                limit: limit,
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPreviousPage: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}