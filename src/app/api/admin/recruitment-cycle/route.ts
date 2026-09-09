import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMembershipDateKey } from "@/lib/membership-expiration";
import { Prisma } from "@prisma/client";
import { PUBLIC_EB_ROLES_CACHE_TAG } from "@/lib/cache-tags";

const toDateOnlyTimestamp = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return Number.NaN;

  const [year, month, day] = value.split("-").map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const normalized = new Date(timestamp).toISOString().slice(0, 10);

  return normalized === value ? timestamp : Number.NaN;
};

const getTodayDateOnlyTimestamp = () =>
  toDateOnlyTimestamp(getMembershipDateKey());

const isPrismaUniqueError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === "P2002";

// GET recruitment cycles (all + active)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    const hasAdminAccess =
      userRole === "admin" ||
      userRole === "super_admin" ||
      userRole === "super-admin";

    const activeCycle = await prisma.recruitmentCycle.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    const cycles = hasAdminAccess
      ? await prisma.recruitmentCycle.findMany({
          orderBy: { createdAt: "desc" },
        })
      : [];

    return NextResponse.json({ cycles, activeCycle });
  } catch (error) {
    console.error("Error fetching recruitment cycle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Create or update recruitment cycle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== "super_admin" && userRole !== "super-admin") {
      return NextResponse.json(
        { error: "Forbidden - Super admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      id,
      schoolYear,
      applicationStart,
      interviewStart,
      interviewEnd,
      membershipExpiration,
      isActive,
    } = body;

    if (
      !schoolYear ||
      !applicationStart ||
      !interviewStart ||
      !interviewEnd ||
      !membershipExpiration
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: schoolYear, applicationStart, interviewStart, interviewEnd, membershipExpiration",
        },
        { status: 400 },
      );
    }

    const applicationStartTime = toDateOnlyTimestamp(applicationStart);
    const interviewStartTime = toDateOnlyTimestamp(interviewStart);
    const interviewEndTime = toDateOnlyTimestamp(interviewEnd);
    const membershipExpirationTime = toDateOnlyTimestamp(membershipExpiration);
    const todayTime = getTodayDateOnlyTimestamp();

    if (
      ![
        applicationStartTime,
        interviewStartTime,
        interviewEndTime,
        membershipExpirationTime,
      ].every(Number.isFinite)
    ) {
      return NextResponse.json(
        { error: "Recruitment cycle dates must be valid calendar dates" },
        { status: 400 },
      );
    }

    if (
      !id &&
      (applicationStartTime < todayTime ||
        interviewStartTime < todayTime ||
        interviewEndTime < todayTime)
    ) {
      return NextResponse.json(
        { error: "New recruitment cycle dates cannot be set in the past" },
        { status: 400 },
      );
    }

    if (interviewStartTime < applicationStartTime) {
      return NextResponse.json(
        { error: "Interview start cannot be before application start" },
        { status: 400 },
      );
    }

    if (interviewEndTime < interviewStartTime) {
      return NextResponse.json(
        { error: "Interview last day cannot be before interview start" },
        { status: 400 },
      );
    }

    if (membershipExpirationTime < interviewEndTime) {
      return NextResponse.json(
        {
          error:
            "Membership expiration cannot be before the interview period ends",
        },
        { status: 400 },
      );
    }

    const cycle = await prisma.$transaction(async (tx) => {
      // Serialize activation changes so concurrent requests cannot leave two
      // recruitment cycles active.
      await tx.$executeRaw(Prisma.sql`
        SELECT pg_advisory_xact_lock(hashtext('active-recruitment-cycle'))
      `);

      if (isActive) {
        await tx.recruitmentCycle.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      const cycleData = {
        applicationStart: new Date(applicationStart),
        interviewStart: new Date(interviewStart),
        interviewEnd: new Date(interviewEnd),
        membershipExpiration: new Date(`${membershipExpiration}T00:00:00.000Z`),
        isActive: isActive ?? false,
      };

      if (id) {
        return tx.recruitmentCycle.update({
          where: { id },
          data: { schoolYear, ...cycleData },
        });
      }

      return tx.recruitmentCycle.upsert({
        where: { schoolYear },
        update: cycleData,
        create: { schoolYear, ...cycleData },
      });
    });

    revalidateTag(PUBLIC_EB_ROLES_CACHE_TAG);
    return NextResponse.json({ success: true, cycle });
  } catch (error) {
    console.error("Error managing recruitment cycle:", error);

    if (isPrismaUniqueError(error)) {
      return NextResponse.json(
        { error: "A recruitment cycle for this school year already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Delete a recruitment cycle
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== "super_admin" && userRole !== "super-admin") {
      return NextResponse.json(
        { error: "Forbidden - Super admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing cycle id" }, { status: 400 });
    }

    await prisma.recruitmentCycle.delete({ where: { id } });

    revalidateTag(PUBLIC_EB_ROLES_CACHE_TAG);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recruitment cycle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
