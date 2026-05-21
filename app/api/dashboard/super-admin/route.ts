import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    const totalUsers = await prisma.user.count()

    const totalWashrooms = await prisma.washroom.count()

    const activeSupervisors = await prisma.user.count({
      where: {
        role: "SUPERVISOR",
      },
    })

    const activeGMs = await prisma.user.count({
      where: {
        role: "GENERAL_MANAGER",
      },
    })

    const totalComplaints = await prisma.complaint.count()

    const openComplaints = await prisma.complaint.count({
      where: {
        status: "OPEN",
      },
    })

    const resolvedComplaints = await prisma.complaint.count({
      where: {
        resolvedAt: {
          not: null,
        },
      },
    })

    return NextResponse.json({
      totalUsers,
      totalWashrooms,
      activeSupervisors,
      activeGMs,
      totalComplaints,
      openComplaints,
      resolvedComplaints,
    })
  } catch (error) {
    console.error("SUPER ADMIN DASHBOARD ERROR:", error)

    return NextResponse.json(
      { error: "Dashboard failed" },
      { status: 500 }
    )
  }
}