import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPositionFromRoleId, getRoleId } from "@/lib/eb-mapping";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [{ id }, activeCycle] = await Promise.all([
      params,
      prisma.recruitmentCycle.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: { interviewStart: true, interviewEnd: true },
      }),
    ]);

    if (!activeCycle?.interviewStart || !activeCycle.interviewEnd) {
      return NextResponse.json(
        { unavailableSlotsData: [] },
        { headers: { "Cache-Control": "private, no-store, max-age=0" } },
      );
    }

    const position = getPositionFromRoleId(id);
    const unavailableSlots = await prisma.availableEBInterviewTime.findMany({
      where: {
        OR: [position, getRoleId(position)].map((value) => ({
          eb: { equals: value, mode: "insensitive" as const },
        })),
        maxSlots: 0,
        day: {
          gte: activeCycle.interviewStart.toISOString().slice(0, 10),
          lte: activeCycle.interviewEnd.toISOString().slice(0, 10),
        },
      },
      orderBy: [{ day: "asc" }, { timeStart: "asc" }],
    });

    const unavailableSlotsData = unavailableSlots.map((slot) => ({
      id: slot.id,
      date: slot.day,
      timeSlot: `${slot.timeStart}-${slot.timeEnd}`,
      startTime: slot.timeStart,
      endTime: slot.timeEnd,
    }));

    return NextResponse.json(
      { unavailableSlotsData },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    console.error(
      "Unavailable time lookup error",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { error: "Unable to load unavailable times" },
      { status: 500 },
    );
  }
}
