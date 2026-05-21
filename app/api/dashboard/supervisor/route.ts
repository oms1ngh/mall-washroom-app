import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

function getComplaintTimer(createdAt: Date) {
  const now = new Date()
  const diffMs = now.getTime() - new Date(createdAt).getTime()
  const minutes = Math.floor(diffMs / 60000)

  let escalationStage = "Supervisor Window"

  if (minutes >= 30) {
    escalationStage = "Critical Owner Alert"
  } else if (minutes >= 15) {
    escalationStage = "GM Escalation Window"
  }

  return {
    complaintAgeMinutes: minutes,
    escalationStage,
  }
}

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

    if (!user || user.role !== "SUPERVISOR") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    const assignments = await prisma.washroomAssignment.findMany({
      where: {
        supervisorId: user.id,
      },
      select: {
        washroomId: true,
      },
    })

    const washroomIds = assignments.map((a) => a.washroomId)

    const rawComplaints = await prisma.complaint.findMany({
      where: {
        washroomId: {
          in: washroomIds,
        },
        status: {
          in: ["OPEN", "ESCALATED_TO_GM"],
        },
        cleanlinessStatus: {
          in: ["NOT_CLEAN", "DIRTY"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const complaints = rawComplaints.map((complaint) => ({
      ...complaint,
      ...getComplaintTimer(complaint.createdAt),
    }))

    return NextResponse.json({
      complaints,
    })
  } catch (error) {
    console.error("SUPERVISOR DASHBOARD ERROR:", error)

    return NextResponse.json(
      { error: "Dashboard failed" },
      { status: 500 }
    )
  }
}