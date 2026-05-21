import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function getResolutionTime(createdAt: Date, resolvedAt: Date | null) {
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

function getDynamicStatus(complaint: any) {
  if (
    complaint.cleanlinessStatus === "CLEAN" ||
    complaint.cleanlinessStatus === "VERY_CLEAN"
  ) {
    return "POSITIVE_FEEDBACK"
  }

  if (complaint.resolvedAt) {
    return "RESOLVED"
  }

  const now = new Date()

  const diffMs =
    now.getTime() -
    new Date(complaint.createdAt).getTime()

  const mins = Math.floor(diffMs / 60000)

  if (mins >= 30) {
    return "CRITICAL"
  }

  if (mins >= 15) {
    return "ESCALATED_TO_GM"
  }

  return "OPEN"
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const singleDate = searchParams.get("date")
    const fromDate = searchParams.get("from")
    const toDate = searchParams.get("to")

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

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      include: {
        resolvedBy: {
          select: {
            name: true,
          },
        },
      },
    })

    let openComplaints = 0
    let resolvedComplaints = 0
    let escalatedToGM = 0
    let criticalComplaints = 0
    let positiveFeedbackCount = 0

    const formattedComplaints = complaints.map((c) => {
      const dynamicStatus = getDynamicStatus(c)

      if (dynamicStatus === "OPEN") {
        openComplaints++
      }

      if (dynamicStatus === "RESOLVED") {
        resolvedComplaints++
      }

      if (dynamicStatus === "ESCALATED_TO_GM") {
        escalatedToGM++
      }

      if (dynamicStatus === "CRITICAL") {
        criticalComplaints++
      }

      if (dynamicStatus === "POSITIVE_FEEDBACK") {
        positiveFeedbackCount++
      }

      return {
        ...c,

        issueDescription:
          c.cleanlinessStatus === "CLEAN" ||
          c.cleanlinessStatus === "VERY_CLEAN"
            ? "No action needed"
            : c.issueDescription || "No comment",

        status: dynamicStatus,

        resolvedByName: c.resolvedBy?.name || "-",

        resolutionTime: getResolutionTime(
          c.createdAt,
          c.resolvedAt
        ),
      }
    })

    return NextResponse.json({
      totalComplaints: complaints.length,
      openComplaints,
      resolvedComplaints,
      positiveFeedbackCount,
      escalatedToGM,
      escalatedToDirector: criticalComplaints,
      recentComplaints: formattedComplaints,
    })
  } catch (error) {
    console.error("OWNER DASHBOARD API ERROR:", error)

    return NextResponse.json(
      {
        error: "Dashboard API failed",
      },
      {
        status: 500,
      }
    )
  }
}