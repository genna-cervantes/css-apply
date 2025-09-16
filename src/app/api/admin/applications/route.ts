import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET applications with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin access
    const userRole = session.user.role;
    const hasAdminAccess = userRole === "admin" || userRole === "super_admin";

    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    if (type === 'member') {
      const whereClause: Record<string, unknown> = {};
      
      // Filter by status if provided
      if (status === 'accepted') {
        whereClause.hasAccepted = true;
      } else if (status === 'pending') {
        whereClause.hasAccepted = false;
      } else if (status === 'rejected') {
        whereClause.hasAccepted = false;
      }
      // If status is 'all' or not provided, no filter is applied

      const memberApplications = await prisma.memberApplication.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              studentNumber: true,
              section: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        applications: memberApplications,
      });
    }

    if (type === 'ea') {
      const whereClause: Record<string, unknown> = {};
      
      // Filter by status if provided
      if (status === 'accepted') {
        whereClause.hasAccepted = true;
      } else if (status === 'pending') {
        whereClause.OR = [
          { hasAccepted: false, status: null },
          { hasAccepted: false, status: 'pending' }
        ];
      } else if (status === 'rejected') {
        whereClause.status = 'failed';
      }
      // If status is 'all' or not provided, no filter is applied

      const eaApplications = await prisma.eAApplication.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              studentNumber: true,
              section: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        applications: eaApplications,
      });
    }

    if (type === 'committee') {
      const whereClause: Record<string, unknown> = {};
      
      // Filter by status if provided
      if (status === 'accepted') {
        whereClause.hasAccepted = true;
      } else if (status === 'pending') {
        whereClause.OR = [
          { hasAccepted: false, status: null },
          { hasAccepted: false, status: 'pending' }
        ];
      } else if (status === 'rejected') {
        whereClause.status = 'failed';
      }
      // If status is 'all' or not provided, no filter is applied

      const committeeApplications = await prisma.committeeApplication.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              studentNumber: true,
              section: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        applications: committeeApplications,
      });
    }

    // For other application types, return empty array for now
    return NextResponse.json({
      success: true,
      applications: [],
    });

  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE application status (accept/reject)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin access
    const userRole = session.user.role;
    const hasAdminAccess = userRole === "admin" || userRole === "super_admin";

    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { applicationId, type, action, redirection } = await request.json();

    if (!applicationId || !type || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let updatedApplication;

    if (type === "member") {
      if (action === "accept") {
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
              },
            },
          },
        });
      } else if (action === "reject") {
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
              },
            },
          },
        });
      }
    } else if (type === "committee") {
      const updateData: {hasAccepted?: boolean; status?: string; redirection?: string} = {};

      if (action === "accept") {
        updateData.hasAccepted = true;
        updateData.status = "passed";
      } else if (action === "reject") {
        updateData.hasAccepted = false;
        updateData.status = "failed";
      } else if (action === "redirect" && redirection) {
        updateData.status = "redirected";
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
            },
          },
        },
      });
    } else if (type === "ea") {
      const updateData: {hasAccepted?: boolean; status?: string; redirection?: string} = {};

      if (action === "accept") {
        updateData.hasAccepted = true;
        updateData.status = "passed";
      } else if (action === "reject") {
        updateData.hasAccepted = false;
        updateData.status = "failed";
      } else if (action === "redirect" && redirection) {
        updateData.status = "redirected";
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
            },
          },
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid application type" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      message: `Application ${action}ed successfully`,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
