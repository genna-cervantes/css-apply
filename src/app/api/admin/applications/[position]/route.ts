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
      // get committee applications
      const { committees } = await prisma.eBProfile.findFirstOrThrow({
        where: {
          position: position,
        },
      });
  
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
      }[]} = {
          committee: [],
          ea: [],
      };
  
      console.log('committees', JSON.stringify(committees, null, 2));
  
      const commApplications = await prisma.committeeApplication.findMany({
        where: {
          firstOptionCommittee: {
            in: committees,
          }
        },
        orderBy: { createdAt: "desc" },
        include: {
            user: {
              select: { id: true, name: true, email: true, studentNumber: true, section: true }, 
            },
          },
      });
  
  
      console.log('commApplications', JSON.stringify(commApplications, null, 2));
      
      // get ea applications
      const eAApplications = await prisma.eAApplication.findMany({
          where: {
              firstOptionEb: {
                  equals: position,
              }
          },
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { id: true, name: true, email: true, studentNumber: true, section: true },
            },
          },
      });
  
      console.log('eAApplications', JSON.stringify(eAApplications, null, 2));
  
      applications.committee = commApplications.map(application => ({
        ...application,
        type: 'committee',
      }));
      applications.ea = eAApplications.map(application => ({
        ...application,
        type: 'ea',
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
  
  
