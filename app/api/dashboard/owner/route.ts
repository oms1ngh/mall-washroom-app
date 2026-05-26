import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function getResolutionTime(
  createdAt: Date,
  resolvedAt: Date | null
) {
  if (!resolvedAt) return "-"

  const diffMs =
    new Date(resolvedAt).getTime() -
    new Date(createdAt).getTime()

  const mins = Math.floor(diffMs / 60000)

  if (mins < 60) {
    return `${mins} mins`
  }

  const hrs = Math.floor(mins / 60)
  const remainingMins = mins % 60

  if (remainingMins === 0) {
    return `${hrs} hr`
  }

  return `${hrs} hr ${remainingMins} mins`
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const singleDate = searchParams.get("date")
    const fromDate = searchParams.get("from")
    const toDate = searchParams.get("to")
    const status = searchParams.get("status")
    const washroom = searchParams.get("washroom")

    let whereClause: any = {}

    if (singleDate) {
      const start = new Date(singleDate)
      start.setHours(0, 0, 0, 0)

      const end = new Date(singleDate)
      end.setHours(23, 59, 59, 999)

      whereClause.createdAt = {
        gte: start,
        lte: end,
      }
    }

    if (fromDate && toDate) {
      const start = new Date(fromDate)
      start.setHours(0, 0, 0, 0)

      const end = new Date(toDate)
      end.setHours(23, 59, 59, 999)

      whereClause.createdAt = {
        gte: start,
        lte: end,
      }
    }

    if (status) {
      whereClause.status = status
    }

    if (washroom) {
      whereClause.washroomName = washroom
    }

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        resolvedBy: {
          select: {
            name: true,
          },
        },
      },
    })

    const washrooms =
      await prisma.washroom.findMany({
        where: {
          active: true,
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      })

    let openComplaints = 0
    let resolvedComplaints = 0
    let escalatedToGM = 0
    let criticalComplaints = 0
    let positiveFeedbackCount = 0

    const resolvedItems = complaints.filter(
      (c) =>
        c.resolvedAt &&
        c.status === "RESOLVED"
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
            ) / resolvedItems.length
          )
        : 0

    const formattedComplaints =
      complaints.map((c) => {
        if (c.status === "OPEN") {
          openComplaints++
        }

        if (c.resolvedAt) {
          resolvedComplaints++
        }

        if (c.gmNotified) {
          escalatedToGM++
        }

        if (c.ownerNotified) {
          criticalComplaints++
        }

        if (
          c.status ===
          "POSITIVE_FEEDBACK"
        ) {
          positiveFeedbackCount++
        }

        return {
          ...c,
issueDescription:
  c.issueDescription?.trim()
    ? c.issueDescription
    : c.status ===
      "POSITIVE_FEEDBACK"
    ? "Positive feedback"
    : "No comment",

          resolvedByName:
            c.resolvedBy?.name || "-",

          resolutionTime:
            getResolutionTime(
              c.createdAt,
              c.resolvedAt
            ),
        }
      })

    return NextResponse.json({
      totalComplaints:
        complaints.length,

      negativeComplaints:
        complaints.length -
        positiveFeedbackCount,

      openComplaints,

      resolvedComplaints,

      positiveFeedbackCount,

      escalatedToGM,

      escalatedToDirector:
        criticalComplaints,

      avgResolutionMinutes,

      recentComplaints:
        formattedComplaints,

      washrooms,
    })
  } catch (error) {
    console.error(
      "OWNER DASHBOARD API ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Dashboard API failed",
      },
      {
        status: 500,
      }
    )
  }
}