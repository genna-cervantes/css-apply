import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";

// Type definitions for raw query results
interface CountResult {
  count: bigint;
}

interface MemberApplicationRaw {
  id: string;
  studentNumber: string;
  hasAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
  paymentProof?: string;
}

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
    const committee = searchParams.get('committee');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

     if (type === 'member') {
       let memberApplications;
       let totalCount;
       
       if (status === 'accepted') {
         // Get accepted applications
         totalCount = await prisma.memberApplication.count({
           where: { hasAccepted: true },
         });

         memberApplications = await prisma.memberApplication.findMany({
           where: { hasAccepted: true },
           orderBy: { createdAt: "desc" },
           skip: skip,
           take: limit,
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
       } else if (status === 'pending') {
         // Get pending applications (hasAccepted: false AND createdAt = updatedAt)
         const rawQuery = `
           SELECT * FROM "MemberApplication" 
           WHERE "hasAccepted" = false 
           AND "createdAt" = "updatedAt"
           ORDER BY "createdAt" DESC
           LIMIT ${limit} OFFSET ${skip}
         `;
         
         const countQuery = `
           SELECT COUNT(*) as count FROM "MemberApplication" 
           WHERE "hasAccepted" = false 
           AND "createdAt" = "updatedAt"
         `;

         const [applications, countResult] = await Promise.all([
           prisma.$queryRawUnsafe(rawQuery),
           prisma.$queryRawUnsafe(countQuery)
         ]);

         totalCount = Number((countResult as CountResult[])[0].count);
         
         // Get user data for each application
         memberApplications = await Promise.all(
           (applications as MemberApplicationRaw[]).map(async (app) => {
             const user = await prisma.user.findUnique({
               where: { studentNumber: app.studentNumber },
               select: {
                 id: true,
                 name: true,
                 email: true,
                 studentNumber: true,
                 section: true,
               },
             });
             return { ...app, user };
           })
         );
       } else if (status === 'rejected') {
         // Get rejected applications (hasAccepted: false AND createdAt != updatedAt)
         const rawQuery = `
           SELECT * FROM "MemberApplication" 
           WHERE "hasAccepted" = false 
           AND "createdAt" != "updatedAt"
           ORDER BY "createdAt" DESC
           LIMIT ${limit} OFFSET ${skip}
         `;
         
         const countQuery = `
           SELECT COUNT(*) as count FROM "MemberApplication" 
           WHERE "hasAccepted" = false 
           AND "createdAt" != "updatedAt"
         `;

         const [applications, countResult] = await Promise.all([
           prisma.$queryRawUnsafe(rawQuery),
           prisma.$queryRawUnsafe(countQuery)
         ]);

         totalCount = Number((countResult as CountResult[])[0].count);
         
         // Get user data for each application
         memberApplications = await Promise.all(
           (applications as MemberApplicationRaw[]).map(async (app) => {
             const user = await prisma.user.findUnique({
               where: { studentNumber: app.studentNumber },
               select: {
                 id: true,
                 name: true,
                 email: true,
                 studentNumber: true,
                 section: true,
               },
             });
             return { ...app, user };
           })
         );
       } else {
         // Get all applications
         totalCount = await prisma.memberApplication.count();

         memberApplications = await prisma.memberApplication.findMany({
           orderBy: { createdAt: "desc" },
           skip: skip,
           take: limit,
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

      return NextResponse.json({
        success: true,
        applications: memberApplications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount: totalCount,
          limit: limit,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1
        }
      });
    }

    if (type === 'ea') {
      const whereClause: Record<string, unknown> = {};
      
      // Filter by status if provided
      if (status === 'accepted') {
        whereClause.hasAccepted = true;
        whereClause.status = { not: null }; // Exclude applications with NULL status
        console.log('EA Accepted filter applied:', whereClause);
      } else if (status === 'pending') {
        whereClause.OR = [
          { hasAccepted: false, status: null },
          { hasAccepted: false, status: 'pending' },
          { hasAccepted: true, status: null } // Include accepted applications that were reset to NULL
        ];
        console.log('EA Pending filter applied:', whereClause);
      } else if (status === 'evaluating') {
        whereClause.status = 'evaluating';
      } else if (status === 'rejected') {
        whereClause.status = 'failed';
      } else if (status === 'no-schedule') {
        whereClause.OR = [
          { interviewSlotDay: null },
          { interviewSlotTimeStart: null },
          { interviewSlotDay: '' },
          { interviewSlotTimeStart: '' }
        ];
        console.log('No-schedule filter applied for EA applications:', whereClause);
      } else if (status === 'all' || !status) {
        // For 'all' status or no status, show ALL applications (no filtering)
        // This is for the EA and Committee Staff tabs that should show all applications
        console.log('EA All status - showing all applications');
      }

      // Get total count for pagination
      const totalCount = await prisma.eAApplication.count({
        where: whereClause,
      });

      const eaApplications = await prisma.eAApplication.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: limit,
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


      if (status === 'no-schedule') {
        console.log(`Found ${eaApplications.length} EA applications with no schedule`);
        eaApplications.forEach(app => {
          console.log(`EA App ${app.id}: day=${app.interviewSlotDay}, time=${app.interviewSlotTimeStart}`);
        });
      }

      // Debug logging for all status filters
      if (status === 'accepted' || status === 'pending') {
        console.log(`Found ${eaApplications.length} EA applications with status: ${status}`);
        eaApplications.forEach(app => {
          console.log(`EA App ${app.id}: hasAccepted=${app.hasAccepted}, status=${app.status}, user=${app.user?.name}`);
        });
      }

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
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount: totalCount,
          limit: limit,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1
        }
      });
    }

    if (type === 'committee') {
      const whereClause: Record<string, unknown> = {};
      
      // Filter by committee if provided
      if (committee && committee !== 'all') {
        // For committee-specific filtering, we need to handle redirected applications
        // A redirected application should only appear in the committee they were redirected TO
        // We need to handle both committee ID and committee title since redirections store the full title
        
        // Get the committee title for the given committee ID
        const { committeeRolesSubmitted } = await import('@/data/committeeRoles');
        const committeeData = committeeRolesSubmitted.find(c => c.id === committee);
        const committeeTitle = committeeData?.title;
        
        whereClause.OR = [
          // Direct applications to this committee (not redirected)
          { 
            firstOptionCommittee: committee,
            redirection: null // Not redirected
          },
          // Applications redirected TO this committee (by ID or title)
          ...(committeeTitle ? [
            { redirection: committee }, // By committee ID
            { redirection: committeeTitle } // By committee title
          ] : [
            { redirection: committee } // Fallback to just committee ID
          ])
        ];
      }
      
      // Filter by status if provided
      if (status === 'accepted') {
        whereClause.hasAccepted = true;
        whereClause.status = { not: null }; // Exclude applications with NULL status
      } else if (status === 'pending') {
        whereClause.OR = [
          { hasAccepted: false, status: null },
          { hasAccepted: false, status: 'pending' },
          { hasAccepted: true, status: null } // Include accepted applications that were reset to NULL
        ];
      } else if (status === 'evaluating') {
        whereClause.status = 'evaluating';
      } else if (status === 'rejected') {
        whereClause.status = 'failed';
      } else if (status === 'redirected') {
        whereClause.redirection = { not: null }; // Show only applications with redirection
        console.log('Redirected filter applied for Committee applications:', whereClause);
      } else if (status === 'no-schedule') {
        whereClause.OR = [
          { interviewSlotDay: null },
          { interviewSlotTimeStart: null },
          { interviewSlotDay: '' },
          { interviewSlotTimeStart: '' }
        ];
        console.log('No-schedule filter applied for Committee applications:', whereClause);
      } else if (status === 'all' || !status) {
        // For 'all' status or no status, show ALL applications (no filtering)
        // This is for the EA and Committee Staff tabs that should show all applications
        console.log('Committee All status - showing all applications');
      }

      // Get total count for pagination
      const totalCount = await prisma.committeeApplication.count({
        where: whereClause,
      });

      const committeeApplications = await prisma.committeeApplication.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: limit,
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

      if (status === 'no-schedule') {
        console.log(`Found ${committeeApplications.length} Committee applications with no schedule`);
        committeeApplications.forEach(app => {
          console.log(`Committee App ${app.id}: day=${app.interviewSlotDay}, time=${app.interviewSlotTimeStart}`);
        });
      }

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
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount: totalCount,
          limit: limit,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1
        }
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

// Clean up orphaned committee application records
export async function DELETE(_request: NextRequest) {
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

    // Find and delete orphaned committee application records
    // These are committee applications with status "redirected" where the corresponding EA application is "failed"
    const orphanedCommitteeApps = await prisma.committeeApplication.findMany({
      where: {
        status: "redirected"
      },
      include: {
        user: {
          include: {
            eaApplication: true
          }
        }
      }
    });

    let cleanedCount = 0;
    for (const committeeApp of orphanedCommitteeApps) {
      // Check if the corresponding EA application exists and is failed
      if (committeeApp.user.eaApplication && committeeApp.user.eaApplication.status === "failed") {
        await prisma.committeeApplication.delete({
          where: { id: committeeApp.id }
        });
        cleanedCount++;
        console.log(`Cleaned up orphaned committee application for student: ${committeeApp.studentNumber}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${cleanedCount} orphaned committee application records`,
      cleanedCount
    });

  } catch (error) {
    console.error("Error cleaning up orphaned records:", error);
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
        updateData.redirection = redirection === 'member' ? 'Member' : redirection;
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
            // Check if redirecting to member
            if (redirection === 'member') {
              // Create MemberApplication record for the redirected user
              await prisma.memberApplication.create({
                data: {
                  studentNumber: updatedApplication.studentNumber,
                  hasAccepted: true, // Mark as accepted since this is a redirection
                  paymentProof: "", // Will be updated when payment is received
                }
              });
              console.log(`MemberApplication created for Committee redirection: ${updatedApplication.user.email}`);

              const emailTemplate = emailTemplates.committeeRedirectedToMember(
                updatedApplication.user.name,
                updatedApplication.user.id,
                updatedApplication.firstOptionCommittee || 'Original Committee'
              );
              await sendEmail(updatedApplication.user.email, emailTemplate.subject, emailTemplate.html);
              console.log(`Member redirection email sent to ${updatedApplication.user.email} for committee application`);
            } else {
              // Regular committee redirection
              const emailTemplate = emailTemplates.committeeRedirected(
                updatedApplication.user.name,
                updatedApplication.user.id,
                updatedApplication.firstOptionCommittee || 'Original Committee',
                redirection
              );
              await sendEmail(updatedApplication.user.email, emailTemplate.subject, emailTemplate.html);
              console.log(`Redirect email sent to ${updatedApplication.user.email} for committee application (redirected to ${redirection})`);
            }
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
      // First get the current application data to check if it was redirected
      const currentApplication = await prisma.eAApplication.findUnique({
        where: { id: applicationId },
        select: { status: true, redirection: true, studentNumber: true }
      });

      const updateData: {hasAccepted?: boolean; status?: string; redirection?: string} = {};

      if (action === "accept") {
        updateData.hasAccepted = true;
        updateData.status = "passed";
        
        // If this EA application was redirected to a committee, clean up the committee application record
        if (currentApplication?.status === "redirected" && currentApplication?.redirection) {
          try {
            await prisma.committeeApplication.deleteMany({
              where: {
                studentNumber: currentApplication.studentNumber,
                status: "redirected",
                redirection: currentApplication.redirection
              }
            });
            console.log(`Cleaned up committee application record for accepted EA application: ${currentApplication.studentNumber}`);
          } catch (error) {
            console.error('Error cleaning up committee application record:', error);
            // Don't fail the request if cleanup fails
          }
        }
      } else if (action === "reject") {
        updateData.hasAccepted = false;
        updateData.status = "failed";
        
        // If this EA application was redirected to a committee, clean up the committee application record
        if (currentApplication?.status === "redirected" && currentApplication?.redirection) {
          try {
            await prisma.committeeApplication.deleteMany({
              where: {
                studentNumber: currentApplication.studentNumber,
                status: "redirected",
                redirection: currentApplication.redirection
              }
            });
            console.log(`Cleaned up committee application record for rejected EA application: ${currentApplication.studentNumber}`);
          } catch (error) {
            console.error('Error cleaning up committee application record:', error);
            // Don't fail the request if cleanup fails
          }
        }
      } else if (action === "redirect" && redirection) {
        updateData.hasAccepted = true;
        updateData.status = "redirected";
        // For EA applications, store the proper committee title instead of raw committee ID
        if (redirection.startsWith('committee-')) {
          const committeeId = redirection.replace('committee-', '');
          const { committeeRolesSubmitted } = await import('@/data/committeeRoles');
          const committee = committeeRolesSubmitted.find(c => c.id === committeeId);
          updateData.redirection = committee ? committee.title : committeeId;
        } else {
          updateData.redirection = redirection === 'member' ? 'Member' : redirection;
        }
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

      // If redirecting EA to committee-staff, create a committee application record
      if (action === "redirect" && redirection && redirection.startsWith('committee-')) {
        const committeeId = redirection.replace('committee-', '');
        
        // Import committee roles to get proper title
        const { committeeRolesSubmitted } = await import('@/data/committeeRoles');
        const committee = committeeRolesSubmitted.find(c => c.id === committeeId);
        const committeeTitle = committee ? committee.title : committeeId;
        
        // Create committee application record
        await prisma.committeeApplication.create({
          data: {
            studentNumber: updatedApplication.studentNumber,
            firstOptionCommittee: updatedApplication.firstOptionEb, // Store EA first choice directly
            secondOptionCommittee: updatedApplication.secondOptionEb, // Store EA second choice directly
            hasAccepted: false, // Don't mark as accepted since this is a redirection
            status: "redirected", // Mark as redirected instead of passed
            redirection: committeeTitle, // Store the redirected committee
            interviewSlotDay: updatedApplication.interviewSlotDay,
            interviewSlotTimeStart: updatedApplication.interviewSlotTimeStart,
            interviewSlotTimeEnd: updatedApplication.interviewSlotTimeEnd,
            interviewBy: updatedApplication.interviewBy,
            supabaseFilePath: updatedApplication.supabaseFilePath,
            portfolioLink: null, // EA applications don't have portfolio links
            cv: updatedApplication.supabaseFilePath || "", // Use the CV file path as the cv field
          }
        });
      }

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
            // Check if redirecting to member
            if (redirection === 'member') {
              // Create MemberApplication record for the redirected user
              await prisma.memberApplication.create({
                data: {
                  studentNumber: updatedApplication.studentNumber,
                  hasAccepted: true, // Mark as accepted since this is a redirection
                  paymentProof: "", // Will be updated when payment is received
                }
              });
              console.log(`MemberApplication created for EA redirection: ${updatedApplication.user.email}`);

              const emailTemplate = emailTemplates.executiveAssistantRedirectedToMember(
                updatedApplication.user.name,
                updatedApplication.user.id,
                updatedApplication.firstOptionEb || 'Executive Assistant'
              );
              await sendEmail(updatedApplication.user.email, emailTemplate.subject, emailTemplate.html);
              console.log(`Member redirection email sent to ${updatedApplication.user.email} for EA application`);
            } else if (redirection.startsWith('committee-')) {
              const committeeId = redirection.replace('committee-', '');
              const emailTemplate = emailTemplates.executiveAssistantRedirectedToCommittee(
                updatedApplication.user.name,
                updatedApplication.user.id,
                updatedApplication.firstOptionEb || 'Executive Assistant',
                committeeId
              );
              await sendEmail(updatedApplication.user.email, emailTemplate.subject, emailTemplate.html);
              console.log(`Committee redirection email sent to ${updatedApplication.user.email} for EA application (redirected to ${committeeId})`);
            } else {
              // Regular EA to EA redirection
              const emailTemplate = emailTemplates.executiveAssistantRedirected(
                updatedApplication.user.name,
                updatedApplication.user.id,
                updatedApplication.firstOptionEb || 'Executive Assistant',
                redirection
              );
              await sendEmail(updatedApplication.user.email, emailTemplate.subject, emailTemplate.html);
              console.log(`EA redirection email sent to ${updatedApplication.user.email} for EA application (redirected to ${redirection})`);
            }
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
