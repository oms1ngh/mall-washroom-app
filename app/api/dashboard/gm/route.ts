import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

function getComplaintTimer(createdAt: Date) {
  const now = new Date()

  const diffMs =
    now.getTime() -
    new Date(createdAt).getTime()

  const minutes = Math.floor(
    diffMs / 60000
  )

  let escalationStage =
    "Supervisor Window"

  let timeLeft = ""

  if (minutes < 15) {
    escalationStage =
      "Supervisor Window"

    timeLeft = `${
      15 - minutes
    } mins to GM escalation`
  } else if (minutes < 30) {
    escalationStage =
      "Escalated to GM"

    timeLeft = `${
      30 - minutes
    } mins to Owner escalation`
  } else {
    escalationStage =
      "Critical Owner Alert"

    timeLeft =
      "Owner escalation overdue"
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

  const mins = Math.floor(
    diffMs / 60000
  )

  if (mins < 60) {
    return `${mins} mins`
  }

  const hrs = Math.floor(mins / 60)
  const remaining = mins % 60

  if (remaining === 0) {
    return `${hrs} hr`
  }

  return `${hrs} hr ${remaining} mins`
}

export async function GET(req: Request) {
  try {
    const session =
      await getServerSession(
        authOptions
      )

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      )
    }

    const gmUser =
      await prisma.user.findUnique({
        where: {
          email:
            session.user.email,
        },
      })

    if (
      !gmUser ||
      gmUser.role !==
        "GENERAL_MANAGER"
    ) {
      return NextResponse.json(
        {
          error:
            "Access denied",
        },
        {
          status: 403,
        }
      )
    }

    const { searchParams } =
      new URL(req.url)

    const singleDate =
      searchParams.get("date")

    const fromDate =
      searchParams.get("from")

    const toDate =
      searchParams.get("to")

    const status =
      searchParams.get("status")

    const washroom =
      searchParams.get("washroom")

    const assignments =
      await prisma.washroomAssignment.findMany(
        {
          where: {
            generalManagerId:
              gmUser.id,
          },
          include: {
            washroom: true,
          },
        }
      )

    const washroomIds =
      assignments.map(
        (a) => a.washroomId
      )

    let whereClause: any = {
      washroomId: {
        in: washroomIds,
      },
    }

    if (singleDate) {
      const start = new Date(
        singleDate
      )
      start.setHours(0, 0, 0, 0)

      const end = new Date(
        singleDate
      )
      end.setHours(
        23,
        59,
        59,
        999
      )

      whereClause.createdAt = {
        gte: start,
        lte: end,
      }
    }

    if (fromDate && toDate) {
      const start = new Date(
        fromDate
      )
      start.setHours(0, 0, 0, 0)

      const end = new Date(toDate)
      end.setHours(
        23,
        59,
        59,
        999
      )

      whereClause.createdAt = {
        gte: start,
        lte: end,
      }
    }

    if (status) {
      whereClause.status = status
    }

    if (washroom) {
      whereClause.washroomName =
        washroom
    }

    const complaintsRaw =
      await prisma.complaint.findMany({
        where: whereClause,

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

    let openComplaints = 0
    let resolvedComplaints = 0
    let escalatedCount = 0
    let criticalCount = 0
    let positiveFeedbackCount = 0

    const resolvedItems =
      complaintsRaw.filter(
        (c) => c.resolvedAt
      )

    const avgResolutionMinutes =
      resolvedItems.length > 0
        ? Math.round(
            resolvedItems.reduce(
              (sum, c) =>
                sum +
                (
                  new Date(
                    c.resolvedAt!
                  ).getTime() -
                  new Date(
                    c.createdAt
                  ).getTime()
                ) /
                  60000,
              0
            ) /
              resolvedItems.length
          )
        : 0

    const complaints =
      complaintsRaw.map((c) => {
        if (c.status === "OPEN") {
          openComplaints++
        }

        if (c.resolvedAt) {
          resolvedComplaints++
        }

        if (c.gmNotified) {
          escalatedCount++
        }

        if (c.ownerNotified) {
          criticalCount++
        }

        if (
          c.status ===
          "POSITIVE_FEEDBACK"
        ) {
          positiveFeedbackCount++
        }

        return {
          ...c,
          ...getComplaintTimer(
            c.createdAt
          ),
          resolutionTime:
            getResolutionTime(
              c.createdAt,
              c.resolvedAt
            ),
        }
      })

    const liveComplaints =
      complaints.filter(
        (c) =>
          !c.resolvedAt &&
          c.status !==
            "POSITIVE_FEEDBACK"
      )

    const escalatedComplaints =
      complaints.filter(
        (c) =>
          c.gmNotified ||
          c.ownerNotified
      )

return NextResponse.json({
  liveComplaints,

  escalatedComplaints,

  reportComplaints:
    complaints,

  stats: {
    totalComplaints:
      complaints.length,

    negativeComplaints:
      complaints.length -
      positiveFeedbackCount,

    positiveFeedbackCount,

    openComplaints,

    resolvedComplaints,

    escalatedCount,

    criticalCount,

    avgResolutionMinutes,
  },

  
washrooms:
  assignments.map((a) => ({
    id: a.washroom.id,
    name: a.washroom.name,
  })),


})

        
  } catch (error) {
    console.error(
      "GM DASHBOARD ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Dashboard failed",
      },
      {
        status: 500,
      }
    )
  }
}