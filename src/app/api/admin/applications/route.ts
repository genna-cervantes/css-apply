import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all applications with filtering
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
        const type = searchParams.get('type'); // member, committee, ea
        const status = searchParams.get('status'); // pending, accepted, rejected
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        let applications = [];
        let totalCount = 0;

        if (type === 'member') {
            const whereClause: any = {};
            if (status) {
                whereClause.hasAccepted = status === 'accepted';
            }

            applications = await prisma.memberApplication.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            studentNumber: true,
                            section: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            });

            totalCount = await prisma.memberApplication.count({ where: whereClause });

        } else if (type === 'committee') {
            const whereClause: any = {};
            if (status) {
                if (status === 'accepted') {
                    whereClause.hasAccepted = true;
                } else if (status === 'rejected') {
                    whereClause.status = 'failed';
                } else if (status === 'pending') {
                    whereClause.status = null;
                }
            }

            applications = await prisma.committeeApplication.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            studentNumber: true,
                            section: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            });

            totalCount = await prisma.committeeApplication.count({ where: whereClause });

        } else if (type === 'ea') {
            const whereClause: any = {};
            if (status) {
                if (status === 'accepted') {
                    whereClause.hasAccepted = true;
                } else if (status === 'rejected') {
                    whereClause.status = 'failed';
                } else if (status === 'pending') {
                    whereClause.status = null;
                }
            }

            applications = await prisma.eAApplication.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            studentNumber: true,
                            section: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            });

            totalCount = await prisma.eAApplication.count({ where: whereClause });

        } else {
            return NextResponse.json({ error: 'Invalid application type' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            applications,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            }
        });

    } catch (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// UPDATE application status (accept/reject)
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

        const { applicationId, type, action, redirection } = await request.json();

        if (!applicationId || !type || !action) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        let updatedApplication;

        if (type === 'member') {
            if (action === 'accept') {
                updatedApplication = await prisma.memberApplication.update({
                    where: { id: applicationId },
                    data: { hasAccepted: true },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                studentNumber: true,
                                section: true,
                            }
                        }
                    }
                });
            } else if (action === 'reject') {
                updatedApplication = await prisma.memberApplication.update({
                    where: { id: applicationId },
                    data: { hasAccepted: false },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                studentNumber: true,
                                section: true,
                            }
                        }
                    }
                });
            }

        } else if (type === 'committee') {
            const updateData: any = {};
            
            if (action === 'accept') {
                updateData.hasAccepted = true;
                updateData.status = 'passed';
            } else if (action === 'reject') {
                updateData.hasAccepted = false;
                updateData.status = 'failed';
            } else if (action === 'redirect' && redirection) {
                updateData.status = 'redirected';
                updateData.redirection = redirection;
            }

            updatedApplication = await prisma.committeeApplication.update({
                where: { id: applicationId },
                data: updateData,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            studentNumber: true,
                            section: true,
                        }
                    }
                }
            });

        } else if (type === 'ea') {
            const updateData: any = {};
            
            if (action === 'accept') {
                updateData.hasAccepted = true;
                updateData.status = 'passed';
            } else if (action === 'reject') {
                updateData.hasAccepted = false;
                updateData.status = 'failed';
            } else if (action === 'redirect' && redirection) {
                updateData.status = 'redirected';
                updateData.redirection = redirection;
            }

            updatedApplication = await prisma.eAApplication.update({
                where: { id: applicationId },
                data: updateData,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            studentNumber: true,
                            section: true,
                        }
                    }
                }
            });

        } else {
            return NextResponse.json({ error: 'Invalid application type' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            application: updatedApplication,
            message: `Application ${action}ed successfully`
        });

    } catch (error) {
        console.error('Error updating application:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}