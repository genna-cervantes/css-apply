import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AttendanceOperator = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
};

type AttendanceAuthorization =
  | { operator: AttendanceOperator; response?: never }
  | { operator?: never; response: NextResponse };

export async function authorizeAttendanceOperator(
  options: { superAdminOnly?: boolean } = {},
): Promise<AttendanceAuthorization> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return {
      response: NextResponse.json(
        { error: "Authentication is required" },
        { status: 401 },
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, role: true },
  });
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  if (!user || !isAdmin) {
    return {
      response: NextResponse.json(
        { error: "Administrator access is required" },
        { status: 403 },
      ),
    };
  }
  if (options.superAdminOnly && user.role !== "super_admin") {
    return {
      response: NextResponse.json(
        { error: "Super administrator access is required" },
        { status: 403 },
      ),
    };
  }

  return {
    operator: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as AttendanceOperator["role"],
    },
  };
}
