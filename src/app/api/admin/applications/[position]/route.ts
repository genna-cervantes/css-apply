import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET all applications with filtering
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ position: string }> }
  ) {
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
  
      const { position } = await params;
  
      const applications: {committee: {
          status: string | null;
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
      }[], ea: {
          status: string | null;
          id: string;
          studentNumber: string;
          createdAt: Date;
          firstOptionEb: string;
          secondOptionEb: string;
          hasFinishedInterview: boolean;
          cv: string;
          supabaseFilePath: string | null;
      }[], member: {
          id: string;
          studentNumber: string;
          createdAt: Date;
          hasAccepted: boolean;
          paymentProof: string;
      }[]} = {
          committee: [],
          ea: [],
          member: [],
      };
  
      const commApplications = await prisma.committeeApplication.findMany({
        where: {
          interviewBy: {
            equals: position,
            mode: 'insensitive'
          }
        },
        orderBy: { createdAt: "desc" },
        include: {
            user: {
              select: { id: true, name: true, email: true, studentNumber: true, section: true }, 
            },
          },
      });
  
      // get ea applications
      const eAApplications = await prisma.eAApplication.findMany({
          where: {
              interviewBy: {
                  equals: position,
                  mode: 'insensitive'
              }
          },
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { id: true, name: true, email: true, studentNumber: true, section: true },
            },
          },
      });
  
      // get member applications
      const memberApplications = await prisma.memberApplication.findMany({
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
        applications
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
  
  
