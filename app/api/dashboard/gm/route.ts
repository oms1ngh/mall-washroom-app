import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

function getComplaintTimer(createdAt: Date) {
  const now = new Date()
  const diffMs = now.getTime() - new Date(createdAt).getTime()
  const minutes = Math.floor(diffMs / 60000)

  let escalationStage = "Supervisor Window"
  let timeLeft = ""

  if (minutes < 15) {
    escalationStage = "Supervisor Window"
    timeLeft = `${15 - minutes} mins to GM escalation`
  } else if (minutes < 30) {
    escalationStage = "Escalated to GM"
    timeLeft = `${30 - minutes} mins to Owner escalation`
  } else {
    escalationStage = "Critical Owner Alert"
    timeLeft = "Owner escalation overdue"
  }

  return {
    complaintAgeMinutes: minutes,
    escalationStage,
    timeLeft,
  }
}

function getResolutionTime(
  createdAt: Date,
  resolvedAt: Date | null
) {
  if (!resolvedAt) return "-"

  const diffMs =
    new Date(resolvedAt).getTime() -
    new Date(createdAt).getTime()

  const mins = Math.floor(diffMs / 60000)

  if (mins < 60) return `${mins} mins`

  const hrs = Math.floor(mins / 60)
  const remaining = mins % 60

  return remaining === 0
    ? `${hrs} hr`
    : `${hrs} hr ${remaining} mins`
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const gmUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (!gmUser || gmUser.role !== "GENERAL_MANAGER") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    const assignments = await prisma.washroomAssignment.findMany({
      where: {
        generalManagerId: gmUser.id,
      },
      include: {
        washroom: true,
      },
    })

    const washroomIds = assignments.map((a) => a.washroomId)

    const complaintsRaw = await prisma.complaint.findMany({
      where: {
        washroomId: {
          in: washroomIds,
        },
      },
      include: {
        resolvedBy: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const complaints = complaintsRaw.map((c) => ({
      ...c,
      ...getComplaintTimer(c.createdAt),
      resolutionTime: getResolutionTime(
        c.createdAt,
        c.resolvedAt
      ),
    }))

    const liveComplaints = complaints.filter(
      (c) => c.status !== "POSITIVE_FEEDBACK"
    )

    const escalatedComplaints = complaints.filter(
      (c) =>
        c.complaintAgeMinutes >= 15 &&
        c.status !== "RESOLVED" &&
        c.status !== "POSITIVE_FEEDBACK"
    )

    const totalComplaints = complaints.length
    const openComplaints = complaints.filter(
      (c) => c.status === "OPEN"
    ).length
    const resolvedComplaints = complaints.filter(
      (c) => c.status === "RESOLVED"
    ).length
    const escalatedCount = complaints.filter(
      (c) => c.complaintAgeMinutes >= 15
    ).length
    const criticalCount = complaints.filter(
      (c) => c.complaintAgeMinutes >= 30
    ).length

    return NextResponse.json({
      liveComplaints,
      escalatedComplaints,
      reportComplaints: complaints,
      stats: {
        totalComplaints,
        openComplaints,
        resolvedComplaints,
        escalatedCount,
        criticalCount,
      },
      washrooms: assignments.map((a) => ({
        id: a.washroom.id,
        name: a.washroom.name,
      })),
    })

  } catch (error) {
    console.error("GM DASHBOARD ERROR:", error)

    return NextResponse.json(
      { error: "Dashboard failed" },
      { status: 500 }
    )
  }
}