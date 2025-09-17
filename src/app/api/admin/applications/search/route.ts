import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getPositionTitle, getRoleId } from "@/lib/eb-mapping";

// GET search applications across all pages
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
    const query = searchParams.get('q');
    const position = searchParams.get('position');

    if (!query || !position) {
      return NextResponse.json(
        { error: "Missing query or position parameter" },
        { status: 400 }
      );
    }

    const applications: {
      committee: Array<{
        id: string;
        studentNumber: string;
        createdAt: Date;
        hasAccepted: boolean;
        firstOptionCommittee: string;
        secondOptionCommittee: string;
        portfolioLink: string | null;
        cv: string;
        supabaseFilePath: string | null;
        hasFinishedInterview: boolean;
        status: string | null;
        user: {
          id: string;
          name: string;
          email: string;
          studentNumber: string | null;
          section: string | null;
        };
        type: string;
        cvDownloadUrl: string | null;
        portfolioDownloadUrl: string | null;
      }>;
      ea: Array<{
        id: string;
        studentNumber: string;
        createdAt: Date;
        firstOptionEb: string;
        secondOptionEb: string;
        hasFinishedInterview: boolean;
        cv: string;
        supabaseFilePath: string | null;
        hasAccepted: boolean;
        status: string | null;
        user: {
          id: string;
          name: string;
          email: string;
          studentNumber: string | null;
          section: string | null;
        };
        type: string;
        cvDownloadUrl: string | null;
      }>;
      member: Array<{
        id: string;
        studentNumber: string;
        createdAt: Date;
        hasAccepted: boolean;
        paymentProof: string;
        user: {
          id: string;
          name: string;
          email: string;
          studentNumber: string | null;
          section: string | null;
        };
        type: string;
      }>;
    } = {
      committee: [],
      ea: [],
      member: [],
    };

    // Search committee applications
    const allCommApplications = await prisma.committeeApplication.findMany({
      where: {
        AND: [
          {
            interviewBy: {
              equals: position,
              mode: 'insensitive'
            }
          },
          {
            OR: [
              {
                user: {
                  name: {
                    contains: query,
                    mode: 'insensitive'
                  }
                }
              },
              {
                user: {
                  studentNumber: {
                    contains: query,
                    mode: 'insensitive'
                  }
                }
              },
              {
                user: {
                  email: {
                    contains: query,
                    mode: 'insensitive'
                  }
                }
              }
            ]
          }
        ]
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, studentNumber: true, section: true },
        },
      },
    });

    // Filter committee applications (exclude truly processed ones)
    const commApplications = allCommApplications.filter(app => {
      const isAccepted = app.hasAccepted && app.status === 'passed';
      const isRejected = app.status === 'failed';
      const isRedirected = app.status === 'redirected';
      
      return !isAccepted && !isRejected && !isRedirected;
    });

    // Search EA applications
    const positionTitle = getPositionTitle(position);
    const roleId = getRoleId(position);
    
    const allEAApplications = await prisma.eAApplication.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                interviewBy: {
                  equals: position,
                  mode: 'insensitive'
                }
              },
              {
                interviewBy: {
                  equals: positionTitle,
                  mode: 'insensitive'
                }
              },
              {
                interviewBy: {
                  equals: roleId,
                  mode: 'insensitive'
                }
              }
            ]
          },
          {
            OR: [
              {
                user: {
                  name: {
                    contains: query,
                    mode: 'insensitive'
                  }
                }
              },
              {
                user: {
                  studentNumber: {
                    contains: query,
                    mode: 'insensitive'
                  }
                }
              },
              {
                user: {
                  email: {
                    contains: query,
                    mode: 'insensitive'
                  }
                }
              }
            ]
          }
        ]
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, studentNumber: true, section: true },
        },
      },
    });

    // Filter EA applications (exclude truly processed ones)
    const eAApplications = allEAApplications.filter(app => {
      const isAccepted = app.hasAccepted && app.status === 'passed';
      const isRejected = app.status === 'failed';
      const isRedirected = app.status === 'redirected';
      
      return !isAccepted && !isRejected && !isRedirected;
    });

    // Search member applications
    const memberApplications = await prisma.memberApplication.findMany({
      where: {
        OR: [
          {
            user: {
              name: {
                contains: query,
                mode: 'insensitive'
              }
            }
          },
          {
            user: {
              studentNumber: {
                contains: query,
                mode: 'insensitive'
              }
            }
          },
          {
            user: {
              email: {
                contains: query,
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, studentNumber: true, section: true },
        },
      },
    });

    // Add CV and Portfolio download links for Committee applications
    applications.committee = await Promise.all(
      commApplications.map(async (application) => {
        const cvDownloadUrl = application.supabaseFilePath 
          ? `/api/admin/cv-download?applicationId=${application.id}&type=committee`
          : null;
        
        const portfolioDownloadUrl = application.portfolioLink 
          ? `/api/admin/portfolio-download?applicationId=${application.id}`
          : null;
        
        return {
          ...application,
          type: 'committee',
          cvDownloadUrl,
          portfolioDownloadUrl,
        };
      })
    );

    // Add CV download links for EA applications
    applications.ea = await Promise.all(
      eAApplications.map(async (application) => {
        const cvDownloadUrl = application.supabaseFilePath 
          ? `/api/admin/cv-download?applicationId=${application.id}&type=ea`
          : null;
        
        return {
          ...application,
          type: 'ea',
          cvDownloadUrl,
        };
      })
    );

    applications.member = memberApplications.map(application => ({
      ...application,
      type: 'member',
    }));

    return NextResponse.json({
      success: true,
      applications,
      searchQuery: query,
      totalResults: applications.committee.length + applications.ea.length + applications.member.length
    });
  } catch (error) {
    console.error("Error searching applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
