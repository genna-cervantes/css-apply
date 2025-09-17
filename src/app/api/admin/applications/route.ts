import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";

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
      } else if (status === 'evaluating') {
        whereClause.status = 'evaluating';
      } else if (status === 'rejected') {
        whereClause.status = 'failed';
      } else if (status === 'no-schedule') {
        whereClause.OR = [
          { interviewSlotDay: null },
          { interviewSlotTimeStart: null }
        ];
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

      // Add CV download links for EA applications
      const eaApplicationsWithCvLinks = await Promise.all(
        eaApplications.map(async (app) => {
          const cvDownloadUrl = app.supabaseFilePath 
            ? `/api/admin/cv-download?applicationId=${app.id}&type=ea`
            : null;
          
          return {
            ...app,
            cvDownloadUrl,
          };
        })
      );

      return NextResponse.json({
        success: true,
        applications: eaApplicationsWithCvLinks,
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
      } else if (status === 'evaluating') {
        whereClause.status = 'evaluating';
      } else if (status === 'rejected') {
        whereClause.status = 'failed';
      } else if (status === 'no-schedule') {
        whereClause.OR = [
          { interviewSlotDay: null },
          { interviewSlotTimeStart: null }
        ];
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

      // Add CV and Portfolio download links for Committee applications
      const committeeApplicationsWithCvLinks = await Promise.all(
        committeeApplications.map(async (app) => {
          const cvDownloadUrl = app.supabaseFilePath 
            ? `/api/admin/cv-download?applicationId=${app.id}&type=committee`
            : null;
          
          const portfolioDownloadUrl = app.portfolioLink 
            ? `/api/admin/portfolio-download?applicationId=${app.id}`
            : null;
          
          return {
            ...app,
            cvDownloadUrl,
            portfolioDownloadUrl,
          };
        })
      );

      return NextResponse.json({
        success: true,
        applications: committeeApplicationsWithCvLinks,
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

        // Send acceptance email
        if (updatedApplication?.user?.email && updatedApplication?.user?.name && updatedApplication?.user?.id) {
          try {
            const emailTemplate = emailTemplates.memberAccepted(
              updatedApplication.user.name,
              updatedApplication.user.id
            );
            await sendEmail(updatedApplication.user.email, emailTemplate.subject, emailTemplate.html);
            console.log(`Acceptance email sent to ${updatedApplication.user.email} for member application`);
          } catch (emailError) {
            console.error('Failed to send acceptance email:', emailError);
            // Don't fail the request if email fails
          }
        }
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
      } else if (action === "evaluate") {
        // For member applications, we don't need to set status as they don't have that field
        // Just return the current application
        updatedApplication = await prisma.memberApplication.findUnique({
          where: { id: applicationId },
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
        updateData.hasAccepted = true;
        updateData.status = "passed";
        updateData.redirection = redirection;
      } else if (action === "evaluate") {
        updateData.status = "evaluating";
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

      // Send appropriate email based on action
      if (updatedApplication?.user?.email && updatedApplication?.user?.name) {
        try {
          if (action === "accept" && updatedApplication?.user?.id && updatedApplication?.firstOptionCommittee) {
            const emailTemplate = emailTemplates.committeeAccepted(
              updatedApplication.user.name,
              updatedApplication.user.id,
              updatedApplication.firstOptionCommittee
            );
            await sendEmail(updatedApplication.user.email, emailTemplate.subject, emailTemplate.html);
            console.log(`Acceptance email sent to ${updatedApplication.user.email} for committee application`);
          } else if (action === "reject" && updatedApplication?.firstOptionCommittee) {
            const emailTemplate = emailTemplates.committeeRejected(
              updatedApplication.user.name,
              updatedApplication.firstOptionCommittee
            );
            await sendEmail(updatedApplication.user.email, emailTemplate.subject, emailTemplate.html);
            console.log(`Rejection email sent to ${updatedApplication.user.email} for committee application`);
          } else if (action === "redirect" && updatedApplication?.user?.id && redirection) {
            const emailTemplate = emailTemplates.committeeAccepted(
              updatedApplication.user.name,
              updatedApplication.user.id,
              redirection
            );
            await sendEmail(updatedApplication.user.email, emailTemplate.subject, emailTemplate.html);
            console.log(`Acceptance email sent to ${updatedApplication.user.email} for committee application (redirected to ${redirection})`);
          } else if (action === "evaluate" && updatedApplication?.firstOptionCommittee) {
            const emailTemplate = emailTemplates.committeeEvaluating(
              updatedApplication.user.name,
              updatedApplication.firstOptionCommittee
            );
            await sendEmail(updatedApplication.user.email, emailTemplate.subject, emailTemplate.html);
            console.log(`Evaluation email sent to ${updatedApplication.user.email} for committee application`);
          }
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
          // Don't fail the request if email fails
        }
      }
    } else if (type === "ea") {
      const updateData: {hasAccepted?: boolean; status?: string; redirection?: string} = {};

      if (action === "accept") {
        updateData.hasAccepted = true;
        updateData.status = "passed";
      } else if (action === "reject") {
        updateData.hasAccepted = false;
        updateData.status = "failed";
      } else if (action === "redirect" && redirection) {
        updateData.hasAccepted = true;
        updateData.status = "passed";
        updateData.redirection = redirection;
      } else if (action === "evaluate") {
        updateData.status = "evaluating";
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

      // Send appropriate email based on action
      if (updatedApplication?.user?.email && updatedApplication?.user?.name) {
        try {
          if (action === "accept" && updatedApplication?.user?.id && updatedApplication?.ebRole) {
            const emailTemplate = emailTemplates.executiveAssistantAccepted(
              updatedApplication.user.name,
              updatedApplication.user.id,
              updatedApplication.ebRole
            );
            await sendEmail(updatedApplication.user.email, emailTemplate.subject, emailTemplate.html);
            console.log(`Acceptance email sent to ${updatedApplication.user.email} for EA application`);
          } else if (action === "reject" && updatedApplication?.ebRole) {
            const emailTemplate = emailTemplates.executiveAssistantRejected(
              updatedApplication.user.name,
              updatedApplication.ebRole
            );
            await sendEmail(updatedApplication.user.email, emailTemplate.subject, emailTemplate.html);
            console.log(`Rejection email sent to ${updatedApplication.user.email} for EA application`);
          } else if (action === "redirect" && updatedApplication?.user?.id && redirection) {
            const emailTemplate = emailTemplates.executiveAssistantAccepted(
              updatedApplication.user.name,
              updatedApplication.user.id,
              redirection
            );
            await sendEmail(updatedApplication.user.email, emailTemplate.subject, emailTemplate.html);
            console.log(`Acceptance email sent to ${updatedApplication.user.email} for EA application (redirected to ${redirection})`);
          } else if (action === "evaluate" && updatedApplication?.ebRole) {
            const emailTemplate = emailTemplates.executiveAssistantEvaluating(
              updatedApplication.user.name,
              updatedApplication.ebRole
            );
            await sendEmail(updatedApplication.user.email, emailTemplate.subject, emailTemplate.html);
            console.log(`Evaluation email sent to ${updatedApplication.user.email} for EA application`);
          }
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
          // Don't fail the request if email fails
        }
      }
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
